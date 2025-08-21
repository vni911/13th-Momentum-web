import axios from "axios";

const usernameCheckApi = async (username) => {
  let baseURL = 'http://3.36.95.174:8080/api';
  if (import.meta.env.DEV) {
    baseURL = '/api';
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
