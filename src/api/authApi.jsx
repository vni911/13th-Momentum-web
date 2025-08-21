import axios from "axios";

const authApi = (accessToken) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let baseURL = 'http://3.36.95.174:8080/api';
  if (import.meta.env.DEV) {
    baseURL = '/api';
  }

  return axios.create({
    baseURL,
    headers,
    withCredentials: true,
  });
};

export default authApi;
