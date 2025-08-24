import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE_URL;
if (import.meta.env.DEV) {
  baseURL = ''; // 개발 환경에서는 프록시 사용
}

const HEALTH_BASE = `${baseURL}/api/health`;
const HEALTH_DATA_BASE = `${baseURL}/api/healthdata`;

export const getLatestHealth = async () => {
  const { data } = await axios.get(`${HEALTH_BASE}/latest`, {
    withCredentials: true,
  });
  return data;
};

// 워치 데이터 가져오기 (최신 건강 데이터)
export const getMyLastHealthData = async () => {
  try {
    console.log('요청 URL:', `${HEALTH_DATA_BASE}/latest`);
    const response = await axios.get(`${HEALTH_DATA_BASE}/latest`, {
      withCredentials: true,
    });
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    // 데이터가 비어있으면 테스트 데이터를 먼저 보내보기
    if (!response.data || Object.keys(response.data).length === 0) {
      console.log('데이터가 비어있음. 테스트 데이터를 보내보겠습니다...');
      try {
        const testData = {
          heartRate: 75,
          bodyTemperature: 36.8,
          measurementTime: new Date().toISOString()
        };
        
        const postResponse = await axios.post(`${HEALTH_DATA_BASE}`, testData, {
          withCredentials: true,
        });
        console.log('테스트 데이터 전송 성공:', postResponse.data);
        
        // 다시 데이터 조회
        const retryResponse = await axios.get(`${HEALTH_DATA_BASE}/latest`, {
          withCredentials: true,
        });
        console.log('재조회 응답 데이터:', retryResponse.data);
        return retryResponse.data;
      } catch (postError) {
        console.error('테스트 데이터 전송 실패:', postError);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('워치 데이터 조회 오류:', error);
    console.error('에러 응답:', error.response?.data);
    console.error('에러 상태:', error.response?.status);
    throw error;
  }
};

// openWeather를 통해 습도, 온도 조회
// 이후 건강 데이터와 함께 예측 요청
export const getPrediction = async (healthData, lat = null, lon = null) => {
  try {
    const url = new URL('/api/healthdata/predict', HEALTH_DATA_BASE);
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