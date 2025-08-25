import React, { useState, useEffect } from "react";
import ShelterDetailModal from "./ShelterDetailModal";
import { getCurrentCoordinates } from "../api/locationApi";

const AllSheltersModal = ({ isOpen, onClose }) => {
  const [allShelters, setAllShelters] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [allError, setAllError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [regionOptions, setRegionOptions] = useState(["전체"]);
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

  useEffect(() => {
    if (isOpen) {
      loadAllShelters();
    }
  }, [isOpen]);

  const loadAllShelters = async () => {
    try {
      setLoadingAll(true);
      setAllError(null);

      let location;
      try {
        location = await getCurrentCoordinates();
      } catch {
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

      const list = shelters
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
            typeName: shelter.그늘막유형,
            location: shelter.세부위치,
            lat: shelter.위도,
            lng: shelter.경도,
            operatingHours: shelter.운영시간,
            capacity: shelter.수용인원,
            remarks: shelter.비고,
            managementAgency: shelter.관리기관,
            contact: shelter.연락처,
          };
        })
        .filter((shelter) => shelter !== null)
        .sort((a, b) => a.actualDistance - b.actualDistance);

      setAllShelters(list);

      const toRegion = (addr) => {
        if (!addr || typeof addr !== "string") return "미상";
        const token = addr.trim().split(/\s+/)[0] || "미상";
        return token;
      };
      const regions = Array.from(
        new Set(list.map((s) => toRegion(s.address)).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, "ko"));
      setRegionOptions(["전체", ...regions]);
      setSelectedRegion("전체");
    } catch (e) {
      console.error(e);
      setAllError(e.message);
    } finally {
      setLoadingAll(false);
    }
  };

  const openShelterDetail = (shelter) => {
    setSelectedShelter(shelter);
    setShowDetail(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-[90vw] max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b gap-3">
          <div className="text-base font-bold text-gray-800">
            전국 그늘막 쉼터{" "}
            {allShelters.length
              ? `(${allShelters.length.toLocaleString()}개)`
              : ""}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">지역</label>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="p-4 overflow-auto">
          {loadingAll ? (
            <div className="py-10 text-center text-sm text-gray-500">
              전체 목록 불러오는 중...
            </div>
          ) : allError ? (
            <div className="py-10 text-center text-sm text-red-500">
              {allError}
            </div>
          ) : allShelters.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              표시할 쉼터가 없습니다.
            </div>
          ) : (
            <ul className="space-y-3">
              {allShelters
                .filter((s) => {
                  if (selectedRegion === "전체") return true;
                  const first = (s.address || "").trim().split(/\s+/)[0];
                  return first === selectedRegion;
                })
                .map((s, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openShelterDetail(s)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">
                          {s.name}
                        </div>
                        {s.address && (
                          <div className="text-xs text-gray-500 mt-1">
                            {s.address}
                          </div>
                        )}
                        {s.typeName && (
                          <div className="text-xs text-blue-600 mt-1">
                            {s.typeName}
                          </div>
                        )}
                        {s.location && (
                          <div className="text-xs text-gray-400 mt-1">
                            {s.location}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 ml-2">
                        {s.distance}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      <ShelterDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        shelter={selectedShelter}
      />
    </div>
  );
};

export default AllSheltersModal;