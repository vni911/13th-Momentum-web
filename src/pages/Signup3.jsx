import { useNavigate } from "react-router-dom";
import checkIcon from "../assets/Check.png";

const Signup3 = ({ inline = false, onDone }) => {
  const navigate = useNavigate();

  return (
    <div className={inline ? "" : "h-screen bg-white overflow-hidden"}>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 text-center space-y-8">
          <div className="flex justify-center items-center">
            <img src={checkIcon} alt="checkIcon" />
          </div>
          <h2 className="text-3xl font-semibold py-12">
            회원가입이 완료되었습니다!
          </h2>
        </div>
        <div className="w-full px-8 mt-8">
          <button
            onClick={() =>
              inline && typeof onDone === "function"
                ? onDone()
                : navigate("/login")
            }
            className="w-full py-4 rounded-3xl bg-gray-200 text-black text-center font-semibold 
                       transition-all duration-300 hover:bg-gray-300 shadow-sm hover:shadow-md"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup3;
