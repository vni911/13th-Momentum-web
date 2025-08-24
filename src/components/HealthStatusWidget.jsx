import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AIPrediction from "./AIPrediction";

const HealthStatusWidget = ({ healthData, weatherData, healthLoading }) => {
  const navigate = useNavigate();

  const toHealthPage = () => {
    navigate("/health");
  };

  const isDataAvailable = healthData && !healthLoading;

  return (
    <>
      {!isDataAvailable ? (
        <div
          className="bg-red-500 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 cursor-pointer"
          onClick={() =>
            alert("워치가 연결되지 않아 상세 페이지를 불러올 수 없습니다.")
          }
        >
          <div className="flex justify-center items-center h-full">
            <h2 className="font-bold text-2xl text-white text-center">
              워치가 연결되지 않았습니다.
            </h2>
          </div>
        </div>
      ) : (
        <>
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

            {/* AI 예측 배지 + 상세 */}
            <div className="mb-4">
              <AIPrediction
                healthData={healthData}
                weatherData={weatherData}
                showDetails={false}
              />
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
        </>
      )}
    </>
  );
};

export default HealthStatusWidget;

{
  /*  */
}
