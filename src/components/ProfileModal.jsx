import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi"; //npm install react-icons
import { IoMdClose } from "react-icons/io";
import ContactModal from "./ContactModal";
import { patchUsername, getUsername } from "../api/profileApi";

function ProfileModal({ onClose }) {
  const [show, setShow] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);

  //사용자명 변경하기
  const handleEditClick = () => {
    setIsEditingName(true);
    setInputName(username);
  };

  const handleNameSubmit = async () => {
    if (!inputName.trim()) {
      alert("사용자명을 입력해주세요.");
      return;
    }
    try {
      await patchUsername(inputName);
      setUsername(inputName);
      setIsEditingName(false);
      alert("사용자명이 성공적으로 변경되었습니다.");
      console.log(`사용자명 변경 성공: ${inputName}`);
    } catch (err) {
      alert("사용자명 변경에 실패했습니다.");
      console.log("사용자명 변경 실패", err);
    }
  };

  //보호자 등록하기
  const handleGuardianClick = () => {
    setShowContactModal(true);
  };

  useEffect(() => {
    const fetchProflie = async () => {
      try {
        const data = await getUsername();
        if (data && data.username) {
          setUsername(data.username);
        }
      } catch (err) {
        alert("프로필 조회 실패");
        console.error("프로필 조회 실패: ", err);
      }
    };
    fetchProflie();
    setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-4xl max-h-[90vh] flex flex-col justify-center items-center relative"
          style={{ height: "650px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 text-3xl"
          >
            <IoMdClose />
          </button>

          <div className="flex flex-col items-center">
            <div className="rounded-full w-72 h-72 bg-[#EFEFEF]"></div>
            <div className="mt-8">
              <span className="text-4xl font-bold">{username}</span>
            </div>
          </div>

          <div
            className="mt-10 flex items-center justify-center"
            style={{ height: "100px" }}
          >
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="새로운 사용자명"
                  className="px-4 py-4 rounded-2xl bg-[#EFEFEF] text-center font-bold"
                />
                <button
                  onClick={handleNameSubmit}
                  className="p-3 rounded-full bg-[#EFEFEF] hover:bg-[#E0E0E0]"
                >
                  <FiArrowRight size={24} />
                </button>
              </div>
            ) : (
              <div className="flex space-x-6">
                <button
                  onClick={handleEditClick}
                  className="px-8 py-4 bg-[#EFEFEF] rounded-2xl hover:bg-[#E0E0E0]"
                >
                  <span className="text-lg font-bold">사용자명 변경하기</span>
                </button>
                <button
                  onClick={handleGuardianClick}
                  className="px-8 py-4 bg-[#EFEFEF] rounded-2xl hover:bg-[#E0E0E0]"
                >
                  <span className="text-lg font-bold">보호자 등록하기</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          initialContacts={[]}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
}

export default ProfileModal;
