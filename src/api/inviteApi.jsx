import authApi from "./authApi.jsx";

export const createInvite = async ({ name, phone }) => {
  const api = authApi();
  const { data } = await api.post(`/invite?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
  return data; // { token, expiresAt }
};

export const getKakaoAuthorizeUrl = async (token) => {
  const api = authApi();
  const { data } = await api.get(`/invite/kakao/authorize?token=${encodeURIComponent(token)}`);
  return data.authorizeUrl;
};