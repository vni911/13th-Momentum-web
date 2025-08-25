import authApi from "./authApi.jsx";

const getApi = () => {
  const token = localStorage.getItem("accessToken");
  return authApi(token);
};

// New preferred name
export const updateUsername = async (newName) => {
  const API_URL = "/users/name";
  const api = getApi();
  try {
    // Many backends expect { username: newName }
    const { data } = await api.patch(API_URL, { username: newName });
    return data;
  } catch (err) {
    throw err;
  }
};

// Backward compatibility alias
export const patchUsername = updateUsername;

// New preferred name
export const fetchUsername = async () => {
  const API_URL = "/users/name";
  const api = getApi();
  try {
    const { data } = await api.get(API_URL);
    return data;
  } catch (err) {
    throw err;
  }
};

// Backward compatibility alias
export const getUsername = fetchUsername;
