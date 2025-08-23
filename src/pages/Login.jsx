import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signInApi from "../api/loginApi.jsx";
import backgroundImage from "../assets/ondomi-bg-transparent.png";
import logoImage from "../assets/ondomi logo.png";
import Signup from "./Signup.jsx";
import Signup2 from "./Signup2.jsx";
import Signup3 from "./Signup3.jsx";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showSignupStep2, setShowSignupStep2] = useState(false);
  const [showSignupStep3, setShowSignupStep3] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupInstance, setSignupInstance] = useState(0);
  const basicClass = "relative w-full overflow-hidden";
  const signupPaneVisible = showSignup && !showSignupStep2;
  const signup2PaneVisible = showSignup && showSignupStep2 && !showSignupStep3;
  const signup3PaneVisible = showSignup && showSignupStep2 && showSignupStep3;

  const handleLogin = async () => {
    const loginData = {
      username: username,
      password: password,
    };

    try {
      setLoginError("");
      const response = await signInApi(loginData);
      
      // 토큰 저장
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        console.log("accessToken 저장됨:", response.accessToken);
      } else if (response.token) {
        localStorage.setItem("accessToken", response.token);
        console.log("token 저장됨:", response.token);
      } else {
        console.log("토큰이 응답에 없습니다. 전체 응답:", response);
      }
      
      console.log("로그인 성공, 토큰 저장됨:", response);
      navigate("/dashboard");
    } catch (error) {
      let smallMsg = "아이디 또는 비밀번호가 올바르지 않습니다.";
      if (error?.message && error.message.includes("응답")) {
        smallMsg = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      }
      setLoginError(smallMsg);
      console.log("로그인 에러 상세:", error);
    }
  };
  return (
    <div
      className="h-screen bg-cover bg-center bg-fixed flex items-center justify-center bg-[#F8F8F8]"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="w-full max-w-[1120px] px-4 md:px-8 lg:px-10">
        {/* 로그인 창 - useState로 signup 창 변경*/}
        <div className="flex flex-row justify-center items-center">
          <div
            className={`bg-white p-6 rounded-3xl shadow-lg w-full transition-[max-width,padding] duration-500 ease-in-out ${
              showSignup
                ? "max-w-[760px] px-10 py-16"
                : "max-w-[480px] px-20 py-12"
            }`}
          >
            {/* 로고 */}
            <div className="flex justify-center mb-8">
              <img src={logoImage} alt="Ondomi Logo" className="h-16 w-auto" />
            </div>
            {/* 창 전환 */}
            <div
              className={`${basicClass} ${
                showSignup
                  ? "min-h-[520px] md:min-h-[600px]"
                  : "min-h-[280px] md:min-h-[320px]"
              }`}
            >
              {/* 로그인 */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  showSignup
                    ? "-translate-x-full opacity-0"
                    : "translate-x-0 opacity-100"
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
                        setLoginError("");
                      }}
                    />
                    {usernameError && (
                      <p className="text-xs text-red-500 mt-1">
                        {usernameError}
                      </p>
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
                  {loginError && (
                    <p className="text-xs text-red-500 -mt-1 mb-1">{loginError}</p>
                  )}
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
                    onClick={() => {
                      setShowSignupStep2(false);
                      setShowSignupStep3(false);
                      setSignupInstance((prev) => prev + 1);
                      setShowSignup(true);
                    }}
                  >
                    회원가입
                  </button>
                </div>
              </div>

              {/* 회원가입 창 변경 */}
              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  signupPaneVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                } h-full overflow-auto`}
              >
                <Signup
                  key={`signup-step1-${signupInstance}`}
                  inline
                  onClose={() => setShowSignup(false)}
                  onNext={() => setShowSignupStep2(true)}
                />
              </div>

              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  signup2PaneVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                } h-full overflow-auto`}
              >
                <Signup2
                  key={`signup-step2-${signupInstance}`}
                  inline
                  onNext={() => setShowSignupStep3(true)}
                />
              </div>

              <div
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  signup3PaneVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                } h-full overflow-auto`}
              >
                <Signup3
                  key={`signup-step3-${signupInstance}`}
                  inline
                  onDone={() => {
                    setShowSignup(false);
                    setShowSignupStep2(false);
                    setShowSignupStep3(false);
                    navigate("/login", { replace: true });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
