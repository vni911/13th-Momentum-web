import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://43.201.75.36:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // 쿠키(JSESSIONID) 포함
      });
      if (response.ok) {
        navigate("/dashboard");
      } else {
        alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (err) {
      alert("서버 오류");
    }
  };
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
                  type="text"
                  name="username"
                  className="w-72 border-b-2 border-gray-400"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-md font-bold">비밀번호</span>
                <input
                  type="password"
                  name="password"
                  className="w-72 border-b-2 border-gray-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button
                className="rounded-3xl p-4 border-[1px] border-gray-100 shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-2xl"
                onClick={handleLogin}
              >
                로그인
              </button>
              <button
                className="rounded-3xl p-4 border-[1px] border-gray-100 shadow-xl transition-shadow duration-300 ease-in-out hover:shadow-2xl bg-blue-400 text-white mt-2"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
