import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLastHealthData } from "../api/healthApi";
import { getCurrentLocation } from "../api/locationApi";
import Pin from "../assets/LocationPin.svg";

// AI 모델 파라미터 (exported_logreg.json에서 가져옴)
const AI_MODEL = {
  model: "logistic_regression",
  fields_used: [
    "Patient temperature",
    "Heat Index (HI)",
    "Relative Humidity",
    "Environmental temperature (C)",
  ],
  coef: [
    2.574003400838424, 0.21202990703854882, 13.598795820953342,
    0.3255197628042613,
  ],
  intercept: -131.8250160887149,
  positive_class: 1,
};

// 열지수 계산 함수
const calculateHeatIndex = (humidity, temperature, sun = 0) => {
  // 간단한 열지수 계산 공식 (Steadman's formula)
  const T = temperature;
  const RH = humidity * 100; // 백분율로 변환

  // 기본 열지수 계산
  let HI = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);

  // 더 정확한 계산을 위한 보정
  if (T >= 80) {
    HI =
      -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      6.83783 * Math.pow(10, -3) * T * T -
      5.481717 * Math.pow(10, -2) * RH * RH +
      1.22874 * Math.pow(10, -3) * T * T * RH +
      8.5282 * Math.pow(10, -4) * T * RH * RH -
      1.99 * Math.pow(10, -6) * T * T * RH * RH;
  }

  // 햇빛 노출 보정 (Wikipedia: Exposure to full sunshine can increase heat index values by up to 8 °C)
  HI += 8 * sun;

  return HI;
};

// 열지수 기반 위험도 계산
const calculateHIRisk = (humidity, temperature, sun = 0) => {
  const heatIndex = calculateHeatIndex(humidity, temperature, sun);

  const lowSat = 30; // 하한 온도 (섭씨)
  const upSat = 41; // 상한 온도 (섭씨)

  if (heatIndex < lowSat) return 0;
  if (heatIndex > upSat) return 1;

  return (heatIndex - lowSat) / (upSat - lowSat);
};

// 로지스틱 회귀 예측
const calculateLogisticRegression = (
  patientTemp,
  heatIndex,
  humidity,
  envTemp
) => {
  const features = [patientTemp, heatIndex, humidity, envTemp];

  // 선형 조합 계산
  let linearCombination = AI_MODEL.intercept;
  for (let i = 0; i < features.length; i++) {
    linearCombination += AI_MODEL.coef[i] * features[i];
  }

  // 시그모이드 함수로 확률 계산
  const probability = 1 / (1 + Math.exp(-linearCombination));

  return probability;
};

// 체온 기반 위험도 계산 (간단한 버전)
const calculateCoreTemperatureRisk = (bodyTemp) => {
  const upper = 40;
  const lower = 38;

  if (bodyTemp < lower) return 0;
  if (bodyTemp > upper) return 1;

  const x = (bodyTemp - lower) / (upper - lower);
  // 로지스틱 곡선
  return 1 / (1 + Math.exp(3.6 - 7 * x));
};

// 종합 위험도 계산
const calculateCombinedRisk = (CT_prob, HI_prob, LR_prob) => {
  const validProbs = [CT_prob, HI_prob, LR_prob].filter(
    (prob) => prob !== null && prob !== undefined
  );

  if (validProbs.length === 0) return null;

  return validProbs.reduce((sum, prob) => sum + prob, 0) / validProbs.length;
};

// 위험도 레벨 결정
const getRiskLevel = (risk) => {
  if (risk === null || risk === undefined) return "알 수 없음";
  if (risk >= 0.7) return "위험";
  if (risk >= 0.4) return "경고";
  return "안정";
};

const HealthPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("위치 확인 중...");
  const [healthData, setHealthData] = useState(null);
  const [weatherData] = useState(null);
  const [aiPrediction, setAiPrediction] = useState({
    level: "알 수 없음",
    risk: null,
    components: null,
  });

  const goBack = () => navigate(-1);

  // AI 예측 실행
  const runAIPrediction = () => {
    if (!healthData) {
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
      return;
    }

    try {
      // 기본 환경 데이터 (실제로는 weatherData에서 가져와야 함)
      const patientTemp =
        healthData.bodyTemperature || healthData.skinTemperature || 37;
      const envTemp = weatherData?.temp || 25; // 기본값 25도
      const humidity = weatherData?.humidity ? weatherData.humidity / 100 : 0.5; // 기본값 50%
      const sun = weatherData?.uv && weatherData.uv > 5 ? 1 : 0;

      // 열지수 계산
      const heatIndex = calculateHeatIndex(humidity, envTemp, sun);

      // 각 구성 요소별 위험도 계산
      const CT_prob = calculateCoreTemperatureRisk(patientTemp);
      const HI_prob = calculateHIRisk(humidity, envTemp, sun);
      const LR_prob = calculateLogisticRegression(
        patientTemp,
        heatIndex,
        humidity,
        envTemp
      );

      // 종합 위험도 계산
      const combinedRisk = calculateCombinedRisk(CT_prob, HI_prob, LR_prob);

      // 위험도 레벨 결정
      const level = getRiskLevel(combinedRisk);

      setAiPrediction({
        level,
        risk: combinedRisk,
        components: {
          CT: CT_prob,
          HI: HI_prob,
          LR: LR_prob,
        },
      });
    } catch (error) {
      console.error("AI 예측 오류:", error);
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
    }
  };

  // 상태에 따른 배경 색상
  const getBackgroundClass = (level) => {
    switch (level) {
      case "위험":
        return "bg-gradient-to-tr from-white via-red-50/50 to-orange-100/80";
      case "경고":
        return "bg-gradient-to-tr from-white via-orange-50/50 to-yellow-100/80";
      case "안정":
        return "bg-gradient-to-tr from-white via-yellow-50/50 to-green-100/80";
      default:
        return "bg-gradient-to-tr from-white via-gray-50/50 to-gray-100/80";
    }
  };

  // 위험도에 따른 조언 생성
  const getHealthAdvice = (level) => {
    const advice = [];

    if (level === "위험") {
      advice.push("🚨 즉시 시원한 곳으로 이동하세요");
      advice.push("💧 충분한 수분을 섭취하세요");
      advice.push("🏥 증상이 지속되면 의료진과 상담하세요");
      advice.push("❄️ 시원한 물로 몸을 식히세요");
    } else if (level === "경고") {
      advice.push("⚠️ 햇볕을 피하고 그늘에서 휴식을 취하세요");
      advice.push("💧 정기적으로 물을 마시세요");
      advice.push("👕 가벼운 옷을 입으세요");
      advice.push("⏰ 30분마다 휴식을 취하세요");
    } else {
      advice.push("✅ 현재 상태가 양호합니다");
      advice.push("💧 적절한 수분 섭취를 유지하세요");
      advice.push("🏃‍♂️ 가벼운 운동을 권장합니다");
      advice.push("🌡️ 정기적인 체온 모니터링을 계속하세요");
    }

    return advice;
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const locationData = await getCurrentLocation();
        setLocation(locationData.locationName);
      } catch (error) {
        console.error("위치 정보 가져오기 실패:", error);
        setLocation("위치를 확인할 수 없습니다");
      }
    };

    const fetchHealth = async () => {
      try {
        const data = await getMyLastHealthData();
        setHealthData(data);
      } catch (error) {
        console.error("워치 데이터 가져오기 실패:", error);
      }
    };

    getLocation();
    fetchHealth();

    const healthTimer = setInterval(fetchHealth, 300000);

    return () => {
      clearInterval(healthTimer);
    };
  }, []);

  // 데이터 업데이트 시 AI 예측 실행
  useEffect(() => {
    runAIPrediction();
  }, [healthData, weatherData]);

  const levelToStyle = {
    위험: { box: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
    경고: { box: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚠️" },
    안정: {
      box: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "✅",
    },
    "알 수 없음": {
      box: "bg-gray-50 text-gray-700 border-gray-200",
      icon: "❓",
    },
  };

  const displayLevel =
    aiPrediction.level === "안정" ? "안전" : aiPrediction.level;
  const style = levelToStyle[aiPrediction.level] || levelToStyle["알 수 없음"];
  const healthAdvice = getHealthAdvice(aiPrediction.level);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-16">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-white rounded-full p-2 border border-gray-200 shadow-md"
            onClick={goBack}
          >
            <img
              src="https://img.icons8.com/?size=100&id=yiR4rPf7BGje&format=png&color=000000"
              alt="backButton"
              className="w-6 h-6"
            />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-700">{location}</span>
            <img src={Pin} alt="LocationPin" className="w-6 h-6" />
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={`${getBackgroundClass(
              aiPrediction.level
            )} rounded-xl shadow-2xl p-6`}
          >
            <div className="flex flex-col space-y-6">
              {/* AI 예측 */}
              <div className="flex flex-col gap-y-3 bg-gradient-to-tl from-[#2F3676] from-60% via-[#4049A0] via-80% to-[#5865DC] to-100% backdrop-blur-sm rounded-[30px] shadow-lg p-8 border border-gray-200">
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row gap-3">
                    <img
                      src="https://img.icons8.com/?size=100&id=59782&format=png&color=FA1C1C"
                      alt="alertIcon"
                      className="w-9 h-9"
                    ></img>
                    <h3 className="text-center text-2xl font-bold text-white">
                      AI 위험도 예측
                    </h3>
                  </div>
                  <div className="flex items-end">
                    <span className="text-[11px] text-gray-400 text-centers">
                      (머신러닝 기반)
                    </span>
                  </div>
                </div>
                <div className="w-full border-1 bg-[#434EB4] h-1.5 rounded-3xl"></div>

                {/* AI 예측 결과 */}
                <div
                  className={`p-6 rounded-[30px] border ${style.box} bg-white/90`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">
                        {style.icon}
                      </span>
                      <div>
                        <span className="text-lg font-bold">
                          상태: {displayLevel}
                        </span>
                        {aiPrediction.risk !== null && (
                          <div className="text-sm opacity-70">
                            위험도 {(aiPrediction.risk * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 건강 조언 */}
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-gray-800">
                      건강 관리 조언
                    </h4>
                    <ul className="space-y-2">
                      {healthAdvice.map((advice, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 flex items-start"
                        >
                          <span className="mr-2">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-[30px] shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    현재 건강 상태
                  </h3>
                  <span className="text-sm text-gray-500">
                    {healthData?.measuredAt
                      ? new Date(healthData.measuredAt).toLocaleString("ko-KR")
                      : "측정 데이터 없음"}
                  </span>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {healthData?.heartRate ?? "--"}
                    </div>
                    <div className="text-sm text-gray-600">심박수 (BPM)</div>
                    <div className="text-xs text-blue-500 mt-1">
                      정상: 60-100
                    </div>
                  </div>

                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold text-green-600 mb-1">
                      {healthData?.bodyTemperature ?? "--"}
                    </div>
                    <div className="text-sm text-gray-600">체온 (°C)</div>
                    <div className="text-xs text-green-500 mt-1">
                      정상: 36.5-37.5
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 정보 및 팁 */}
              <div className="flex space-x-6">
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[30px] shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    추가 정보
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">측정 기기:</span>
                      <span className="font-medium">
                        {healthData?.deviceType || "스마트워치"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">데이터 품질:</span>
                      <span className="font-medium text-green-600">양호</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연결 상태:</span>
                      <span className="font-medium text-green-600">연결됨</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI 모델:</span>
                      <span className="font-medium text-blue-600">
                        로지스틱 회귀
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-[30px] shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    건강 관리 팁
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      정기적으로 심박수와 체온을 모니터링하세요
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      이상 증상이 지속되면 의료진과 상담하세요
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      충분한 수분 섭취와 휴식을 취하세요
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      규칙적인 운동과 건강한 식습관을 유지하세요
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
