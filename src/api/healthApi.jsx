import axios from "axios";

let baseURL = "http://43.201.75.36:8080/api";
if (import.meta.env.DEV) {
  baseURL = "/api";
}

const HEALTH_BASE = `${baseURL}/health`;

export const getLatestHealth = async () => {
  const { data } = await axios.get(`${HEALTH_BASE}/latest`, {
    withCredentials: true,
  });
  return data;
};