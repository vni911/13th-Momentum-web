import React, { useEffect, useState } from "react";

const AlertWidget = () => {
  const [showAlert, setShowAlert] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const hide = localStorage.getItem("hideAlert");
    if (hide === "true") {
      setShowAlert(false);
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!showAlert) return null;

  if (isMobile) {
    return (
      <>
        {showAlert &&
          (!showButton ? (
            <div className="flex items-center space-x-2">
              <div className="mx-auto w-full max-w-[1120px] flex items-center bg-white rounded-3xl px-3 py-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-row items-center justify-between w-full gap-x-1.5">
                  <div className="flex flex-col gap-y-1">
                    <div className="flex flex-row items-center gap-1">
                      <img
                        src="https://img.icons8.com/?size=100&id=5PEZqu9izqDp&format=png&color=FFBC55"
                        alt="cautionIcon"
                        className="w-7 h-7"
                      ></img>
                      <span className="text-[13.5px] font-black text-gray-900 leading-none">
                        보호자 연결 안 됨
                      </span>
                    </div>
                    <span className="text-[11px]">
                      상태를 보호자에게 공유하려면 보호자와 연결하세요.
                    </span>
                  </div>
                  <button className="flex items-center">
                    <img
                      src="https://img.icons8.com/?size=100&id=9433&format=png&color=6A6A6A"
                      alt="cancelIcon"
                      className="w-5 h-5 object-contain"
                      onClick={() => setShowButton(true)}
                    />
                  </button>
                </div>
              </div>
              {/* <button className="px-3 py-1 text-sm bg-gray-200 rounded-full"></button>
            <button className="px-3 py-1 text-sm bg-gray-200 rounded-full"></button> */}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="mx-auto w-full max-w-[1120px] flex items-center bg-white rounded-3xl p-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="bg-[#EFEFEF] rounded-2xl flex flex-row items-center justify-around w-full">
                  <button
                    className="flex flex-1 flex-col bg-[#EFEFEF] text-sm text-gray-700 font-bold hover:text-gray-900 rounded-l-2xl px-12 py-3 transition-colors duration-300 ease-in-out hover:bg-[#C2C2C2]"
                    onClick={() => {
                      localStorage.setItem("hideNokAlert", "true");
                      setShowAlert(false);
                      setShowButton(false);
                    }}
                  >
                    이 내용 보지 않기
                    <span className="text-[10px] text-gray-600">
                      설정에서 나중에 등록할 수 있어요!
                    </span>
                  </button>
                  <div className="w-px h-10 border-[0.5px] border-gray-400"></div>
                  <button
                    className="flex-1 bg-[#EFEFEF] text-sm text-gray-700 font-bold hover:text-gray-900 rounded-r-2xl py-[20px] transition-colors duration-300 ease-in-out hover:bg-[#C2C2C2]"
                    onClick={() => setShowButton(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          ))}
      </>
    );
  }

  return (
    <>
      {showAlert &&
        (!showButton ? (
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-row items-center gap-x-1.5">
                <img
                  src="https://img.icons8.com/?size=100&id=5PEZqu9izqDp&format=png&color=FFBC55"
                  alt="cautionIcon"
                  className="w-7 h-7"
                ></img>
                <span className="text-[13.5px] font-black text-gray-900 leading-none">
                  보호자 연결 안 됨
                </span>
                <button className="flex items-center">
                  <img
                    src="https://img.icons8.com/?size=100&id=9433&format=png&color=6A6A6A"
                    alt="cancelIcon"
                    className="w-5 h-5 object-contain"
                    onClick={() => setShowButton(true)}
                  />
                </button>
              </div>
            </div>
            {/* <button className="px-3 py-1 text-sm bg-gray-200 rounded-full"></button>
            <button className="px-3 py-1 text-sm bg-gray-200 rounded-full"></button> */}
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-row items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
              <button
                className="text-sm text-gray-600 font-bold hover:text-gray-900 rounded-l-full pr-3 pl-4 py-3 transition-colors duration-300 ease-in-out hover:bg-[#C2C2C2]"
                onClick={() => {
                  localStorage.setItem("hideNokAlert", "true");
                  setShowAlert(false);
                  setShowButton(false);
                }}
              >
                이 내용 보지 않기
              </button>
              <div className="h-5 border-[0.5px] border-gray-300"></div>
              <button
                className="text-sm text-gray-600 font-bold hover:text-gray-900 rounded-r-full pr-4 pl-3 py-3 transition-colors duration-300 ease-in-out hover:bg-[#C2C2C2]"
                onClick={() => setShowButton(false)}
              >
                닫기
              </button>
            </div>
          </div>
        ))}
    </>
  );
};

export default AlertWidget;
