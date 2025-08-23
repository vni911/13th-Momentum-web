import axios from "axios";

const usernameCheckApi = async (username) => {
  let baseURL = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV) {
    baseURL = import.meta.env.VITE_DEV_PROXY_URL;
  }

  const { data } = await axios.get(`${baseURL}/users/check-username`, {
    params: { username },
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return data;
};

export default usernameCheckApi;
