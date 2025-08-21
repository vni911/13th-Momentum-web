import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup2 = ({ inline = false, onNext }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const diseaseList = [
    "고혈압 / 저혈압 / 부정맥 / 심부전천신",
    "천식 / 폐기종",
    "당뇨",
    "갑상선 기능항진증, 저하증",
    "임신 중",
    "피부질환",
  ];

  const toggleSelect = (idx) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter((item) => item !== idx));
    } else {
      setSelected([...selected, idx]);
    }
  };

  return (
    <div className={inline ? "" : "min-h-screen bg-white"}>
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 mt-10 text-center">
        <h2 className="text-xl font-semibold mb-1">
          평소 앓고 있는 질환이 있나요?
        </h2>
      </div>

      <div className="max-w-[620px] mx-auto mt-8 pb-24">
        <div className="flex flex-col gap-4 p-8">
          {diseaseList.map((label, idx) => (
            <button
              key={idx}
              onClick={() => toggleSelect(idx)}
              className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 text-left
                ${
                  selected.includes(idx)
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg"
                    : "bg-white text-black border border-gray-200 hover:border-gray-300 shadow-sm"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        {selected.length > 0 && (
          <p className="text-sm text-red-500 text-center mt-4 mb-2">
            선택한 질환이 있을 경우 측정이 어려울 수 있습니다.
          </p>
        )}

        <div className="mt-10">
          <button
            onClick={() => (inline && typeof onNext === 'function' ? onNext() : navigate("/signup/3"))}
            className="w-full py-4 rounded-3xl bg-blue-500 text-white text-center font-semibold 
                        transition-all duration-300 hover:bg-blue-600 shadow-lg hover:shadow-xl"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup2;
