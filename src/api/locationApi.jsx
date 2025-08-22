// OpenStreetMap 주소 정보 가져오기
export const getLocationName = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&accept-language=ko`
    );

    if (!response.ok) {
      throw new Error("주소 정보를 가져올 수 없습니다.");
    }

    const data = await response.json();
    const address = data.address;
    let locationName = "현재 위치";

    if (address) {
      const state = address.state || address.province;
      const city = address.city || address.county;
      const district = address.district || address.suburb;
      const town = address.town || address.village || address.neighbourhood;
      const hamlet = address.hamlet;

      const parts = [];

      if (city && city !== state) {
        parts.push(city);
      }
      if (district) {
        parts.push(district);
      }
      if (town) {
        parts.push(town);
      }
      if (hamlet && hamlet !== town) {
        parts.push(hamlet);
      }

      if (parts.length >= 2) {
        locationName = parts.slice(0, 2).join(" ");
      } else if (parts.length === 1) {
        locationName = parts[0];
      } else if (city) {
        locationName = city;
      } else if (state) {
        locationName = state;
      }
    }

    return locationName;
  } catch (error) {
    console.error("주소 정보 가져오기 실패:", error);
    return "현재 위치";
  }
};

// 현재 위치 가져오기 (위치 권한 포함)
export const getCurrentLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("위치 정보 접근이 거부되었습니다."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("위치 정보를 사용할 수 없습니다."));
              break;
            case error.TIMEOUT:
              reject(new Error("위치 정보 요청 시간이 초과되었습니다."));
              break;
            default:
              reject(new Error("위치 정보를 가져올 수 없습니다."));
          }
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });

    const { latitude, longitude } = position.coords;
    const locationName = await getLocationName(latitude, longitude);
    
    return {
      latitude,
      longitude,
      locationName
    };
  } catch (error) {
    console.error("위치 정보 가져오기 실패:", error);
    throw error;
  }
};

// 현재 위치 좌표만 가져오기 (위치 권한 포함)
export const getCurrentCoordinates = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("위치 정보 접근이 거부되었습니다."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("위치 정보를 사용할 수 없습니다."));
              break;
            case error.TIMEOUT:
              reject(new Error("위치 정보 요청 시간이 초과되었습니다."));
              break;
            default:
              reject(new Error("위치 정보를 가져올 수 없습니다."));
          }
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });

    const { latitude, longitude } = position.coords;
    
    return {
      latitude,
      longitude,
      lat: latitude,
      lng: longitude
    };
  } catch (error) {
    console.error("위치 정보 가져오기 실패:", error);
    throw error;
  }
};
