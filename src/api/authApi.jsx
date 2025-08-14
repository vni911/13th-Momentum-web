import axios from "axios";

const authApi = (accessToken) => 
    axios.create({
         baseURL: "http://43.201.75.36:8080/api",
         headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
    },
    withCredentials: true,
    });

export default authApi;
