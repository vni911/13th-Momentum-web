import React, { useEffect, useState } from "react";
import {
  getProtectors,
  addProtector,
  updateProtector,
  deleteProtector,
} from "../api/ProtectorApi";

const ContactModal = ({ onClose, initialContacts = [] }) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", relation: "", phone: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editContact, setEditContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });

  const phoneRegex = /^010-\d{4}-\d{4}$/;
  const relationOptions = ["아버지", "어머니", "형제/자매", "조부모", "기타"];

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getProtectors();
        setContacts(data);
      } catch (err) {
        alert("보호자 목록 조회 실패");
      }
    };
    fetchContacts();
  }, []);

  // 보호자 추가
  const handleAdd = async () => {
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

    try {
      await addProtector(newContact);
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
    } catch (err) {
      alert("보호자 등록 실패");
    }
  };

  // 수정 시작
  const startEdit = (index) => {
    setEditIndex(index);
    const contact = contacts[index];
    setEditContact(contact);
    setNewName("");
    setNewRelation("");
    setNewPhone("");
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditContact({
      name: "",
      relation: "",
      phone: "",
    });
    setNewName("");
    setNewRelation("");
    setNewPhone("");
    setErrors({ name: "", relation: "", phone: "" });
  };

  // 수정 저장
  const handleEditSave = async () => {
    if (
      editContact.name === contacts[editIndex].name &&
      editContact.relation === contacts[editIndex].relation &&
      editContact.phone === contacts[editIndex].phone
    ) {
      setEditIndex(null);
      setEditContact(null);
      return;
    }
    if (
      !editContact.name.trim() ||
      !phoneRegex.test(editContact.phone.trim())
    ) {
      alert("이름 또는 전화번호 양식이 올바르지 않습니다.");
      return;
    }

    try {
      await updateProtector(editContact);
      const updated = [...contacts];
      updated[editIndex] = editContact;
      setContacts(updated);

      // 초기화
      setEditIndex(null);
      setEditContact(null);
      setNewName("");
      setNewRelation("");
      setNewPhone("");
      setErrors({ name: "", relation: "", phone: "" });
    } catch (err) {
      alert("수정 실패");
    }
  };

  const handleEditChange = (field, value) => {
    setEditContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 보호자 삭제
  const handleDelete = async (contact) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteProtector(contact.id);
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
    } catch (err) {
      alert("보호자 삭제 실패");
    }
  };

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
                  {editIndex === idx ? (
                    <>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={editContact.name}
                          onChange={(e) =>
                            handleEditChange("name", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        />
                        <select
                          value={editContact.relation}
                          onChange={(e) =>
                            handleEditChange("relation", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {relationOptions.map((rel) => (
                            <option key={rel} value={rel}>
                              {rel}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editContact.phone}
                          onChange={(e) =>
                            handleEditChange("phone", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex flex-row items-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <button
                            className="text-xs sm:text-sm text-gray-600 font-bold hover:bg-[#495BFF] rounded-l-lg pr-3 pl-4 py-2 transition-colors duration-250 ease-in-out hover:text-gray-100"
                            onClick={handleEditSave}
                          >
                            저장
                          </button>
                          <div className="group flex flex-row items-center">
                            <div className="group h-5 border-[0.5px] border-gray-300 group-hover:border-white"></div>
                            <button
                              className="text-xs sm:text-sm text-gray-600 font-bold group-hover:bg-[#FF6161] rounded-r-lg pr-4 pl-3 py-2 transition-colors duration-250 ease-in-out hover:text-gray-100"
                              onClick={handleCancelEdit}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm sm:text-base text-gray-800 font-semibold">
                        {contact.name}{" "}
                        <span className="text-gray-500">
                          ({contact.relation})
                        </span>{" "}
                        - <span className="text-blue-600">{contact.phone}</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex flex-row items-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                          <button
                            className="text-xs sm:text-sm text-gray-600 font-bold hover:bg-[#C2C2C2] rounded-l-lg pr-3 pl-4 py-2 transition-colors duration-250 ease-in-out"
                            onClick={() => startEdit(idx)}
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
                    </>
                  )}
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
            onClick={editIndex !== null ? handleEditSave : handleAdd}
            className="bg-[#495BFF] text-white px-3 py-2 rounded-xl shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl text-sm sm:text-base"
          >
            추가
          </button>
        </div>

        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-xl hover:bg-gray-400 text-sm sm:text-base"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
