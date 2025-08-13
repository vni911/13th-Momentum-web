<<<<<<< HEAD
import React, { useEffect, useState } from "react";

const API_BASE = "http://43.201.75.36:8080/api/dashboard/protector";
=======
import React, { useState } from "react";
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)

const ContactModal = ({ onClose, initialContacts = [] }) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", relation: "", phone: "" });
<<<<<<< HEAD
  const [editIndex, setEditIndex] = useState(null);
  const [editContact, setEditContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });
=======
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)

  const phoneRegex = /^010-\d{4}-\d{4}$/;
  const relationOptions = ["아버지", "어머니", "형제/자매", "조부모", "기타"];

<<<<<<< HEAD
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(API_BASE, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        } else {
          alert("보호자 목록 조회 실패");
        }
      } catch (err) {
        alert("서버 오류");
      }
    };
    fetchContacts();
  }, []);

  const handleAdd = async () => {
=======
  const handleAdd = () => {
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
    let newErrors = { name: "", relation: "", phone: "" };
    let isError = false;

    if (!newName.trim()) {
      newErrors.name = "이름 입력";
      isError = true;
    }
    if (!newRelation) {
      newErrors.relation = "선택 필수";
      isError = true;
    }
    if (!phoneRegex.test(newPhone.trim())) {
      newErrors.phone = "ex) 010-XXXX-XXXX";
      isError = true;
    }

    setErrors(newErrors);
    if (isError) return;

    const newContact = {
      name: newName.trim(),
      relation: newRelation,
      phone: newPhone.trim(),
    };

<<<<<<< HEAD
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
        credentials: "include",
      });
      if (response.ok) {
        if (
          !contacts.some(
            (c) =>
              c.name === newContact.name &&
              c.relation === newContact.relation &&
              c.phone === newContact.phone
          )
        ) {
          setContacts([...contacts, newContact]);
          setNewName("");
          setNewRelation("");
          setNewPhone("");
          setErrors({ name: "", relation: "", phone: "" });
        }
      } else {
        alert("보호자 등록 실패");
      }
    } catch (err) {
      alert("서버 오류");
    }
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditContact({ ...contacts[index] });
  };

  const handleEditSave = async () => {
    if (
      !editContact.name.trim() ||
      !phoneRegex.test(editContact.phone.trim())
    ) {
      alert("이름 또는 전화번호 양식이 올바르지 않습니다.");
      return;
    }

    try {
      const response = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editContact),
        credentials: "include",
      });
      if (response.ok) {
        const updated = [...contacts];
        updated[editIndex] = editContact;
        setContacts(updated);
        setEditIndex(null);
      } else {
        alert("수정 실패");
      }
    } catch (err) {
      alert("서버 오류");
    }
  };

  const handleDelete = async (contact) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const response = await fetch(`${API_BASE}/${contact.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
        credentials: "include",
      });
      if (response.ok) {
        setContacts(
          contacts.filter(
            (c) =>
              !(
                c.name === contact.name &&
                c.relation === contact.relation &&
                c.phone === contact.phone
              )
          )
        );
      } else {
        alert("보호자 삭제 실패");
      }
    } catch (err) {
      alert("서버 오류");
    }
  };

=======
    if (
      !contacts.some(
        (c) =>
          c.name === newContact.name &&
          c.relation === newContact.relation &&
          c.phone === newContact.phone
      )
    ) {
      setContacts([...contacts, newContact]);
      setNewName("");
      setNewRelation("");
      setNewPhone("");
      setErrors({ name: "", relation: "", phone: "" });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleDelete = (contact) => {
    setContacts(contacts.filter((c) => c !== contact));
  };

  const handleSave = () => {
    console.log("저장된 보호자 연락처:", contacts);
    onClose();
  };

>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 sm:p-10 w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base sm:text-lg font-bold mb-4">
          📞 보호자 정보를 기입해주세요.
        </h2>

        {/* 연락처 목록 */}
        <div className="mb-4 overflow-y-auto flex-1">
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-sm">등록된 연락처가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {contacts.map((contact, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center flex-wrap sm:flex-nowrap bg-[#F6F6F6] px-4 py-3 rounded-xl"
                >
                  <div className="text-sm sm:text-base text-gray-800 font-semibold">
                    {contact.name}{" "}
                    <span className="text-gray-500">({contact.relation})</span>{" "}
                    - <span className="text-blue-600">{contact.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-row items-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <button
                        className="text-xs sm:text-sm text-gray-600 font-bold hover:bg-[#C2C2C2] rounded-l-lg pr-3 pl-4 py-2 transition-colors duration-250 ease-in-out"
<<<<<<< HEAD
                        onClick={() => startEdit(idx)}
=======
                        onClick={() => console.log("수정 기능 구현 예정")}
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
                      >
                        수정
                      </button>
                      <div className="group flex flex-row items-center">
                        <div className="group h-5 border-[0.5px] border-gray-300 group-hover:border-white"></div>
                        <button
                          className="text-xs sm:text-sm text-gray-600 font-bold group-hover:bg-[#FF6161] rounded-r-lg pr-4 pl-3 py-2 transition-colors duration-250 ease-in-out hover:text-gray-100"
                          onClick={() => handleDelete(contact)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="flex flex-col mb-4 space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
<<<<<<< HEAD
=======
              onKeyDown={handleKeyDown}
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
              className={`w-full border rounded-xl px-3 py-2 text-sm sm:text-base pr-20 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-red-500 whitespace-nowrap">
                {errors.name}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-1/4">
            <select
              value={newRelation}
              onChange={(e) => setNewRelation(e.target.value)}
<<<<<<< HEAD
=======
              onKeyDown={handleKeyDown}
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
              className={`w-full border rounded-xl px-3 py-2 text-sm sm:text-base pr-10 appearance-none ${
                errors.relation ? "border-red-500" : ""
              }`}
            >
              <option value="">관계 선택</option>
              {relationOptions.map((rel, idx) => (
                <option key={idx} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              ▼
            </span>
            {errors.relation && (
              <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-red-500 whitespace-nowrap">
                {errors.relation}
              </span>
            )}
          </div>

          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              placeholder="010-XXXX-XXXX"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
<<<<<<< HEAD
=======
              onKeyDown={handleKeyDown}
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
              className={`w-full border rounded-xl px-3 py-2 text-sm sm:text-base pr-28 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-red-500 whitespace-nowrap">
                {errors.phone}
              </span>
            )}
          </div>

          <button
<<<<<<< HEAD
            onClick={editIndex !== null ? handleEditSave : handleAdd}
            className="bg-[#495BFF] text-white px-3 py-2 rounded-xl shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl text-sm sm:text-base"
          >
            {editIndex !== null ? "수정 저장" : "추가"}
=======
            onClick={handleAdd}
            className="bg-[#495BFF] text-white px-3 py-2 rounded-xl shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl text-sm sm:text-base"
          >
            추가
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
          </button>
        </div>

        <div className="flex justify-end space-x-2 mt-2">
          <button
<<<<<<< HEAD
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 text-sm sm:text-base"
          >
            닫기
=======
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 text-sm sm:text-base"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 text-sm sm:text-base"
          >
            취소
>>>>>>> 15310ea (feat: 보호자 등록 모달창 구현)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
