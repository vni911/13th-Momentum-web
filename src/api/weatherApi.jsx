// 날씨 상태 한글 변환 함수
export const getWeatherDescription = (description) => {
  const descriptions = {
    "clear sky": "맑음",
    "few clouds": "구름 조금",
    "scattered clouds": "구름 많음",
    "broken clouds": "흐림",
    "overcast clouds": "흐림",
    "shower rain": "소나기",
    rain: "비",
    "light rain": "가벼운 비",
    "moderate rain": "비",
    "heavy rain": "폭우",
    thunderstorm: "천둥번개",
    snow: "눈",
    mist: "안개",
    fog: "안개",
    haze: "연무",
    smoke: "연기",
    dust: "먼지",
    sand: "모래",
    ash: "재",
    squall: "돌풍",
    tornado: "토네이도",
  };
  return descriptions[description] || "맑음";
};

// 날씨 그룹 분류 함수 (아이콘 및 배경 색상용)
export const weatherGroups = {
  sunny: ["맑음"],
  cloudy: ["구름 조금", "구름 많음", "흐림"],
  rain: ["소나기", "비", "가벼운 비", "폭우"],
  snow: ["눈"],
  storm: ["천둥번개", "돌풍", "토네이도"],
  mist: ["안개", "연무", "연기", "먼지", "모래", "재"],
};

export const getWeatherGroup = (desc) => {
  for (const [group, items] of Object.entries(weatherGroups)) {
    if (items.includes(desc)) {
      return group;
    }
  }
  return "sunny";
};

// 날씨 그룹에 따른 그라데이션 클래스 매핑
export const getWeatherGradientClass = (weatherGroup) => {
  switch (weatherGroup) {
    case "sunny":
      return "bg-gradient-to-tr from-white via-[#FFDDBF]/50 to-[#FADCC2]/80";
    case "cloudy":
      return "bg-gradient-to-t from-stone-50 via-stone-100 to-stone-400/80";
    case "rain":
      return "bg-gradient-to-t from-white via-[#BFD4FF]/30 to-[#BFD4FF]/60";
    default:
      return "bg-white";
  }
};

// 현재 날씨 정보 가져오기
export const getCurrentWeather = async (latitude, longitude) => {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OpenWeather API 키가 설정되지 않았습니다.");
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (parseError) {
      console.error("에러 응답 파싱 실패:", parseError);
    }
    throw new Error(`현재 날씨 정보를 가져오는데 실패했습니다. (${errorMessage})`);
  }

  return await response.json();
};
