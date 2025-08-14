import axios from "axios";

const usernameCheckApi = async (username) => {
  const { data } = await axios.get("http://43.201.75.36:8080/api/users/check-username", {
   params: { username },
   headers: {
     "Content-Type": "application/json",
   },
   withCredentials: true,
  });
  return data; 
};

export default usernameCheckApi;
