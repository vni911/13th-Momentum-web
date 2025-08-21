import React, { useEffect, useState } from "react";
import { predictRiskSmart } from "../api/aiApi";

const levelToStyle = {
  "위험": { box: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
  "경고": { box: "bg-amber-50 text-amber-700 border-amber-200", icon: "⚠️" },
  "안정": { box: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "✅" },
  "알 수 없음": { box: "bg-gray-50 text-gray-700 border-gray-200", icon: "❓" },
};

const AIPrediction = ({ healthData, weatherData, showDetails = false }) => {
  const [level, setLevel] = useState("알 수 없음");
  const [prob, setProb] = useState(null);
  const [components, setComponents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      if (!healthData || !weatherData) return;
      try {
        setLoading(true);
        setError(null);
        const payload = {
          hr: (healthData && healthData.heartRate != null) ? healthData.heartRate : null,
          skin_temp: (healthData && healthData.skinTemperature != null)
            ? healthData.skinTemperature
            : ((healthData && healthData.bodyTemperature != null) ? healthData.bodyTemperature : null),
          env_temp: (weatherData && weatherData.temp != null) ? weatherData.temp : null,
          humidity: (weatherData && weatherData.humidity != null) ? (weatherData.humidity / 100) : null,
          sun: (weatherData && weatherData.uv != null && weatherData.uv > 5) ? 1 : 0,
        };
        const res = await predictRiskSmart(payload);
        setLevel((res && res.level) ? res.level : "알 수 없음");
        setProb((res && res.prob != null) ? res.prob : null);
        setComponents((res && res.components) ? res.components : null);
      } catch (e) {
        setError(e);
        setLevel("알 수 없음");
        setProb(null);
        setComponents(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [healthData, weatherData]);

  const displayLevel = level === "안정" ? "안전" : level;
  const style = levelToStyle[level] || levelToStyle["알 수 없음"];

  if (loading) {
    return (
      <div className="p-4 rounded-lg border bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span>AI 예측 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border bg-white">
        <div className="text-red-600 text-sm">AI 예측을 불러오지 못했습니다.</div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${style.box}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{style.icon}</span>
          <span className="text-sm font-semibold">상태: {displayLevel}</span>
        </div>
        {prob != null && (
          <span className="text-xs opacity-70">위험도 {(prob * 100).toFixed(1)}%</span>
        )}
      </div>

      {showDetails && components && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="p-2 rounded bg-blue-50 border border-blue-200">
            <div className="text-[11px] text-blue-700 mb-1">체온</div>
            <div className="text-sm font-semibold text-blue-900">{(components.CT * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200">
            <div className="text-[11px] text-amber-700 mb-1">열지수</div>
            <div className="text-sm font-semibold text-amber-900">{(components.HI * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2 rounded bg-purple-50 border border-purple-200">
            <div className="text-[11px] text-purple-700 mb-1">로지스틱</div>
            <div className="text-sm font-semibold text-purple-900">{(components.LR * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPrediction;


