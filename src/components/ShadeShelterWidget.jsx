import React, { useState, useEffect } from "react";

const ShadeShelterWidget = ({ onSheltersChange }) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // km
    return distance;
  };

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("위치 정보를 지원하지 않습니다."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          reject(error);
        },

        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });
  };

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        setLoading(true);

        // 사용자 위치 가져오기
        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          throw new Error(
            "위치 정보 접근이 필요합니다. 브라우저에서 위치 권한을 허용해주세요."
          );
        }

        // JSON 파일에서 그늘막 쉼터 데이터 가져오기
        const response = await fetch("/shadeshelter.json");

        if (!response.ok) {
          throw new Error("JSON 파일을 불러올 수 없습니다.");
        }

        const data = await response.json();
        console.log("그늘막 쉼터 JSON 데이터 구조:", data);
        console.log("사용자 위치:", location);

        // records 배열에서 쉼터 데이터 추출
        const shelters = data.records || [];
        console.log("총 쉼터 개수:", shelters.length);

        // 각 쉼터의 거리 계산 및 정렬
        const shelterList = shelters
          .map((shelter) => {
            const lat = parseFloat(shelter.위도);
            const lng = parseFloat(shelter.경도);

            // 위도/경도가 유효한 경우에만 거리 계산
            if (isNaN(lat) || isNaN(lng)) {
              return null;
            }

            const distance = calculateDistance(
              location.lat,
              location.lng,
              lat,
              lng
            );

            return {
              name: shelter.설치장소명,
              address: shelter.소재지도로명주소 || shelter.소재지지번주소,
              distance:
                distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`,
              actualDistance: distance,
              type: shelter.그늘막유형,
              location: shelter.세부위치,
              lat: shelter.위도,
              lng: shelter.경도,
            };
          })
          .filter((shelter) => shelter !== null) // 유효하지 않은 데이터 제거
          .sort((a, b) => a.actualDistance - b.actualDistance) // 가까운 순서로 정렬
          .slice(0, 4) // 상위 4개만 선택
          .map(({ name, address, distance, type, location, lat, lng }) => ({
            name,
            address,
            distance,
            type,
            location,
            lat,
            lng,
          })); // actualDistance 제거

        onSheltersChange(shelterList);

        setShelters(shelterList);
      } catch (error) {
        console.error("그늘막 쉼터 정보 가져오기 실패:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">그늘막 쉼터 정보</h3>
        <p className="text-sm text-gray-600">
          근처의 그늘막 쉼터를 확인해보세요
        </p>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">
              쉼터 정보 로딩 중...
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-4">
            <span className="text-sm text-red-500">오류: {error}</span>
          </div>
        ) : (
          shelters.map((shelter, index) => (
            <div
              key={index}
              className={`py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 ${
                index < shelters.length - 1 ? "mb-3" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {shelter.name}
                  </span>
                  {shelter.address && (
                    <p className="text-xs text-gray-500 mt-1">
                      {shelter.address}
                    </p>
                  )}
                  {shelter.type && (
                    <p className="text-xs text-blue-600 mt-1">{shelter.type}</p>
                  )}
                  {shelter.location && (
                    <p className="text-xs text-gray-400 mt-1">
                      {shelter.location}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  {shelter.distance}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShadeShelterWidget;
