import React, { useState, useEffect } from 'react'

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // API 키 확인
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
        console.log('API 키 확인:', apiKey ? '설정됨' : '설정되지 않음')
        
        if (!apiKey) {
          throw new Error('OpenWeather API 키가 설정되지 않았습니다.')
        }

        // 사용자의 위치를 가져오기 (브라우저의 Geolocation API 사용)
        console.log('위치 정보 요청 중...')
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          })
        })

        const { latitude, longitude } = position.coords
        console.log('위치 정보:', { latitude, longitude })
        
        // 현재 날씨와 예보를 동시에 가져오기
        const [currentResponse, forecastResponse] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`)
        ])

        if (!currentResponse.ok) {
          const errorData = await currentResponse.json()
          console.error('현재 날씨 API 응답 오류:', errorData)
          throw new Error(`현재 날씨 정보를 가져오는데 실패했습니다. (${currentResponse.status}: ${errorData.message || '알 수 없는 오류'})`)
        }

        if (!forecastResponse.ok) {
          const errorData = await forecastResponse.json()
          console.error('예보 API 응답 오류:', errorData)
          throw new Error(`예보 정보를 가져오는데 실패했습니다. (${forecastResponse.status}: ${errorData.message || '알 수 없는 오류'})`)
        }

        const [currentData, forecastData] = await Promise.all([
          currentResponse.json(),
          forecastResponse.json()
        ])

        console.log('현재 날씨 데이터:', currentData)
        console.log('예보 데이터:', forecastData)
        
        setWeather(currentData)
        setForecast(forecastData)
      } catch (err) {
        console.error('날씨 정보 가져오기 실패:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [])

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const getWeatherDescription = (description) => {
    const descriptions = {
      'clear sky': '맑음',
      'few clouds': '구름 조금',
      'scattered clouds': '구름 많음',
      'broken clouds': '흐림',
      'shower rain': '소나기',
      'rain': '비',
      'thunderstorm': '천둥번개',
      'snow': '눈',
      'mist': '안개'
    }
    return descriptions[description] || description
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const get24HourForecast = () => {
    if (!forecast) return []
    
    const now = new Date()
    const next24Hours = []
    
    forecast.list.forEach(item => {
      const itemTime = new Date(item.dt * 1000)
      const timeDiff = itemTime - now
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      if (hoursDiff >= 0 && hoursDiff <= 24) {
        next24Hours.push(item)
      }
    })
    
    // 3시간 간격으로 필터링
    return next24Hours.filter((item, index) => index % 2 === 0).slice(0, 8)
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

  const hourlyForecast = get24HourForecast()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">현재 날씨</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <img 
            src={getWeatherIcon(weather.weather[0].icon)} 
            alt={weather.weather[0].description}
            className="w-16 h-16"
          />
          <div className="ml-4">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {getWeatherDescription(weather.weather[0].description)}
            </div>
          </div>
        </div>
        
        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
          <div>습도: {weather.main.humidity}%</div>
          <div>풍속: {weather.wind.speed}m/s</div>
          <div>체감온도: {Math.round(weather.main.feels_like)}°C</div>
        </div>
      </div>
      
      <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>최고: {Math.round(weather.main.temp_max)}°C</span>
          <span>최저: {Math.round(weather.main.temp_min)}°C</span>
        </div>
      </div>

      {/* 24시간 예보 */}
      {hourlyForecast.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">24시간 예보</h4>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {hourlyForecast.map((item, index) => (
              <div key={index} className="flex-shrink-0 text-center min-w-[60px]">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {formatTime(item.dt)}
                </div>
                <img 
                  src={getWeatherIcon(item.weather[0].icon)} 
                  alt={item.weather[0].description}
                  className="w-8 h-8 mx-auto mb-1"
                />
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {Math.round(item.main.temp)}°C
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(item.main.humidity)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherWidget 