import authApi from "./authApi.jsx";


const API_URL = "/dashboard/protector";

export const getProtectors = async () => {
  console.log("ProtectorApi - 현재 쿠키:", document.cookie);

  const api = authApi();
  console.log("ProtectorApi - API 호출:", API_URL);
  
  try {
    const { data } = await api.get(API_URL);
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      relation: p.relation || "기타",
      phone: p.phone,
    }));
  } catch (error) {
    console.error("오류:", error.response?.data);
    throw error;
  }
};

export const addProtector = async (contact) => {
  const api = authApi();
  const { data } = await api.post(API_URL, contact);
  return data;
};

export const updateProtector = async (body, id) => {
  const api = authApi();
  const { data } = await api.put(`${API_URL}/${id}`, body);
  return data;
};

export const deleteProtector = async (id) => {
  const api = authApi();
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};
