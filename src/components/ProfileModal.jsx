import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import ContactModal from "./ContactModal";
import { fetchUsername } from "../api/profileApi";

function ProfileModal({ onClose }) {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);

  //보호자 등록하기
  const handleGuardianClick = () => {
    setShowContactModal(true);
  };

  useEffect(() => {
    const fetchProflie = async () => {
      try {
        const data = await fetchUsername();
        if (data && (data.username || data.name)) {
          setUsername(data.username || data.name);
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
          className="bg-white rounded-[30px] shadow-lg p-6 sm:p-10 w-full max-w-4xl max-h-[90vh] flex flex-col justify-center items-center relative"
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
            <div className="flex">
              <button
                onClick={handleGuardianClick}
                className="px-8 py-4 bg-[#EFEFEF] rounded-[20px] hover:bg-[#E0E0E0]"
              >
                <span className="text-lg font-bold">보호자 등록하기</span>
              </button>
            </div>
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
