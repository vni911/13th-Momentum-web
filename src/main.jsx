import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// 비로그인 상태에서 콘솔 로그를 숨기기 위한 전역 필터
(function setupConsoleFilter() {
  const original = {
    log: console.log,
    info: console.info,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
  };

  let muted = false;

  const apply = () => {
    const hasToken = !!localStorage.getItem("accessToken");
    const shouldMute = !hasToken;
    if (muted === shouldMute) return;
    muted = shouldMute;
    if (muted) {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
      console.warn = () => {};
      console.error = () => {};
    } else {
      console.log = original.log;
      console.info = original.info;
      console.debug = original.debug;
      console.warn = original.warn;
      console.error = original.error;
    }
  };

  // 초기 적용
  apply();

  // 탭 전환/복귀 시 재평가
  window.addEventListener("focus", apply);
  document.addEventListener("visibilitychange", apply);

  // 다른 탭에서 토큰 변경 시 동기화
  window.addEventListener("storage", (e) => {
    if (e.key === "accessToken") apply();
  });

  // 간단한 주기적 체크 (동일 탭 내 동적 변경 대응)
  setInterval(apply, 1000);
})();

createRoot(document.getElementById("root")).render(<App />);
