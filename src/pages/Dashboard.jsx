import React, { useState, useEffect } from "react";
import WeatherWidget from "../components/WeatherWidget";
import ShadeShelterWidget from "../components/ShadeShelterWidget";
import MapWidget from "../components/MapWidget";
import DialoGPTLLM from "../components/WeatherMessageWidget";
import AlertWidget from "../components/AlertWidget";
import ContactModal from "../components/ContactModal";

const Dashboard = () => {
  const [location, setLocation] = useState("위치 확인 중...");
  const [weatherData, setWeatherData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showModal, setShowModal] = useState(false);
  const [contacts, setContacts] = useState([]);

  const handleWeatherDataChange = (data) => {
    console.log("Dashboard - weatherData 수신:", data);
    setWeatherData(data);
  };

  //OpenStreetMap 주소 정보 가져오기
  const getLocationName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=ko`
      );

      if (!response.ok) {
        throw new Error("주소 정보를 가져올 수 없습니다.");
      }

      const data = await response.json();
      console.log("주소 정보:", data);

      const address = data.address;
      let locationName = "현재 위치";

      if (address) {
        const state = address.state || address.province;
        const city = address.city || address.county;
        const district = address.district || address.suburb;
        const town = address.town || address.village || address.neighbourhood;
        const hamlet = address.hamlet;

        const parts = [];

        if (city && city !== state) {
          parts.push(city);
        }
        if (district) {
          parts.push(district);
        }
        if (town) {
          parts.push(town);
        }
        if (hamlet && hamlet !== town) {
          parts.push(hamlet);
        }

        if (parts.length >= 2) {
          locationName = parts.slice(0, 2).join(" ");
        } else if (parts.length === 1) {
          locationName = parts[0];
        } else if (city) {
          locationName = city;
        } else if (state) {
          locationName = state;
        }
      }

      return locationName;
    } catch (error) {
      console.error("주소 정보 가져오기 실패:", error);
      return "현재 위치";
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  reject(new Error("위치 정보 접근이 거부되었습니다."));
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(new Error("위치 정보를 사용할 수 없습니다."));
                  break;
                case error.TIMEOUT:
                  reject(new Error("위치 정보 요청 시간이 초과되었습니다."));
                  break;
                default:
                  reject(new Error("위치 정보를 가져올 수 없습니다."));
              }
            },
            {
              timeout: 10000,
              enableHighAccuracy: true,
            }
          );
        });

        const { latitude, longitude } = position.coords;
        const locationName = await getLocationName(latitude, longitude);
        setLocation(locationName);
      } catch (error) {
        console.error("위치 정보 가져오기 실패:", error);
        setLocation("위치를 확인할 수 없습니다");
      }
    };

    getLocation();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // 초기 호출

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <div className="mx-auto w-full max-w-[1120px] px-6 md:px-10 lg:px-12 py-16">
        {/* 상단 헤더 바 */}
        <div className="flex justify-between items-center mb-6">
          {/* 알림창 */}
          {!isMobile && <AlertWidget />}
          <div className="ml-auto flex items-center space-x-4">
            {/* 폰트 변경 필요 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-700">
                {location}
              </span>
              {/* 핀 마크 필요함 */}
              <span className="text-pink-500">📍</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* 프로필 태그 */}
              <div
                className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border border-gray-200"
                onClick={() => setShowModal(true)}
              >
                <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-sm font-bold text-gray-900">사용자</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="space-y-6">
          {isMobile && <AlertWidget />}
          {/* AI 위젯 */}
          <DialoGPTLLM weatherData={weatherData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 날씨 정보 */}
            <WeatherWidget onWeatherDataChange={handleWeatherDataChange} />
            {/* 체온 정보 */}
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4"></div>
              <div className="mb-4"></div>
              <div className="w-full h-16 bg-pink-100 rounded-lg"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 그늘막 쉼터 정보 */}
              <ShadeShelterWidget />
              {/* 지도 */}
              {/* https환경에서만 작동 */}
              <MapWidget />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ContactModal
          initialContacts={contacts}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
