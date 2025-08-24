import authApi from "./authApi.jsx";

export const patchUsername = async (newName) => {
  const API_URL = "/users/name";

  const api = authApi();
  console.log("ProtectorApi - API 호출 (PATCH):", API_URL, { newName });

  try {
    const { data } = await api.patch(API_URL, { newName });
    return data;
  } catch (err) {
    console.error("사용자 프로필 변경 오류:", err.response?.data);
    throw err;
  }
};

export const getUsername = async () => {
  const API_URL = "/users/name";

  const api = authApi();
  console.log("ProtectorApi - API 호출 (GET):", API_URL);

  try {
    const { data } = await api.get(API_URL);
    return data;
  } catch (err) {
    console.error("사용자 프로필 조회 오류:", err.response?.data);
    throw err;
  }
};
