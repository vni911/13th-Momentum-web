import { useNavigate } from "react-router-dom";

const Signup3 = ({ inline = false, onDone }) => {
  const navigate = useNavigate();

  return (
    <div className={inline ? "" : "min-h-screen bg-[#F8F8F8]"}>
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">회원가입이 완료되었습니다!</h2>
        <p className="text-lg text-gray-500">로그인 화면으로 이동해 계속 진행해 주세요.</p>
      </div>
      <button
            onClick={() => (inline && typeof onDone === 'function' ? onDone() : navigate("/login"))}
            className="w-full py-4 rounded-3xl bg-white text-center font-semibold 
                       shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            로그인으로 돌아가기
          </button>
    </div>
  );
};

export default Signup3;