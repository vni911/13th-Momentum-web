import axios from "axios";

const authApi = (accessToken) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }


  let baseURL = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV) {
    baseURL = import.meta.env.VITE_DEV_PROXY_URL;
  }

  return axios.create({
    baseURL,
    headers,
    withCredentials: true,
  });
};

export default authApi;
