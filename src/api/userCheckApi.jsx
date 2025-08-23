import axios from "axios";

const usernameCheckApi = async (username) => {
  let baseURL = 'http://ondomi.site/api';
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
