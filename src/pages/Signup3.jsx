import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../assets/back.png";
import homeIcon from "../assets/home.png";

const Signup3 = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 pt-6">
        <div className="flex items-center justify-between h-10">
          <button onClick={() => window.history.back()}>
            <img src={backIcon} alt="뒤로가기" className="h-6 w-6" />
          </button>
          <button onClick={() => (window.location.href = "/")}>
            <img src={homeIcon} alt="홈" className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 mt-6 text-center">
        <h2 className="text-xl font-semibold mb-1">진단서 촬영하기</h2>
        <p className="text-lg text-gray-500">
          지병이 있다면 진단서를 촬영하여 업로드해주세요
        </p>
      </div>

      <div className="max-w-[620px] mx-auto mt-8 mb-24">
        <div className="bg-white rounded-3xl shadow-lg px-8 py-10">
          <div
            className="relative flex flex-col items-center"
            ref={dropdownRef}
          >
            <button
              onClick={toggleOptions}
              className="w-full py-4 rounded-3xl bg-white text-center font-semibold 
                         shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all"
            >
              촬영 및 업로드
            </button>

            {showOptions && (
              <div className="absolute top-full mt-6 w-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 px-6 text-left z-10">
                <ul className="space-y-4 text-[15px] text-gray-800">
                  <li className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                    <span>📷</span> 사진 보관함
                  </li>
                  <li className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                    <span>📸</span> 사진 찍기
                  </li>
                  <li className="flex items-center gap-2 hover:opacity-80 cursor-pointer">
                    <span>📁</span> 파일 선택
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-10">
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 rounded-3xl bg-white text-center font-semibold 
                         shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup3;
