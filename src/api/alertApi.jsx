import authApi from "./authApi.jsx";

export const sendRiskAlert = async ({ level, prob }) => {
  const api = authApi();
  const params = new URLSearchParams();
  params.append("level", level);
  if (prob !== undefined && prob !== null) params.append("prob", prob);

  const { data } = await api.post(`/alert/risk?${params.toString()}`);
  return data;
};