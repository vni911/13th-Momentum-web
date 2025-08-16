import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup2 = ({ inline = false, onNext }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const diseaseList = [
    "고혈압 / 저혈압 / 부정맥 / 심부전천신",
    "천식 / 폐기종",
    "당뇨",
    "갑상선 기능 항진증 / 저하증",
    "피부질환",
    "임신 중",
  ];

  const toggleSelect = (idx) => {
    if (selected.includes(idx)) {
      setSelected(selected.filter((item) => item !== idx));
    } else {
      setSelected([...selected, idx]);
    }
  };

  return (
    <div className={inline ? "" : "min-h-screen bg-[#F8F8F8]"}>

      <div className="max-w-[1120px] mx-auto px-4 md:px-8 lg:px-10 mt-10 text-center">
        <h2 className="text-xl font-semibold mb-1">
          평소 겪고 있는 질환이 있나요?
        </h2>
      </div>

      <div className="max-w-[620px] mx-auto mt-8 pb-24">
        <div className="grid grid-cols-2 gap-10 p-8">
          {diseaseList.map((label, idx) => (
            <button
              key={idx}
              onClick={() => toggleSelect(idx)}
              className={`w-full aspect-square rounded-2xl font-semibold transition-all p-6
                ${
                  selected.includes(idx)
                    ? "bg-[#A7B7FF] text-black"
                    : "bg-[#F2F2F2] text-black hover:bg-[#e8e8e8]"
                } shadow-[0_4px_12px_rgba(0,0,0,0.06)]`}
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
            className="w-full py-4 rounded-3xl bg-white text-center font-semibold 
                        shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup2;
