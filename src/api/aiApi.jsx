import axios from "axios";

//쿼리 생성
const qs = (params = {}) => {
  const entries = Object.entries(params).filter(([_, v]) => v !== null && v !== undefined);
  if (entries.length === 0) return "";
  const query = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `?${query}`;
};


// AI 서버 직접 호출(ai to web)
export const predictRisk = async (payload, lat = null, lon = null) => {
  const url = "/ai/predict" + qs({ lat, lon });
  const { data } = await axios.post(url, payload);
  return data;
};

// 서버 경유 호출(ai to backend to web)
export const predictRiskViaBackend = async (payload, lat = null, lon = null) => {
  const url = "/api/healthdata/predict" + qs({ lat, lon });
  const { data } = await axios.post(url, payload, { withCredentials: true });
  return data;
};

// 백엔드 서버 우선, 실패 시 AI 직접 호출(동작 확인 필요)
export const predictRiskSmart = async (payload, lat = null, lon = null) => {
  try {
    return await predictRiskViaBackend(payload, lat, lon);
  } catch (e) {
    return await predictRisk(payload, lat, lon);
  }
};