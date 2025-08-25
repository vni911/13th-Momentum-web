import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 파라미터터
const AI_MODEL = {
  model: "logistic_regression",
  fields_used: [
    "Patient temperature",
    "Heat Index (HI)",
    "Relative Humidity", 
    "Environmental temperature (C)"
  ],
  coef: [
    2.574003400838424,
    0.21202990703854882,
    13.598795820953342,
    0.3255197628042613
  ],
  intercept: -131.8250160887149,
  positive_class: 1
};

// HI index 계산 함수(머신러닝닝 결과)
const calculateHeatIndex = (humidity, temperature, sun = 0) => {

  const T = temperature;
  const RH = humidity * 100;
  
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  
  //보정
  if (T >= 80) {
    HI = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 6.83783 * Math.pow(10, -3) * T * T - 5.481717 * Math.pow(10, -2) * RH * RH + 1.22874 * Math.pow(10, -3) * T * T * RH + 8.5282 * Math.pow(10, -4) * T * RH * RH - 1.99 * Math.pow(10, -6) * T * T * RH * RH;
  }
  

  HI += 8 * sun;
  
  return HI;
};

// HI index 기반 위험도 계산
const calculateHIRisk = (humidity, temperature, sun = 0) => {
  const heatIndex = calculateHeatIndex(humidity, temperature, sun);
  
  const lowSat = 30;
  const upSat = 41;
  
  if (heatIndex < lowSat) return 0;
  if (heatIndex > upSat) return 1;
  
  return (heatIndex - lowSat) / (upSat - lowSat);
};

// 로지스틱 회귀
const calculateLogisticRegression = (patientTemp, heatIndex, humidity, envTemp) => {
  const features = [patientTemp, heatIndex, humidity, envTemp];
  
  // linear
  let linearCombination = AI_MODEL.intercept;
  for (let i = 0; i < features.length; i++) {
    linearCombination += AI_MODEL.coef[i] * features[i];
  }
  
  // sigmoid
  const probability = 1 / (1 + Math.exp(-linearCombination));
  
  return probability;
};

// 체온 기반 위험도 계산
const calculateCoreTemperatureRisk = (bodyTemp) => {
  const upper = 40;
  const lower = 38;
  
  if (bodyTemp < lower) return 0;
  if (bodyTemp > upper) return 1;
  
  const x = (bodyTemp - lower) / (upper - lower);
  // logistic curve
  return 1 / (1 + Math.exp(3.6 - 7 * x));
};

// 종합 위험도
const calculateCombinedRisk = (CT_prob, HI_prob, LR_prob) => {
  const validProbs = [CT_prob, HI_prob, LR_prob].filter(prob => prob !== null && prob !== undefined);
  
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

const HealthStatusWidget = ({ healthData, weatherData, healthLoading }) => {
  const navigate = useNavigate();
  const [aiPrediction, setAiPrediction] = useState({
    level: "알 수 없음",
    risk: null,
    components: null
  });

  const toHealthPage = () => {
    navigate("/health");
  };

  const isDataAvailable = healthData && !healthLoading;
  // AI 예측 실행
  useEffect(() => {
    if (!healthData || !weatherData) {
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
      return;
    }

    try {
      // 입력 데이터
      const patientTemp = healthData.bodyTemperature || healthData.skinTemperature || 37;
      const envTemp = weatherData.temp || 25;
      const humidity = (weatherData.humidity || 50) / 100;
      const sun = (weatherData.uv && weatherData.uv > 5) ? 1 : 0;
      
      // HI index
      const heatIndex = calculateHeatIndex(humidity, envTemp, sun);
      
      // 각 구성 요소별 위험도
      const CT_prob = calculateCoreTemperatureRisk(patientTemp);
      const HI_prob = calculateHIRisk(humidity, envTemp, sun);
      const LR_prob = calculateLogisticRegression(patientTemp, heatIndex, humidity, envTemp);
      
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
          LR: LR_prob
        }
      });
      
    } catch (error) {
      console.error("AI 예측 오류:", error);
      setAiPrediction({ level: "알 수 없음", risk: null, components: null });
    }
  }, [healthData, weatherData]);

  const levelToStyle = {
    "위험": { box: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
    "경고": { box: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚠️" },
    "안정": { box: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
    "알 수 없음": { box: "bg-gray-50 text-gray-700 border-gray-200", icon: "❓" },
  };

  const displayLevel = aiPrediction.level === "안정" ? "안전" : aiPrediction.level;
  const style = levelToStyle[aiPrediction.level] || levelToStyle["알 수 없음"];

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 cursor-pointer"
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
      <div className={`p-4 rounded-lg border ${style.box} mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{style.icon}</span>
            <span className="text-sm font-semibold">상태: {displayLevel}</span>
          </div>
          {aiPrediction.risk !== null && (
            <span className="text-xs opacity-70">위험도 {(aiPrediction.risk * 100).toFixed(1)}%</span>
          )}
        </div>
      </div>

      {healthLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">심박수 (BPM)</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">체온 (°C)</div>
            <div className="text-3xl font-bold text-gray-900">--</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">심박수 (BPM)</div>
            <div className="text-3xl font-bold text-gray-900">
              {healthData?.heartRate ?? "--"}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
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
  