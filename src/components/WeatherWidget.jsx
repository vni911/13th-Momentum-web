import React, { useState, useEffect } from 'react'

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY
        console.log('API 키 확인:', apiKey ? '설정됨' : '설정되지 않음')
        
        if (!apiKey) {
          throw new Error('OpenWeather API 키가 설정되지 않았습니다.')
        }

        // 사용자의 위치를 가져오기 (Geolocation API 사용)
        console.log('위치 정보 요청 중...')
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          })
        })

        const { latitude, longitude } = position.coords
        console.log('위치 정보:', { latitude, longitude })
        
       // 현재 날씨
         const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=en`)

         if (!currentResponse.ok) {
           const errorData = await currentResponse.json()
           console.error('현재 날씨 API 응답 오류:', errorData)
           throw new Error(`현재 날씨 정보를 가져오는데 실패했습니다. (${currentResponse.status}: ${errorData.message || '알 수 없는 오류'})`)
         }

         const currentData = await currentResponse.json()
         console.log('현재 날씨 데이터:', currentData)
         
         setWeather(currentData)
      } catch (err) {
        console.error('날씨 정보 가져오기 실패:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [])



  const getWeatherDescription = (description) => {
    const descriptions = {
      'clear sky': '맑음',
      'few clouds': '구름 조금',
      'scattered clouds': '구름 많음',
      'broken clouds': '흐림',
      'overcast clouds': '흐림',
      'shower rain': '소나기',
      'rain': '비',
      'light rain': '가벼운 비',
      'moderate rain': '비',
      'heavy rain': '폭우',
      'thunderstorm': '천둥번개',
      'snow': '눈',
      'mist': '안개',
      'fog': '안개',
      'haze': '연무',
      'smoke': '연기',
      'dust': '먼지',
      'sand': '모래',
      'ash': '재',
      'squall': '돌풍',
      'tornado': '토네이도'
    }
    return descriptions[description] || '맑음'
  }



  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">날씨 정보 로딩 중...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">날씨 정보</h3>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>날씨 정보를 불러올 수 없습니다</p>
          <p className="text-sm mt-1">{error}</p>
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-left">
            <p><strong>문제 해결 방법:</strong></p>
            <p>브라우저에서 위치 권한을 허용했는지 확인하세요</p>
          </div>
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm relative overflow-hidden">
      {/* 날씨 아이콘 및 상태 */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-gray-600 text-sm">{getWeatherDescription(weather.weather[0].description)}</span>
      </div>
      
      {/* 온도 */}
      <div className="text-5xl font-bold text-gray-800 mb-4">
        {Math.round(weather.main.temp)}°
      </div>
      
      {/* 추가 정보 */}
      <div className="space-y-1 text-sm text-gray-600">
        <div>습도: {Math.round(weather.main.humidity)}%</div>
      </div>
    </div>
  )
}

export default WeatherWidget 