import React from "react";

const ShelterDetailModal = ({ isOpen, onClose, shelter }) => {
  if (!isOpen) return null;
  if (!shelter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-[90vw] max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-lg font-bold text-gray-800">쉼터 상세 정보</div>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
        <div className="p-4 overflow-auto">
          <div className="space-y-4">
            {/* 시설명 */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-1">시설명</div>
              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.name}</p>
            </div>

            {/* 주소 */}
            {shelter.address && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">주소</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.address}</p>
              </div>
            )}

            {/* 시설유형 */}
            {shelter.typeName && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">시설유형</div>
                <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">{shelter.typeName}</p>
              </div>
            )}

            {/* 거리 */}
            {shelter.distance && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">현재 위치에서 거리</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.distance}</p>
              </div>
            )}

            {/* 운영시간 */}
            {shelter.operatingHours && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">운영시간</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.operatingHours}</p>
              </div>
            )}

            {/* 수용인원 */}
            {shelter.capacity && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">수용인원</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.capacity}명</p>
              </div>
            )}

            {/* 상세위치 */}
            {shelter.location && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">상세위치</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.location}</p>
              </div>
            )}

            {/* 비고 */}
            {shelter.remarks && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">비고</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.remarks}</p>
              </div>
            )}

            {/* 관리기관 */}
            {shelter.managementAgency && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">관리기관</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.managementAgency}</p>
              </div>
            )}

            {/* 연락처 */}
            {shelter.contact && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">연락처</div>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{shelter.contact}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterDetailModal;