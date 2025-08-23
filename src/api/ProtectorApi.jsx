import axios from "axios";

// 보호자 목록 조회
let baseURL = "http://15.165.75.121:8080/api";
if (import.meta.env.DEV) {
  baseURL = "/api";
}

const API_URL = `${baseURL}/dashboard/protector`;

export const getProtectors = async () => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    relation: p.relation || "기타",
    phone: p.phone,
  }));
};

export const addProtector = async (contact) => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.post(API_URL, contact, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const updateProtector = async (body, id) => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.put(`${API_URL}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const deleteProtector = async (id) => {
  const token = localStorage.getItem("accessToken");
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
