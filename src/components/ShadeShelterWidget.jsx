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

  const getFacilityTypeName = (code) => {
    const typeMap = {
      "001": "경로당",
      "002": "마을회관",
      "003": "기타시설",
      "004": "금융기관",
    };
    return typeMap[code] || code;
  };

  // 두 지점 간의 거리 계산 (Haversine 공식)
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

        // 사용자 위치
        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          console.error("위치 정보를 가져올 수 없습니다:", error);
          throw new Error(
            "위치 정보 접근이 필요합니다. 브라우저에서 위치 권한을 허용해주세요."
          );
        }

        // API 호출
        const serviceKey = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY;
        if (!serviceKey) {
          throw new Error("공공데이터 서비스키가 설정되지 않았습니다.");
        }

        const query = new URLSearchParams({
          serviceKey: serviceKey,
          pageNo: "1",
          numOfRows: "300",
        }).toString();

        const url = `/safetydata/V2/api/DSSP-IF-10942?${query}`;
        // console.log("무더위 쉼터 API URL:", url);
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `무더위 쉼터 API 호출에 실패했습니다. (status: ${response.status}) ${errorText}`
          );
        }

        const rawText = await response.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(
            `예상치 못한 응답 형식입니다: ${rawText?.slice(0, 200)}...`
          );
        }
        // console.log("무더위 쉼터 API 데이터 구조:", data);

        if (data?.header?.resultCode && data.header.resultCode !== "00") {
          const code = data.header.resultCode;
          const msg = data.header.errorMsg || data.header.resultMsg || "오류";
          throw new Error(`무더위 쉼터 API 오류(${code}): ${msg}`);
        }

        const pickFirstArray = (root) => {
          const visited = new Set();
          const queue = [root];
          while (queue.length) {
            const cur = queue.shift();
            if (!cur || typeof cur !== "object") continue;
            if (visited.has(cur)) continue;
            visited.add(cur);
            if (Array.isArray(cur)) {
              if (cur.length > 0 && typeof cur[0] === "object") return cur;
            }
            for (const key of Object.keys(cur)) {
              const val = cur[key];
              if (val && typeof val === "object") queue.push(val);
            }
          }
          return [];
        };

        let records = Array.isArray(data)
          ? data
          : Array.isArray(data?.records)
          ? data.records
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.body)
          ? data.body
          : Array.isArray(data?.body?.list)
          ? data.body.list
          : Array.isArray(data?.data?.list)
          ? data.data.list
          : Array.isArray(data?.response?.body?.items?.item)
          ? data.response.body.items.item
          : Array.isArray(data?.body?.items?.item)
          ? data.body.items.item
          : [];

        if (!Array.isArray(records) || records.length === 0) {
          records = pickFirstArray(data);
        }
        // console.log(
        //   `총 쉼터 원시 개수:`,
        //   Array.isArray(records) ? records.length : 0
        // );
        // if (records.length > 0) {
        //   console.log("첫 번째 쉼터 데이터 구조:", records[0]);
        // }

        // 각 쉼터의 거리 계산 및 정렬
        const pickFirst = (obj, keys) => {
          for (const key of keys) {
            if (
              obj[key] !== undefined &&
              obj[key] !== null &&
              obj[key] !== ""
            ) {
              return obj[key];
            }
          }
          return undefined;
        };

        const toNumber = (v) => {
          const n = typeof v === "string" ? v.replace(/[\s,]/g, "") : v;
          const parsed = Number(n);
          return Number.isFinite(parsed) ? parsed : NaN;
        };

        const rawList = records
          .map((shelter) => {
            const lat = toNumber(pickFirst(shelter, ["LA"]));
            const lng = toNumber(pickFirst(shelter, ["LO"]));

            const hasCoord = !isNaN(lat) && !isNaN(lng);
            const distance = hasCoord
              ? calculateDistance(location.lat, location.lng, lat, lng)
              : Infinity;

            return {
              name:
                pickFirst(shelter, [
                  "name",
                  "시설명",
                  "기관명",
                  "설치장소명",
                  "무더위쉼터명",
                  "RSTR_NM",
                ]) || "무더위 쉼터",
              address:
                pickFirst(shelter, [
                  "도로명주소",
                  "주소",
                  "소재지도로명주소",
                  "소재지지번주소",
                  "RN_DTL_ADRES",
                  "DTL_ADRES",
                ]) || "",
              distance:
                Number.isFinite(distance) && distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : Number.isFinite(distance)
                  ? `${distance.toFixed(1)}km`
                  : "거리 정보 없음",
              actualDistance: distance,

              typeName: getFacilityTypeName(
                pickFirst(shelter, [
                  "FCLTY_SCLAS",
                  "FCLTY_TY",
                  "시설유형",
                  "유형",
                ])
              ),
              location:
                pickFirst(shelter, [
                  "세부위치",
                  "비고",
                  "상세위치",
                  "운영시간",
                  "DTL_POSITION",
                ]) || "",

              // 추가 정보
              operatingHours: (() => {
                const wkdayBegin = pickFirst(shelter, [
                  "WKDAY_OPER_BEGIN_TIME",
                ]);
                const wkdayEnd = pickFirst(shelter, ["WKDAY_OPER_END_TIME"]);
                const wkendBegin = pickFirst(shelter, [
                  "WKEND_HDAY_OPER_BEGIN_TIME",
                ]);
                const wkendEnd = pickFirst(shelter, [
                  "WKEND_HDAY_OPER_END_TIME",
                ]);

                if (wkdayBegin && wkdayEnd) {
                  const wkday = `${wkdayBegin.slice(0, 2)}:${wkdayBegin.slice(
                    2,
                    4
                  )} ~ ${wkdayEnd.slice(0, 2)}:${wkdayEnd.slice(2, 4)}`;
                  if (wkendBegin && wkendEnd) {
                    const wkend = `${wkendBegin.slice(0, 2)}:${wkendBegin.slice(
                      2,
                      4
                    )} ~ ${wkendEnd.slice(0, 2)}:${wkendEnd.slice(2, 4)}`;
                    return `평일: ${wkday}, 주말/공휴일: ${wkend}`;
                  }
                  return `평일: ${wkday}`;
                }
                return null;
              })(),
              capacity: pickFirst(shelter, ["USE_PSBL_NMPR"]),
              remarks: pickFirst(shelter, ["RM"]),
              managementAgency: pickFirst(shelter, ["MNGDPT_CD"]),
              contact: pickFirst(shelter, ["CONTACT"]),
              lat,
              lng,
            };
          })
          .filter((shelter) => shelter !== null);

        const candidatesWithCoords = rawList.filter(
          (s) =>
            Number.isFinite(s.lat) &&
            Number.isFinite(s.lng) &&
            Number.isFinite(s.actualDistance)
        );

        // 가까운 쉼터 4개 슬라이싱
        const topNearest = candidatesWithCoords
          .sort((a, b) => a.actualDistance - b.actualDistance)
          .slice(0, 4);

        const displayList = topNearest.map(
          ({
            name,
            address,
            distance,
            typeName,
            location,
            lat,
            lng,
            operatingHours,
            capacity,
            remarks,
            managementAgency,
            contact,
          }) => ({
            name,
            address,
            distance,
            type: typeName,
            location,
            lat,
            lng,
            operatingHours,
            capacity,
            remarks,
            managementAgency,
            contact,
          })
        );

        const mapList = displayList;

        onSheltersChange(mapList);

        setShelters(displayList);
      } catch (error) {
        console.error("무더위 쉼터 정보 가져오기 실패:", error);
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
            무더위 쉼터 정보
          </div>
          <p className="text-sm text-gray-600">
            근처의 무더위 쉼터를 확인해보세요
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
              className={`py-3 px-4 rounded-[20px] bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 cursor-pointer ${
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
                  {shelter.typeName && (
                    <p className="text-xs text-blue-600 mt-1">
                      {shelter.typeName}
                    </p>
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
