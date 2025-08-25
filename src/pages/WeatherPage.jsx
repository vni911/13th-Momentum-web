import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pin from "../assets/LocationPin.svg";
import ClearBg from "../assets/clear-bg.svg";
import SunIcon from "../assets/Sun Outline.svg";
import CloudIcon from "../assets/Cloud Outline.svg";
import RainIcon from "../assets/Rainy Outline.svg";
import SnowIcon from "../assets/Snow Outline.svg";
import ThunderIcon from "../assets/Thunder Outline.svg";
import FogIcon from "../assets/Fog Outline.svg";
import { getCurrentLocation } from "../api/locationApi";
import {
  getWeatherDescription,
  getWeatherGroup,
  getCurrentWeather,
  getWeatherForecast,
  getWeatherIconName,
} from "../api/weatherApi";

//npm recharts 설치치
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WeatherPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("위치 확인 중...");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [hourlyForecastData, setHourlyForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const goBack = () => navigate(-1);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // 날씨,위치 정보
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!apiKey) {
        throw new Error("OpenWeather API 키가 설정되지 않았습니다.");
      }

      const locationData = await getCurrentLocation();
      setLocation(locationData.locationName);

      const { latitude, longitude } = locationData;

      const weatherData = await getCurrentWeather(latitude, longitude);

      const forecastResult = await getWeatherForecast(latitude, longitude);

      const dailyData = {};
      forecastResult.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString("ko-KR", {
          weekday: "short",
        });
        if (!dailyData[date]) {
          dailyData[date] = {
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            weather: item.weather[0].description,
            icon: item.weather[0].icon,
          };
        } else {
          dailyData[date].temp_min = Math.min(
            dailyData[date].temp_min,
            item.main.temp_min
          );
          dailyData[date].temp_max = Math.max(
            dailyData[date].temp_max,
            item.main.temp_max
          );
        }
      });

      const HourlyData = forecastResult.list.slice(0, 8).map((item) => ({
        time: new Date(item.dt * 1000).getHours() + "시",
        temp: Math.round(item.main.temp),
      }));

      setWeatherData(weatherData);
      setForecastData(Object.values(dailyData));
      setHourlyForecastData(HourlyData);
    } catch (err) {
      console.error("데이터 가져오기 실패:", err);
      setError(err.message);
      setLocation("위치를 확인할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const currentDesc = weatherData
    ? getWeatherDescription(weatherData.weather[0].description)
    : "";
  const group = getWeatherGroup(currentDesc);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CCE3F8] from-40% via-[#FFF4E8] via-70% to-[#FFF4E8] to-100% overflow-hidden relative animate-in fade-in duration-600 slide-in-from-bottom-2">
      {/* 배경 */}
      <div className="absolute inset-0 opacity-10 -z-10">
        <img
          src={ClearBg}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-12 py-16">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center">
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
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-700">
                {location}
              </span>
              <img src={Pin} alt="LocationPin" className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="bg-white/60 rounded-[30px] p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  날씨 정보 로딩 중...
                </span>
              </div>
            ) : error ? (
              <div className="bg-white/60 rounded-[30px] p-6 text-center text-red-600">
                <p>날씨 정보를 불러올 수 없습니다</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : weatherData ? (
              <div className="bg-white/60 p-6 rounded-[30px] relative overflow-hidden">
                <div className="flex items-center space-x-2 mb-4">
                  {group === "sunny" && (
                    <>
                      <div className="absolute top-0 right-0 w-[300px] h-[300px] translate-y-[-40%] rounded-full bg-[#FFDDBF]"></div>
                      <div className="absolute top-20 right-[320px] w-[90px] h-[90px] rounded-full bg-[#FFDDBF]"></div>
                    </>
                  )}
                  {group === "cloudy" && (
                    <div className="absolute right-0 w-[300px] h-[300px] rounded-full bg-[#C5C5C5]"></div>
                  )}
                  {group === "rain" && (
                    <>
                      <div className="absolute top-0 right-0 w-[300px] h-[300px] translate-y-[-40%] rounded-full bg-[#BFD4FF]"></div>
                      <div className="absolute top-4 right-[350px] w-[100px] h-[100px] rounded-full bg-[#BFD4FF]"></div>
                      <div className="absolute top-20 right-[280px] translate-y-[30%] w-[95px] h-[95px] rounded-full bg-[#BFD4FF]"></div>
                    </>
                  )}
                </div>
                <div className="mb-10">
                  <span className="text-2xl font-bold text-gray-900 mt-1">
                    {location}
                  </span>
                  <div className="text-5xl font-bold text-black mb-4">
                    {Math.round(weatherData.main.temp)}°
                  </div>
                  <div className="flex items-start gap-6">
                    <span className="text-sm text-black">
                      체감 기온은{" "}
                      <span>{Math.round(weatherData.main.feels_like)}°, </span>
                      {currentDesc}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-black">자외선: 낮음</span>
                      <span className="text-sm text-black">
                        습도: {weatherData.main.humidity}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                  <div className="lg:col-span-2 p-5 border rounded-[30px] bg-white/40">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={hourlyForecastData}
                        margin={{ top: 20, right: 30, left: 15, bottom: 20 }}
                      >
                        <XAxis
                          dataKey="time"
                          axisLine={{ stroke: "#000000", strokeWidth: 1 }}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#666" }}
                          tickFormatter={(tick) => `${tick}°`}
                          domain={[20, 40]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                          formatter={(value) => [value + "°", "온도"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#FF0000"
                          strokeWidth={2}
                          fillOpacity={0}
                          fill="none"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 예보 그래프 */}
                  <div className="p-5 h-full flex flex-col">
                    <div className="flex flex-col justify-between flex-1">
                      {forecastData?.slice(1, 6).map((item, index) => {
                        let dayText;
                        if (index === 0) {
                          dayText = "내일";
                        } else {
                          const today = new Date();
                          const futureDate = new Date(today);
                          futureDate.setDate(today.getDate() + index + 1);
                          dayText = futureDate.toLocaleDateString("ko-KR", {
                            weekday: "short",
                          });
                        }
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <p className="text-lg font-bold text-gray-700">
                                {dayText}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-bold text-black">
                                {Math.round(item.temp_min)}°/
                                {Math.round(item.temp_max)}°
                              </p>
                              <img
                                src={(() => {
                                  const iconName = getWeatherIconName(
                                    getWeatherDescription(item.weather)
                                  );
                                  const iconMap = {
                                    SunIcon: SunIcon,
                                    CloudIcon: CloudIcon,
                                    RainIcon: RainIcon,
                                    SnowIcon: SnowIcon,
                                    ThunderIcon: ThunderIcon,
                                    FogIcon: FogIcon,
                                  };
                                  return iconMap[iconName] || SunIcon;
                                })()}
                                alt="weatherIcon"
                                className="w-7 h-7"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
