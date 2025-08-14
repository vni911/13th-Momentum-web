import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backIcon from "../assets/back.png";
import homeIcon from "../assets/home.png";

const Signup = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

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
                type="id"
                placeholder="영문/숫자 조합 6자 이상"
                className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
              />
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
                />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  className="w-full h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                />
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
              />
            </div>

            <div>
              <label className="block text-[15px] font-medium text-gray-800 mb-2">
                휴대전화
              </label>
              <div className="grid grid-cols-[1fr,112px] gap-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="- 제외하고 번호 입력"
                  className="h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="h-[48px] rounded-lg border px-4 text-sm font-medium border-[#495BFF] text-[#495BFF] bg-white hover:bg-blue-50"
                >
                  인증요청
                </button>
              </div>
              <div className="mt-3 grid grid-cols-[1fr,112px] gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="h-[48px] rounded-lg border border-gray-200 px-4 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  disabled
                  className="h-[48px] rounded-lg px-4 text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  확인
                </button>
              </div>
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
              onClick={() => navigate("/signup/2")}
              className="w-full rounded-3xl bg-white py-4 text-center font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-shadow"
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
