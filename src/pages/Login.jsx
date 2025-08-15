import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signInApi from "../api/loginApi.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");

    const handleLogin = async () => {
    const loginData = {
      username: username,
      password: password
    };

    try {
      await signInApi(loginData);
      alert("로그인 성공!");
      navigate("/dashboard");
    } catch (error) {
      alert(`로그인 오류: ${error.message}`);
      
      console.log('로그인 에러 상세:', error);
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
                  onChange={e => {
                    setUsername(e.target.value);
                    const value = e.target.value;
                    if (
                      value.length < 6 ||
                      !/[a-zA-Z]/.test(value) ||
                      !/[0-9]/.test(value)
                    ) {
                      setUsernameError("아이디는 영문+숫자 조합 6자 이상이어야 합니다.");
                    } else {
                      setUsernameError("");
                    }
                  }}
                />
                {usernameError && (
                  <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                )}
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
                onClick={() => {
                  if (
                    usernameError ||
                    !username ||
                    !password
                  ) return;
                  handleLogin();
                }}
                disabled={
                  usernameError || !username || !password
                }
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
