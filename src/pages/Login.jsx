import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signInApi from "../api/loginApi.jsx";
import backgroundImage from "../assets/ondomi-bg-transparent.png";
import logoImage from "../assets/ondomi logo.png";
import Signup from "./Signup.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const basicClass = "relative w-full overflow-hidden";

  const handleLogin = async () => {
    const loginData = {
      username: username,
      password: password,
    };

    try {
      await signInApi(loginData);
      alert("로그인 성공!");
      navigate("/dashboard");
    } catch (error) {
      alert(`로그인 오류: ${error.message}`);

      console.log("로그인 에러 상세:", error);
    }
  };
  return (
    <div 
      className="h-screen bg-cover bg-center bg-fixed flex items-center justify-center bg-[#F8F8F8]" 
      style={{ 
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <div className="w-full max-w-[1120px] px-4 md:px-8 lg:px-10">
        {/* 로그인 창 - useState로 signup 창 변경*/}
        <div className="flex flex-row justify-center items-center">
          <div
            className={`bg-white p-6 rounded-3xl shadow-lg w-full transition-[max-width,padding] duration-500 ease-in-out ${
              showSignup ? "max-w-[760px] px-10 py-16" : "max-w-[480px] px-20 py-12"
            }`}
          >
            {/* 로고 */}
            <div className="flex justify-center mb-8">
              <img 
                src={logoImage} 
                alt="Ondomi Logo" 
                className="h-16 w-auto"
              />
            </div>
            {/* 창 전환 */}
            <div className={`${basicClass} ${showSignup ? "min-h-[520px] md:min-h-[600px]" : "min-h-[280px] md:min-h-[320px]"}`}>
              {/* 로그인 */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  showSignup ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col">
                    <span className="text-md font-bold">ID</span>
                    <input
                      type="text"
                      name="username"
                      className="w-80 border-b-2 border-gray-400"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        const value = e.target.value;
                        if (
                          value.length < 6 ||
                          !/[a-zA-Z]/.test(value) ||
                          !/[0-9]/.test(value)
                        ) {
                          setUsernameError(
                            "아이디는 영문+숫자 조합 6자 이상이어야 합니다."
                          );
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
                      className="w-80 border-b-2 border-gray-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button
                    className="rounded-3xl p-4 border border-gray-200 bg-white text-black shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-md"
                    onClick={() => {
                      if (usernameError || !username || !password) return;
                      handleLogin();
                    }}
                    disabled={usernameError || !username || !password}
                  >
                    로그인
                  </button>
                  <button
                    className="rounded-3xl p-4 bg-[#5fa0ff] text-white transition-colors duration-300 ease-in-out hover:bg-[#4a8cff]"
                    onClick={() => setShowSignup(true)}
                  >
                    회원가입
                  </button>
                </div>
              </div>

              {/* 회원가입 창 변경 */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out 
                  ${showSignup ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                } h-full overflow-auto`}
              >
                <Signup inline onClose={() => setShowSignup(false)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
