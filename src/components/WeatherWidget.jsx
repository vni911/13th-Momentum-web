import React, { useState, useEffect } from "react";
import { getCurrentCoordinates } from "../api/locationApi";
import { 
  getWeatherDescription, 
  getWeatherGroup, 
  getCurrentWeather 
} from "../api/weatherApi";

const WeatherWidget = ({ onWeatherDataChange }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 사용자의 위치를 가져오기
        console.log("위치 정보 요청 중...");
        const locationData = await getCurrentCoordinates();
        const { latitude, longitude } = locationData;
        console.log("위치 정보:", { latitude, longitude });

        // 현재 날씨 정보 가져오기
        const currentData = await getCurrentWeather(latitude, longitude);
        console.log("현재 날씨 데이터:", currentData);

        setWeather(currentData);

        if (onWeatherDataChange) {
          const weatherDataToSend = {
            temp: currentData.main.temp,
            humidity: currentData.main.humidity,
            description: getWeatherDescription(currentData.weather[0].description),
            feels_like: currentData.main.feels_like
          };
          console.log('WeatherWidget - 부모로 전송할 데이터:', weatherDataToSend);
          onWeatherDataChange(weatherDataToSend);
        }
      } catch (err) {
        console.error("날씨 정보 가져오기 실패:", err);
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setError('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.');
        } else if (err.message.includes('CONNECTION_RESET')) {
          setError('서버 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);



  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            날씨 정보 로딩 중...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          날씨 정보
        </h3>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>날씨 정보를 불러올 수 없습니다</p>
          <p className="text-sm mt-1">{error}</p>
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-left">
            <p>
              <strong>문제 해결 방법:</strong>
            </p>
            <p>브라우저에서 위치 권한을 허용했는지 확인하세요</p>
            <p>인터넷 연결을 확인해주세요</p>
            <p>API 키가 올바르게 설정되었는지 확인하세요</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const desc = getWeatherDescription(weather.weather[0].description);
  const group = getWeatherGroup(desc);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 relative overflow-hidden h-full">
      {/* 날씨 아이콘 및 상태 */}
      {group === "sunny" && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div>
              <span className="text-gray-600 text-sm">{desc}</span>
            </div>
             <div className="animate-bounceSmall absolute top-10 right-[280px] w-[60px] h-[60px] rounded-full bg-[#FFDDBF]"></div>
             <div className="animate-bounceBig absolute bottom-10 right-0 w-[300px] h-[300px] rounded-full bg-[#FFDDBF]"></div>
          </div>
        </div>
      )}

      {group === "cloudy" && (
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
          <div className="animate-bounceBig absolute bottom-10 right-0 w-[300px] h-[300px] rounded-full bg-[#C5C5C5]"></div>
        </div>
      )}

      {group === "rain" && (
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
          <div className="animate-raindropSmall absolute top-10 right-[220px] w-[70px] h-[70px] rounded-full bg-[#BFD4FF]"></div>
          <div className="animate-raindropMid absolute bottom-0 right-[150px] translate-y-[30%] w-[70px] h-[70px] rounded-full bg-[#BFD4FF]"></div>
          <div className="animate-raindropBig absolute bottom-10 right-0 translate-x-[30%] w-[300px] h-[300px] rounded-full bg-[#BFD4FF]"></div>
        </div>
      )}

      {group === "snow" && (
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
        </div>
      )}

      {group === "strom" && (
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
        </div>
      )}

      {group === "mist" && (
        <div className="flex items-center space-x-2 mb-4">
          <div>
            <span className="text-gray-600 text-sm">{desc}</span>
          </div>
        </div>
      )}

       <div className="text-5xl font-bold text-gray-800 mb-4">
         {Math.round(weather.main.temp)}°
       </div>

       <div className="space-y-1 text-sm text-gray-600 absolute bottom-6 left-6">
         <div>습도: {Math.round(weather.main.humidity)}%</div>
       </div>
    </div>
  );
};

export default WeatherWidget;
