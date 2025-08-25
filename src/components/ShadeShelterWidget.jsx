import React, { useState, useEffect } from "react";
import AllSheltersModal from "./AllSheltersModal";
import ShelterDetailModal from "./ShelterDetailModal";

const ShadeShelterWidget = ({ onSheltersChange }) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
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

        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          throw new Error(
            "위치 정보 접근이 필요합니다. 브라우저에서 위치 권한을 허용해주세요."
          );
        }

        const response = await fetch("/shadeshelter.json");

        if (!response.ok) {
          throw new Error("JSON 파일을 불러올 수 없습니다.");
        }

        const data = await response.json();
        console.log("그늘막 쉼터 JSON 데이터 구조:", data);
        console.log("사용자 위치:", location);

        const shelters = data.records || [];
        console.log("총 쉼터 개수:", shelters.length);

        const shelterList = shelters
          .map((shelter) => {
            const lat = parseFloat(shelter.위도);
            const lng = parseFloat(shelter.경도);

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
          .filter((shelter) => shelter !== null)
          .sort((a, b) => a.actualDistance - b.actualDistance)
          .slice(0, 4) //4개 슬라이싱
          .map(({ name, address, distance, type, location, lat, lng }) => ({
            name,
            address,
            distance,
            type,
            location,
            lat,
            lng,
          }));

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

  const openAllSheltersModal = () => {
    setShowAll(true);
  };

  const openShelterDetail = (shelter) => {
    setSelectedShelter(shelter);
    setShowDetail(true);
  };

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-lg font-bold text-gray-800">
            그늘막 쉼터 정보
          </div>
          <p className="text-sm text-gray-600">
            근처의 그늘막 쉼터를 확인해보세요
          </p>
        </div>
        <button
          onClick={openAllSheltersModal}
          className="ml-3 px-2 h-7 rounded-md border border-gray-300 text-gray-700 text-sm bg-white hover:bg-gray-50"
          title="전국 쉼터 전체 보기"
        >
          +
        </button>
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
              className={`py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer ${
                index < shelters.length - 1 ? "mb-3" : ""
              }`}
              onClick={() => openShelterDetail(shelter)}
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

      <AllSheltersModal isOpen={showAll} onClose={() => setShowAll(false)} />
      <ShelterDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        shelter={selectedShelter}
      />
    </div>
  );
};

export default ShadeShelterWidget;
