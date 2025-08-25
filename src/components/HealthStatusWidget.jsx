import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 위젯도 HealthPage와 동일 모델을 내장 사용 (유틸 삭제 시 안전)
const AI_MODEL = {
  coef: [
    2.574003400838424,
    0.21202990703854882,
    13.598795820953342,
    0.3255197628042613,
  ],
  intercept: -131.8250160887149,
};

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

const calculateHIRisk = (humidityRatio, temperatureC, sun = 0) => {
  const hi = calculateHeatIndexC(humidityRatio, temperatureC, sun);
  const lowSat = 30;
  const upSat = 41;
  if (hi < lowSat) return 0;
  if (hi > upSat) return 1;
  return (hi - lowSat) / (upSat - lowSat);
};

const calculateCoreTemperatureRisk = (bodyTempC) => {
  if (bodyTempC >= 39) return 1;
  const upper = 38.8;
  const lower = 37.5;
  if (bodyTempC < lower) return 0;
  if (bodyTempC > upper) return 1;
  const x = (bodyTempC - lower) / (upper - lower);
  return 1 / (1 + Math.exp(2.0 - 8 * x));
};

const calculateLogisticRegression = (patientTempC, heatIndexC, humidityRatio, envTempC) => {
  const features = [patientTempC, heatIndexC, humidityRatio, envTempC];
  let z = AI_MODEL.intercept;
  for (let i = 0; i < features.length; i++) z += AI_MODEL.coef[i] * features[i];
  return 1 / (1 + Math.exp(-z));
};

const calculateCombinedRisk = (CT_prob, HI_prob, LR_prob) => {
  const vals = [CT_prob, HI_prob, LR_prob].filter(v => v != null);
  if (!vals.length) return null;
  return 0.6 * CT_prob + 0.25 * LR_prob + 0.15 * HI_prob;
};

const getRiskLevel = (risk) => {
  if (risk == null) return "알 수 없음";
  if (risk >= 0.5) return "위험";
  if (risk >= 0.3) return "경고";
  return "안정";
};

// 로컬 계산 로직은 공통 유틸을 사용합니다.

const HealthStatusWidget = ({ healthData, weatherData, healthLoading }) => {
  const navigate = useNavigate();
  const [aiPrediction, setAiPrediction] = useState({
    level: "알 수 없음",
    risk: null,
    components: null,
  });

  const toHealthPage = () => {
    navigate("/health");
  };
  // AI 예측 실행
  useEffect(() => {
    if (!healthData || !weatherData) {
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
      return;
    }

    try {
      // 입력 데이터 (실제 값 사용, 기본값 최소화)
      const patientTemp =
        healthData.bodyTemperature || healthData.skinTemperature || 37;
      const envTemp = weatherData.temp;
      const humidity = weatherData.humidity ? (weatherData.humidity / 100) : 0.5;
      const sun = weatherData.uv && weatherData.uv > 5 ? 1 : 0;

      console.log("HealthStatusWidget - AI 예측 입력 데이터:", {
        patientTemp,
        envTemp,
        humidity,
        sun,
        weatherData
      });

      // HI index (공통 유틸)
      const heatIndex = calculateHeatIndexC(humidity, envTemp, sun);

      // 각 구성 요소별 위험도
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

      console.log("HealthStatusWidget - AI 예측 결과:", {
        CT_prob,
        HI_prob,
        LR_prob,
        combinedRisk,
        level
      });

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

  return (
    <div
      className="bg-white p-6 rounded-[30px] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 cursor-pointer"
      onClick={toHealthPage}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">건강 상태</h3>
        <span className="text-xs text-gray-500">
          {healthData?.measurementTime
            ? new Date(healthData.measurementTime).toLocaleTimeString()
            : "-"}
        </span>
      </div>

      {/* AI 예측 배지 */}
      <div className={`p-4 rounded-[20px] border ${style.box} mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{style.icon}</span>
            <span className="text-sm font-semibold">상태: {displayLevel}</span>
          </div>
          {aiPrediction.risk !== null && (
            <span className="text-xs opacity-70">
              위험도 {(aiPrediction.risk * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {healthLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-[20px] bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">심박수 (BPM)</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </div>
          <div className="p-4 rounded-[20px] bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">체온 (°C)</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-[20px] bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">심박수 (BPM)</div>
            <div className="text-3xl font-bold text-gray-900">
              {healthData?.heartRate ?? "--"}
            </div>
          </div>
          <div className="p-4 rounded-[20px] bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">체온 (°C)</div>
            <div className="text-3xl font-bold text-gray-900">
              {healthData?.bodyTemperature ?? "--"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthStatusWidget;
