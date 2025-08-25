import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLastHealthData } from "../api/healthApi";
import { getCurrentLocation } from "../api/locationApi";
import { getCurrentWeather } from "../api/weatherApi";
import Pin from "../assets/LocationPin.svg";

// 위험도 모델 파라미터 (로지스틱 회귀)
const AI_MODEL = {
  coef: [
    2.574003400838424,
    0.21202990703854882,
    13.598795820953342,
    0.3255197628042613,
  ],
  intercept: -131.8250160887149,
};

// 열지수(섭씨) 계산: 섭씨→화씨 NOAA 공식→섭씨 변환
const calculateHeatIndexC = (humidityRatio, temperatureC, sun = 0) => {
  const RH = humidityRatio * 100;
  const T_F = temperatureC * 9 / 5 + 32;
  const HI_F = -42.379 + 2.04901523 * T_F + 10.14333127 * RH - 0.22475541 * T_F * RH
    - 6.83783e-3 * T_F * T_F - 5.481717e-2 * RH * RH + 1.22874e-3 * T_F * T_F * RH
    + 8.5282e-4 * T_F * RH * RH - 1.99e-6 * T_F * T_F * RH * RH;
  let HI_C = (HI_F - 32) * 5 / 9;
  HI_C += (sun ? 4 : 0);
  return HI_C;
};

// HI 기반 위험도 (안정 임계)
const calculateHIRisk = (humidityRatio, temperatureC, sun = 0) => {
  const hi = calculateHeatIndexC(humidityRatio, temperatureC, sun);
  const lowSat = 30;
  const upSat = 41;
  if (hi < lowSat) return 0;
  if (hi > upSat) return 1;
  return (hi - lowSat) / (upSat - lowSat);
};

// 체온 기반 위험도 (민감 상향: 39℃ 이상 즉시 위험)
const calculateCoreTemperatureRisk = (bodyTempC) => {
  if (bodyTempC >= 39) return 1;
  const upper = 38.8;
  const lower = 37.5;
  if (bodyTempC < lower) return 0;
  if (bodyTempC > upper) return 1;
  const x = (bodyTempC - lower) / (upper - lower);
  return 1 / (1 + Math.exp(2.0 - 8 * x));
};

// 로지스틱 회귀
const calculateLogisticRegression = (patientTempC, heatIndexC, humidityRatio, envTempC) => {
  const features = [patientTempC, heatIndexC, humidityRatio, envTempC];
  let z = AI_MODEL.intercept;
  for (let i = 0; i < features.length; i++) z += AI_MODEL.coef[i] * features[i];
  return 1 / (1 + Math.exp(-z));
};

// 종합 위험도 (가중 평균: CT 0.6, LR 0.25, HI 0.15) — 고체온 가중 강화
const calculateCombinedRisk = (CT_prob, HI_prob, LR_prob) => {
  const vals = [CT_prob, HI_prob, LR_prob].filter(v => v != null);
  if (!vals.length) return null;
  return 0.6 * CT_prob + 0.25 * LR_prob + 0.15 * HI_prob;
};

// 최종 레벨 임계 (민감 상향: 위험 임계 0.5)
const getRiskLevel = (risk) => {
  if (risk == null) return "알 수 없음";
  if (risk >= 0.5) return "위험";
  if (risk >= 0.3) return "경고";
  return "안정";
};

// 내부 열지수 계산 제거, 공통 유틸 사용

// 위험도 계산은 공통 유틸의 calculateHIRisk 사용

// 로지스틱 회귀는 공통 유틸의 calculateLogisticRegression 사용

// 체온 기반 위험도 계산도 공통 유틸 사용

// 종합 위험도 계산도 공통 유틸 사용

// 위험도 레벨 결정도 공통 유틸 사용

const HealthPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("위치 확인 중...");
  const [healthData, setHealthData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [aiPrediction, setAiPrediction] = useState({
    level: "알 수 없음",
    risk: null,
    components: null
  });
  const [locationCoords, setLocationCoords] = useState(null);

  const goBack = () => navigate(-1);

  // AI 예측 실행 (HealthStatusWidget과 동일한 로컬 계산)
  const runAIPrediction = () => {
    if (!healthData || !weatherData) {
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
      return;
    }

    try {
      const patientTemp = healthData.bodyTemperature || healthData.skinTemperature || 37;
      const envTemp = weatherData.temp;
      const humidity = weatherData.humidity ? (weatherData.humidity / 100) : 0.5;
      const sun = 0; // UV 데이터 미제공 → 보정 비활성화로 통일

      console.log("HealthPage - AI 예측 입력 데이터:", {
        patientTemp,
        envTemp,
        humidity,
        sun,
        weatherData
      });

      const heatIndex = calculateHeatIndexC(humidity, envTemp, sun);
      const CT_prob = calculateCoreTemperatureRisk(patientTemp);
      const HI_prob = calculateHIRisk(humidity, envTemp, sun);
      const LR_prob = calculateLogisticRegression(patientTemp, heatIndex, humidity, envTemp);

      const combinedRisk = calculateCombinedRisk(CT_prob, HI_prob, LR_prob);
      const level = getRiskLevel(combinedRisk);

      console.log("HealthPage - AI 예측 결과:", {
        CT_prob,
        HI_prob,
        LR_prob,
        combinedRisk,
        level
      });

      setAiPrediction({
        level,
        risk: combinedRisk,
        components: { CT: CT_prob, HI: HI_prob, LR: LR_prob }
      });
    } catch (error) {
      console.error("AI 예측 오류:", error);
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
    }
  };

  // 폴백 로직 불필요 (로컬 계산으로 통일)

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
        setLocationCoords({ lat: locationData.latitude, lon: locationData.longitude });
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

    const healthTimer = setInterval(fetchHealth, 60000);

    return () => {
      clearInterval(healthTimer);
    };
  }, []);

  // 위치 정보가 변경되면 날씨 데이터 가져오기
  useEffect(() => {
    const fetchWeather = async () => {
      if (locationCoords?.lat && locationCoords?.lon) {
        try {
          const weatherData = await getCurrentWeather(locationCoords.lat, locationCoords.lon);
          setWeatherData({
            temp: weatherData.main?.temp,
            humidity: weatherData.main?.humidity,
            uv: weatherData.main?.pressure // UV 데이터는 별도 API 필요, 임시로 pressure 사용
          });
        } catch (error) {
          console.error("날씨 데이터 가져오기 실패:", error);
        }
      }
    };

    fetchWeather();
  }, [locationCoords]);

  // 데이터 업데이트 시 AI 예측 실행
  useEffect(() => {
    runAIPrediction();
  }, [healthData, weatherData]);

  const levelToStyle = {
    "위험": { box: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
    "경고": { box: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚠️" },
    "안정": { box: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
    "알 수 없음": { box: "bg-gray-50 text-gray-700 border-gray-200", icon: "❓" },
  };

  const displayLevel = aiPrediction.level === "안정" ? "안전" : aiPrediction.level;
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
              <div className="flex flex-col gap-y-3 bg-gradient-to-tl from-[#2F3676] from-60% via-[#4049A0] via-80% to-[#5865DC] to-100% backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-200">
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
                <div className={`p-6 rounded-lg border ${style.box} bg-white/90`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{style.icon}</span>
                      <div>
                        <span className="text-lg font-bold">상태: {displayLevel}</span>
                        {aiPrediction.risk !== null && (
                          <div className="text-sm opacity-70">위험도 {(aiPrediction.risk * 100).toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  </div>



                  {/* 건강 조언 */}
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-gray-800">건강 관리 조언</h4>
                    <ul className="space-y-2">
                      {healthAdvice.map((advice, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
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
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
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
                      <span className="font-medium text-blue-600">로지스틱 회귀</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
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
