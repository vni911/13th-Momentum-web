import React from 'react';
import { createPortal } from 'react-dom';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden relative shadow-2xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">서비스 이용 동의</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* 내용 */}
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            <div>
              <h3 className="font-semibold text-base text-gray-800 mb-2">1. 개인정보 수집 및 이용 동의</h3>
              <div className="space-y-2">
                <p><strong>수집 목적:</strong> 온열질환 위험 예측 및 예방, 긴급 상황 발생 시 보호자 알림, 서비스 운영 및 개선.</p>
                <div>
                  <p><strong>수집 항목:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>회원가입 시:</strong> 아이디, 비밀번호, 이름, 생년월일, 전화번호</li>
                    <li><strong>서비스 이용 시:</strong> 애플워치 등 웨어러블 기기를 통해 측정되는 심박수, 체온, 측정 시각, 그리고 사용자의 위치 정보</li>
                    <li><strong>보호자 등록 시:</strong> 보호자의 이름, 연락처, 사용자와의 관계</li>
                  </ul>
                </div>
                <p><strong>보유 및 이용 기간:</strong> 회원 탈퇴 시 또는 동의 철회 시 즉시 파기. 단, 관련 법령에 따라 일정 기간 보존해야 할 필요가 있는 경우 해당 기간 동안 보관합니다.</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-base text-gray-800 mb-2">2. 개인정보 제3자 제공 동의</h3>
              <div className="space-y-2">
                <p><strong>제공 대상:</strong> 사용자가 서비스 내에 등록한 보호자</p>
                <p><strong>제공 목적:</strong> 온열질환 위험 상황 발생 시 보호자에게 알림을 전송하여 사용자의 안전을 확보하기 위함.</p>
                <p><strong>제공 항목:</strong> 온열질환 위험 상태(예: 위험 단계), 사용자 이름, 사용자 연락처, 위치 정보.</p>
                <p><strong>제공 시점:</strong> AI 예측 모델이 사용자의 건강 상태를 '위험'으로 판단할 경우</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-base text-gray-800 mb-2">3. 서비스 이용 동의</h3>
              <div className="space-y-2">
                <p>'온도미'는 사용자의 건강 데이터를 기반으로 온열질환 위험을 예측하고 경고하는 예방 서비스입니다.</p>
                <p>본 서비스는 의료 행위를 대신할 수 없으며, 모든 예측 결과는 참고용으로만 활용해야 합니다.</p>
                <p>응급 상황 발생 시에는 반드시 119 또는 의료기관에 연락하여 전문적인 조치를 받으셔야 합니다.</p>
                <p>사용자의 부주의로 인해 발생하는 사고에 대해 '온도미'는 책임지지 않습니다.</p>
              </div>
            </div>
            
            <p className="font-semibold">
              위의 모든 내용을 확인하였으며, 서비스 이용을 위해 개인정보 및 건강 데이터 수집 및 이용, 제3자 제공에 동의합니다.
            </p>
          </div>
        </div>
        
        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors duration-300"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TermsModal;
