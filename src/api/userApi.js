import apiClient from './axiosInstance';
import { API_ENDPOINTS } from './config';

// 회원가입 API
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.USER_REGISTER, userData);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        code: error.code,
        details: error.response?.data
      }
    };
  }
};

// 로그인 API (향후 사용)
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.USER_LOGIN, credentials);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        code: error.code,
        details: error.response?.data
      }
    };
  }
};

// 에러 메시지 처리 함수
export const getErrorMessage = (error) => {
  const status = error.status;
  
  switch (status) {
    case 400:
      return "입력값 유효성 검증 실패 (전화번호, 생년월일 형식 등)";
    case 409:
      return "이미 존재하는 아이디입니다";
    case 401:
      return "인증에 실패했습니다";
    case 500:
      return "서버 오류가 발생했습니다";
    default:
      return error.message || "알 수 없는 오류가 발생했습니다";
  }
};
