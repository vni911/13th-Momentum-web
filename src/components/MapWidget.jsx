import React, { useEffect, useState } from "react";
import ShadeShelterLogo from "../assets/ShadeShelterLogo.png";
import { getCurrentCoordinates } from "../api/locationApi";

const DEFAULT_CENTER = { lat: 35.8299, lng: 128.7614 };

const loadKakaoMapScript = (appKey) => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(resolve);
      return;
    }

    const existing = document.getElementById("kakao-map-sdk");
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(resolve);
        } else {
          reject(new Error("카카오맵 SDK 로딩에 실패했습니다."));
        }
      });
      existing.addEventListener("error", () =>
        reject(new Error("카카오맵 스크립트를 불러오지 못했습니다."))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;
    script.async = true;
    console.log("Kakao SDK 로딩 다시시시도", script.src);
    const timeoutId = setTimeout(() => {
      console.warn("Kakao SDK 로드 타임아웃");
      reject(
        new Error(
          "카카오맵 스크립트 로드가 시간 초과되었습니다. 네트워크/도메인/키 설정을 확인해주세요."
        )
      );
    }, 5000);
    script.onload = () => {
      clearTimeout(timeoutId);
      if (window.kakao && window.kakao.maps) {
        const mapsLoadTimeout = setTimeout(() => {
          console.warn("타임아웃");
          // 폴백: autoload=true로 재시도
          const fallbackId = "kakao-map-sdk-autoload";
          if (!document.getElementById(fallbackId)) {
            const fb = document.createElement("script");
            fb.id = fallbackId;
            fb.async = true;
            fb.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=true&libraries=services,clusterer`;
            fb.onload = () => {
              if (window.kakao && window.kakao.maps) {
                console.log("로드 성공");
                resolve();
              } else {
                reject(new Error("카카오맵 로드에 실패했습니다."));
              }
            };
            fb.onerror = () =>
              reject(new Error("카카오맵 스크립트를 불러오지 못했습니다."));
            document.head.appendChild(fb);
          } else {
            resolve();
          }
        }, 5000);
        try {
          window.kakao.maps.load(() => {
            clearTimeout(mapsLoadTimeout);
            resolve();
          });
        } catch {
          clearTimeout(mapsLoadTimeout);
          reject(
            new Error("카카오맵 라이브러리 초기화 중 오류가 발생했습니다.")
          );
        }
      } else {
        reject(new Error("카카오맵 SDK 로딩에 실패했습니다."));
      }
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error("카카오맵 스크립트를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });
};

const MapWidget = ({ shelters }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [initialCenter, setInitialCenter] = useState(null);
  const [containerEl, setContainerEl] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [shelterMarkers, setShelterMarkers] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  const waitForContainerReady = (container) => {
    return new Promise((resolve, reject) => {
      if (!container)
        return reject(new Error("지도 컨테이너가 존재하지 않습니다."));

      const inDom = () => container && document.body.contains(container);
      const hasSize = () =>
        inDom() && container.offsetWidth > 0 && container.offsetHeight > 0;

      if (hasSize()) return resolve();

      const observer = new ResizeObserver(() => {
        if (hasSize()) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(container);

      // 타임아웃
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error("지도 컨테이너가 준비되지 않았습니다. (timeout)"));
      }, 5000);

      // DOM 연결 체크
      const intervalId = setInterval(() => {
        if (!inDom()) return;
        if (hasSize()) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          observer.disconnect();
          resolve();
        }
      }, 100);
    });
  };

  // Kakao SDK 로드
  const [reloadNonce, setReloadNonce] = useState(0);

  useEffect(() => {
    const loadSdk = async () => {
      try {
        console.log("SDK 로드 시작");
        const appKey =
          import.meta.env.VITE_KAKAO_MAP_APP_KEY ||
          import.meta.env.VITE_MAP_API_KEY;
        if (!appKey) {
          throw new Error("API 키가 설정되지 않았습니다.");
        }
        await loadKakaoMapScript(appKey);
        console.log("SDK 로드 완료");
        setSdkReady(true);
      } catch (err) {
        console.error("지도 SDK 로드 실패:", err);
        const hint = err.message.includes("스크립트를 불러오지 못했습니다")
          ? `API 키가 설정되지 않았습니다.`
          : "";
        setError(`${err.message}${hint ? `\n${hint}` : ""}`);
        setLoading(false);
      }
    };
    loadSdk();
  }, [reloadNonce]);

  // 초기위치치
  useEffect(() => {
    let done = false;
    const fallbackTimer = setTimeout(() => {
      if (!done) {
        done = true;
        setInitialCenter(DEFAULT_CENTER);
      }
    }, 1200);

    const getLocation = async () => {
      try {
        const locationData = await getCurrentCoordinates();
        if (!done) {
          done = true;
          clearTimeout(fallbackTimer);
          setInitialCenter({ lat: locationData.lat, lng: locationData.lng });
        }
      } catch {
        if (!done) {
          done = true;
          clearTimeout(fallbackTimer);
          setInitialCenter(DEFAULT_CENTER);
        }
      }
    };

    getLocation();
    return () => clearTimeout(fallbackTimer);
  }, []);

  // 지도 인스턴스 생성
  useEffect(() => {
    if (!sdkReady) return;
    if (!initialCenter) return;
    if (mapInstance) return;

    let cancelled = false;
    const run = async () => {
      const container = containerEl;
      if (!container) return;
      try {
        console.log("컨테이너 준비 대기 시작");
        await waitForContainerReady(container);
        console.log("컨테이너 준비 완료", {
          w: container.offsetWidth,
          h: container.offsetHeight,
        });
        if (cancelled) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(
            initialCenter.lat,
            initialCenter.lng
          ),
          level: 3,
        });
        setMapInstance(map);

        const mk = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(
            initialCenter.lat,
            initialCenter.lng
          ),
        });
        mk.setMap(map);
        setMarker(mk);

        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        setLoading(false);
        console.log("지도 생성 완료");
      } catch (err) {
        console.error("지도 생성 실패:", err);
        setError(
          "지도를 초기화하는 중 문제가 발생했습니다. (컨테이너 준비 실패)"
        );
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [sdkReady, reloadNonce, initialCenter, containerEl, mapInstance]);

  // 무더위 쉼터 마커
  useEffect(() => {
    if (!mapInstance || shelters.length === 0) {
      shelterMarkers.forEach((marker) => marker.setMap(null));
      setShelterMarkers([]);
      return;
    }

    shelterMarkers.forEach((marker) => marker.setMap(null));

    const newShelterMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    const imageSrc = ShadeShelterLogo;
    const imageSize = new window.kakao.maps.Size(32, 32);
    const imageOption = { offset: new window.kakao.maps.Point(16, 16) };

    const markerImage = new window.kakao.maps.MarkerImage(
      imageSrc,
      imageSize,
      imageOption
    );

    if (marker) {
      bounds.extend(marker.getPosition());
    }
    shelters.forEach((shelter) => {
      const position = new window.kakao.maps.LatLng(shelter.lat, shelter.lng);
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage,
      });

      // 카카오 쪽 dom이라 tailwind가 적용이 안됐음.. 일단 그냥 css로
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="
            padding: 12px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 200px; 
            max-width: 280px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            background: white;
            border: 1px solid #e5e7eb;
          ">
            <div style="
              font-weight: 600; 
              font-size: 14px; 
              color: #1f2937; 
              margin-bottom: 6px;
              line-height: 1.3;
            ">${shelter.name}</div>
            ${
              shelter.address
                ? `<div style="
              color: #6b7280; 
              font-size: 12px; 
              line-height: 1.4;
              margin-bottom: 4px;
            ">${shelter.address}</div>`
                : ""
            }
            <div style="
              color: #2563eb; 
              font-size: 12px; 
              font-weight: 500;
              background: #eff6ff;
              padding: 4px 8px;
              border-radius: 4px;
              display: inline-block;
            ">${shelter.distance}</div>
          </div>
        `,
        removable: true,
        zIndex: 1,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", function () {
        infowindow.open(mapInstance, marker);
      });

      marker.setMap(mapInstance);
      newShelterMarkers.push(marker);
      bounds.extend(position); // 모든 마커가 보이도록 바운드 확장
    });

    setShelterMarkers(newShelterMarkers);

    // 모든 마커가 보이는 위치로 지도 중심 이동 및 레벨 조정
    if (newShelterMarkers.length > 0) {
      mapInstance.setBounds(bounds);
    }
  }, [shelters, mapInstance, marker]);

  // 내 위치
  const recenterToCurrentLocation = async () => {
    if (!mapInstance) return;
    setIsLocating(true);
    try {
      const locationData = await getCurrentCoordinates();
      const latLng = new window.kakao.maps.LatLng(
        locationData.lat,
        locationData.lng
      );
      mapInstance.panTo(latLng);
      if (marker) {
        marker.setPosition(latLng);
      }
    } catch (error) {
      console.warn("위치 요청 실패", error);
      setError("현재 위치를 가져오지 못했습니다.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">지도</h3>
        <p className="text-sm text-gray-600">
          근처 시설을 지도에서 확인해보세요
        </p>
      </div>

      <div className="relative">
        <div className="w-full h-80 rounded-[5px] overflow-hidden border border-gray-300">
          <div ref={setContainerEl} className="h-full w-full" />
        </div>

        <div className="absolute right-3 bottom-3 z-10">
          <button
            onClick={recenterToCurrentLocation}
            disabled={isLocating}
            className={`px-3 py-2 text-sm rounded-md border shadow bg-white hover:bg-gray-50 ${
              isLocating ? "opacity-60 cursor-not-allowed" : ""
            }`}
            title="내 위치"
          >
            {isLocating ? "위치 확인 중..." : "내 위치"}
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">지도 로딩 중...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center border border-gray-300">
            <div className="flex flex-col items-center space-y-2 px-4 text-center">
              <span className="text-sm text-red-500">오류: {error}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log("수동 재시도");
                    setError(null);
                    setLoading(true);
                    setSdkReady(false);
                    // 강제로 다시 렌더링
                    setReloadNonce((n) => n + 1);
                  }}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 border border-blue-600"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapWidget;
