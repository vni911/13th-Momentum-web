import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
      <div className="mx-auto w-full max-w-[1120px] px-4 md:px-8 lg:px-10 py-40">
        {/* 로그인 창 */}
        <div className="flex flex-row justify-between items-center">
          {/* 아래 div 태그는 justify-between을 위해 사용 */}
          <div></div>
          <div
            className="bg-white p-6 rounded-3xl shadow-lg px-20 py-40"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="flex flex-col space-y-5">
              <div className="flex flex-col">
                <span className="text-md font-bold">ID</span>
                <input
                  type="username"
                  name="사용자명"
                  className="w-72 border-b-2 border-gray-400"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-md font-bold">비밀번호</span>
                <input
                  type="password"
                  name="비밀번호"
                  className="w-72 border-b-2 border-gray-400"
                />
              </div>
              <button className="rounded-3xl p-4 border-[1px] border-gray-100 shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-2xl">
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
