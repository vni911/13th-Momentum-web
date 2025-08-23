import authApi from "./authApi.jsx";


const API_URL = "/api/dashboard/protector";

export const getProtectors = async () => {
  const token = localStorage.getItem("accessToken");
  const api = authApi(token);
  const { data } = await api.get(API_URL);
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    relation: p.relation || "기타",
    phone: p.phone,
  }));
};

export const addProtector = async (contact) => {
  const token = localStorage.getItem("accessToken");
  const api = authApi(token);
  const { data } = await api.post(API_URL, contact);
  return data;
};

export const updateProtector = async (body, id) => {
  const token = localStorage.getItem("accessToken");
  const api = authApi(token);
  const { data } = await api.put(`${API_URL}/${id}`, body);
  return data;
};

export const deleteProtector = async (id) => {
  const token = localStorage.getItem("accessToken");
  const api = authApi(token);
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};
