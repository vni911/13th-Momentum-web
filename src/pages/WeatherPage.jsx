import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Pin from "../assets/LocationPin.svg";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 뒤로 가기
  const goBack = () => navigate(-1);

  // OpenWeatherMap API 키 가져오기
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // 날씨 상태 한글 변환 함수
  const getWeatherDescription = (description) => {
    const descriptions = {
      "clear sky": "맑음",
      "few clouds": "구름 조금",
      "scattered clouds": "구름 많음",
      "broken clouds": "흐림",
      "overcast clouds": "흐림",
      "shower rain": "소나기",
      rain: "비",
      "light rain": "가벼운 비",
      "moderate rain": "비",
      "heavy rain": "폭우",
      thunderstorm: "천둥번개",
      snow: "눈",
      mist: "안개",
      fog: "안개",
      haze: "연무",
      smoke: "연기",
      dust: "먼지",
      sand: "모래",
      ash: "재",
      squall: "돌풍",
      tornado: "토네이도",
    };
    return descriptions[description] || "맑음";
  };

  // 날씨 그룹 분류 함수 (아이콘 및 배경 색상용)
  const getWeatherGroup = (desc) => {
    const weatherGroups = {
      sunny: ["맑음"],
      cloudy: ["구름 조금", "구름 많음", "흐림"],
      rain: ["소나기", "비", "가벼운 비", "폭우"],
      snow: ["눈"],
      storm: ["천둥번개", "돌풍", "토네이도"],
      mist: ["안개", "연무", "연기", "먼지", "모래", "재"],
    };
    for (const [group, items] of Object.entries(weatherGroups)) {
      if (items.includes(desc)) {
        return group;
      }
    }
    return "sunny";
  };

  // OpenStreetMap 주소 정보 가져오기
  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=ko`
      );

      if (!response.ok) {
        throw new Error("주소 정보를 가져올 수 없습니다.");
      }
      const data = await response.json();
      const address = data.address;
      let locationName = "현재 위치";
      if (address) {
        const state = address.state || address.province;
        const city = address.city || address.county;
        const district = address.district || address.suburb;
        const town = address.town || address.village || address.neighbourhood;
        const parts = [];
        if (city && city !== state) parts.push(city);
        if (district) parts.push(district);
        if (town) parts.push(town);
        const hamlet = address.hamlet;
        if (hamlet && hamlet !== town) parts.push(hamlet);

        if (parts.length >= 2) locationName = parts.slice(0, 2).join(" ");
        else if (parts.length === 1) locationName = parts[0];
        else if (city) locationName = city;
        else if (state) locationName = state;
      }
      return locationName;
    } catch (error) {
      console.error("주소 정보 가져오기 실패:", error);
      return "현재 위치";
    }
  };

  // 날씨 정보와 위치 정보 가져오는 통합 함수
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!apiKey) {
        throw new Error("OpenWeather API 키가 설정되지 않았습니다.");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = position.coords;

      // 위치명 가져오기
      const locationName = await getLocationName(latitude, longitude);
      setLocation(locationName);

      // 날씨 정보 가져오기
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`
      );

      // 일기 예보 가져오기
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`
      );

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error("날씨 정보를 가져오는 데 실패했습니다.");
      }

      const weatherData = await weatherResponse.json();
      const forecastResult = await forecastResponse.json();

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentDesc = weatherData
    ? getWeatherDescription(weatherData.weather[0].description)
    : "";
  const group = getWeatherGroup(currentDesc);

  // 날씨 그룹에 따른 그라데이션 클래스 매핑
  const getGradientClass = (weatherGroup) => {
    switch (weatherGroup) {
      case "sunny":
        return "bg-gradient-to-tr from-white via-[#FFDDBF]/50 to-[#FADCC2]/80";
      case "cloudy":
        return "bg-gradient-to-t from-stone-50 via-stone-100 to-stone-400/80";
      case "rain":
        return "bg-gradient-to-t from-white via-[#BFD4FF]/30 to-[#BFD4FF]/60";
      default:
        return "bg-white";
    }
  };

  const gradientClass = getGradientClass(group);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-10 lg:px-12 py-16">
        <div className="flex justify-between items-center mb-6">
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
          <div className="ml-auto flex items-center space-x-4">
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
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  날씨 정보 로딩 중...
                </span>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center text-red-600">
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
              <div
                className={`${gradientClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 relative overflow-hidden`}
              >
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
                    {weatherData.sys.country} / {weatherData.name}
                  </span>
                  <div className="text-7xl font-bold text-gray-800 mb-4">
                    {Math.round(weatherData.main.temp)}°C
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <div>
                      <span className="text-sm text-gray-500">
                        체감 기온은{" "}
                        <span>
                          {Math.round(weatherData.main.feels_like)}°,{" "}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {currentDesc}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-5 m-3 border rounded-2xl bg-gray-400/10 shadow-md">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={hourlyForecastData}
                      margin={{ top: 10, right: 30, left: 15, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="tempGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#EFA15E"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#FFF7ED"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#FFB06B"
                        fillOpacity={1}
                        fill="url(#tempGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 flex justify-around">
                  {forecastData?.map((item, index) => {
                    let dayText;
                    if (index === 0) {
                      dayText = "오늘";
                    } else if (index === 1) {
                      dayText = "내일";
                    } else {
                      const today = new Date();
                      const futureDate = new Date(today);
                      futureDate.setDate(today.getDate() + index);
                      dayText = futureDate.toLocaleDateString("ko-KR", {
                        weekday: "short",
                      });
                    }
                    return (
                      <div
                        key={index}
                        className="flex flex-col justify-center items-center border rounded-2xl bg-gray-500/10 shadow-lg p-2.5"
                      >
                        <p className="font-bold">{dayText}</p>
                        <img
                          src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                          alt="weatherIcon"
                          className="w-12 h-12"
                        />
                        <p className="text-lg">
                          {getWeatherDescription(item.weather)}
                        </p>
                        <div className="flex flex-col lg:flex-row lg:gap-1.5">
                          <p className="text-[14px] font-bold text-[#FF6161]">
                            최고: {Math.round(item.temp_max)}°
                          </p>
                          <p className="text-[14px] font-bold text-[#495BFF]">
                            최저: {Math.round(item.temp_min)}°
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
