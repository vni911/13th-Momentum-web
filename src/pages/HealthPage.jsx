import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestHealth } from "../api/healthApi";
import { getCurrentLocation } from "../api/locationApi";
import AIPrediction from "../components/AIPrediction";
import Pin from "../assets/LocationPin.svg";

const HealthPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("위치 확인 중...");
  const [healthData, setHealthData] = useState(null);
  const [aiLevel, setAiLevel] = useState("알 수 없음");

  const goBack = () => navigate(-1);

  // 예측 결과
  const fetchAILevel = async () => {
    if (!healthData) return;
    try {
      let level = "알 수 없음";

      if (healthData.heartRate && healthData.bodyTemperature) {
        const heartRate = healthData.heartRate;
        const temperature = healthData.bodyTemperature;

        if (
          heartRate > 100 ||
          heartRate < 60 ||
          temperature > 37.5 ||
          temperature < 36.5
        ) {
          level = "위험";
        } else if (
          heartRate > 90 ||
          heartRate < 70 ||
          temperature > 37.2 ||
          temperature < 36.8
        ) {
          level = "경고";
        } else {
          level = "안정";
        }
      }

      setAiLevel(level);
    } catch (error) {
      console.error("AI 예측 실패:", error);
      setAiLevel("알 수 없음");
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
        const data = await getLatestHealth();
        setHealthData(data);
      } catch (error) {
        console.error("건강 데이터 가져오기 실패:", error);
      }
    };

    getLocation();
    fetchHealth();

    const healthTimer = setInterval(fetchHealth, 5000);

    return () => {
      clearInterval(healthTimer);
    };
  }, []);

  // 데이터 업데이트
  useEffect(() => {
    fetchAILevel();
  }, [healthData]);

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
              aiLevel
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
                      (심박수 • 체온 기준)
                    </span>
                  </div>
                </div>
                <div className="w-full border-1 bg-[#434EB4] h-1.5 rounded-3xl"></div>
                <AIPrediction
                  healthData={healthData}
                  weatherData={null}
                  showDetails={true}
                />
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
