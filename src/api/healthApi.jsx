import axios from "axios";

let baseURL = "http://ondomi.site/api";
if (import.meta.env.DEV) {
  baseURL = "/api";
}

const HEALTH_BASE = `${baseURL}/health`;
const HEALTH_DATA_BASE = `${baseURL}/healthdata`;

export const getLatestHealth = async () => {
  const { data } = await axios.get(`${HEALTH_BASE}/latest`, {
    withCredentials: true,
  });
  return data;
};

// openWeather를 통해 습도, 온도 조회
// 이후 건강 데이터와 함께 예측 요청
export const getPrediction = async (healthData, lat = null, lon = null) => {
  try {
    const url = new URL('/predict', HEALTH_DATA_BASE);
    if (lat && lon) {
      url.searchParams.append('lat', lat);
      url.searchParams.append('lon', lon);
    }

    const response = await axios.post(url.toString(), healthData, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error('AI 예측 조회 오류:', error);
    throw error;
  }
};