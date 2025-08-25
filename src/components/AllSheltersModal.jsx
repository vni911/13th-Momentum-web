import React, { useState, useEffect } from "react";
import ShelterDetailModal from "./ShelterDetailModal";

const AllSheltersModal = ({ isOpen, onClose, onSheltersLoad }) => {
  const [allShelters, setAllShelters] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [allError, setAllError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [regionOptions, setRegionOptions] = useState(["전체"]);
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

  // 두 지점 간의 거리 계산
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

  // 사용자 위치
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
        location = await getUserLocation();
      } catch (e) {
        throw new Error(
          "위치 정보 접근이 필요합니다. 브라우저에서 위치 권한을 허용해주세요."
        );
      }

      const serviceKey = import.meta.env.VITE_PUBLIC_DATA_SERVICE_KEY;
      if (!serviceKey) {
        throw new Error("공공데이터 서비스키가 설정되지 않았습니다.");
      }

      const query = new URLSearchParams({
        serviceKey: serviceKey,
        pageNo: "1",
        numOfRows: "5000",
      }).toString();

      const url = `/safetydata/V2/api/DSSP-IF-10942?${query}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `무더위 쉼터 API 호출에 실패했습니다. (status: ${response.status}) ${errorText}`
        );
      }

      const data = await response.json().catch(async () => {
        const text = await response.text();
        throw new Error(
          `예상치 못한 응답 형식입니다: ${text?.slice(0, 200)}...`
        );
      });

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

      const pickFirst = (obj, keys) => {
        for (const key of keys) {
          if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
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

      const list = records
        .map((shelter) => {
          const lat = toNumber(pickFirst(shelter, ["LA"]));
          const lng = toNumber(pickFirst(shelter, ["LO"]));
          const hasCoord = !isNaN(lat) && !isNaN(lng);
          const distance = hasCoord
            ? calculateDistance(location.lat, location.lng, lat, lng)
            : Infinity;
          return {
            name: pickFirst(shelter, ["RSTR_NM"]) || "무더위 쉼터",
            address: pickFirst(shelter, ["RN_DTL_ADRES", "DTL_ADRES"]) || "",
            distance:
              Number.isFinite(distance) && distance < 1
                ? `${Math.round(distance * 1000)}m`
                : Number.isFinite(distance)
                ? `${distance.toFixed(1)}km`
                : "거리 정보 없음",
            actualDistance: distance,
            typeName: getFacilityTypeName(
              pickFirst(shelter, ["FCLTY_SCLAS", "FCLTY_TY"])
            ),
            location: pickFirst(shelter, ["DTL_POSITION"]) || "",
            // 추가 정보들
            operatingHours: (() => {
              const wkdayBegin = pickFirst(shelter, ["WKDAY_OPER_BEGIN_TIME"]);
              const wkdayEnd = pickFirst(shelter, ["WKDAY_OPER_END_TIME"]);
              const wkendBegin = pickFirst(shelter, [
                "WKEND_HDAY_OPER_BEGIN_TIME",
              ]);
              const wkendEnd = pickFirst(shelter, ["WKEND_HDAY_OPER_END_TIME"]);

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
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)); // Filter out items without valid coordinates for sorting

      const sorted = list.sort((a, b) => a.actualDistance - b.actualDistance);
      setAllShelters(sorted);

      // 지역 옵션 구성 (주소의 첫 토큰 기준)
      const toRegion = (addr) => {
        if (!addr || typeof addr !== "string") return "미상";
        const token = addr.trim().split(/\s+/)[0] || "미상";
        return token;
      };
      const regions = Array.from(
        new Set(sorted.map((s) => toRegion(s.address)).filter(Boolean))
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
            전국 무더위 쉼터{" "}
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
