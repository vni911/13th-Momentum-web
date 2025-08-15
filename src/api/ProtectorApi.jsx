import axios from "axios";

// 보호자 목록 조회
let baseURL = "http://43.201.75.36:8080/api";
if (import.meta.env.DEV) {
  baseURL = "/api";
}

const API_URL = `${baseURL}/dashboard/protector`;

export const getProtectors = async () => {
  const { data } = await axios.get(API_URL, {
    withCredentials: true,
  });
  return data;
};

export const addProtector = async (contact) => {
  const { data } = await axios.post(API_URL, contact, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

export const updateProtector = async (contact) => {
  const { data } = await axios.put(`${API_URL}/${contact.id}`, contact, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
  return data;
};

export const deleteProtector = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return data;
};
