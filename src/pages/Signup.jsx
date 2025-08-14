import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../assets/back.png";
import homeIcon from "../assets/home.png";

const Signup = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [name, setName] = useState("");
  const [idError, setIdError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwCheckError, setPwCheckError] = useState("");

  const [agreeAll, setAgreeAll] = useState(false);
  const [agreements, setAgreements] = useState({
    age14: false,
    tos: false,
  });

  const toggleAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreements({
      age14: next,
      tos: next,
    });
  };

  const toggleAgree = (key) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navigate = useNavigate();

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

      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 mt-10">
        <h1 className="text-center text-xl font-semibold leading-snug">
          안녕하세요!
          <br />
          가입을 위한 정보를 확인할게요
        </h1>
      </div>

      <div className="max-w-[620px] mx-auto mt-8 pb-24">
        <div className="bg-white rounded-3xl shadow-lg px-8 py-10">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                아이디
              </label>
              <input
                type="text"
                placeholder="영문/숫자 조합 6자 이상"
                className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                value={id}
                onChange={e => {
                  setId(e.target.value);
                  if (!/^[a-zA-Z0-9]{6,}$/.test(e.target.value)) {
                    setIdError("아이디는 영문/숫자 조합 6자 이상이어야 합니다.");
                  } else {
                    setIdError("");
                  }
                }}
              />
              {idError && (
                <p className="text-xs text-red-500 mt-1">{idError}</p>
              )}
            </div>

            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                비밀번호
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="영문/숫자/특수문자 조합 8~20자"
                  className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/.test(e.target.value)) {
                      setPwError("비밀번호는 영문/숫자/특수문자 조합 8~20자여야 합니다.");
                    } else {
                      setPwError("");
                    }
                  }}
                />
                {pwError && (
                  <p className="text-xs text-red-500 mt-1">{pwError}</p>
                )}
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                  value={passwordCheck}
                  onChange={e => {
                    setPasswordCheck(e.target.value);
                    if (e.target.value !== password) {
                      setPwCheckError("비밀번호가 일치하지 않습니다.");
                    } else {
                      setPwCheckError("");
                    }
                  }}
                />
                {pwCheckError && (
                  <p className="text-xs text-red-500 mt-1">{pwCheckError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                이름
              </label>
              <input
                type="text"
                placeholder="이름 입력"
                className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>


            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">

                보호자 휴대전화 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="text"
                placeholder="- 제외하고 입력"
                className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start gap-3 border-b border-gray-200 pb-4 mb-4">
                <input
                  id="agreeAll"
                  type="checkbox"
                  checked={agreeAll}
                  onChange={toggleAll}
                  className="mt-1 h-5 w-5 accent-black"
                />
                <label htmlFor="agreeAll" className="font-medium">
                  전체 동의
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreements.age14}
                    onChange={() => toggleAgree("age14")}
                    className="mt-1 h-4 w-4 accent-black"
                  />
                  <span className="text-sm">
                    만 14세 이상입니다.{" "}
                    <span className="text-red-500">(필수)</span>
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreements.tos}
                    onChange={() => toggleAgree("tos")}
                    className="mt-1 h-4 w-4 accent-black"
                  />
                  <span className="text-sm">
                    이용약관 <span className="text-red-500">(필수)</span>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              className="w-full rounded-3xl bg-white py-4 text-center font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-shadow"
              onClick={() => {
                if (idError || pwError || pwCheckError) return;
                if (!agreements.age14 || !agreements.tos) {
                  alert("필수 약관에 모두 동의해야 합니다.");
                  return;
                }
                navigate("/signup/2");
              }}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
