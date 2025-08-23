import authApi from "./authApi.jsx";

const signUpApi = async (body) => {
    try {
        const api = authApi();
        console.log('[signupApi] request body:', body);
        const result = await api.post("/users/register", body);
        console.log(result.data);
        return result.data;
    } catch (err) {
        if (err.response) {
            console.error("[signupApi] response error:", err.response.data);
            const serverMessage = err.response.data?.message || err.response.data?.error || "요청 값이 올바르지 않습니다.";
            const fieldErrors = err.response.data?.errors;
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                const details = fieldErrors.map(e => `${e.field || e.name || 'field'}: ${e.defaultMessage || e.message || 'invalid'}`).join(', ');
                throw new Error(`${serverMessage} (${details})`);
            }
            throw new Error(serverMessage + ` (status: ${err.response.status})`);
        } else if (err.request) {
            console.error("[signupApi] request error:", err.request);
            throw new Error("서버로부터 응답이 없습니다.");
        } else {
            console.error("[signupApi] unknown error:", err);
            throw new Error("요청 중 알 수 없는 오류가 발생했습니다.");
        }
    }
};

export default signUpApi;
