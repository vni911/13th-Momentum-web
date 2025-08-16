import React, { useState, useEffect } from 'react'

const WeatherLLM = ({ weatherData }) => {
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateSituationText = async (weather) => {
    console.log('generateSituationText - weather 데이터:', weather);
    
    if (!weather || typeof weather.temp === 'undefined') {
      return '날씨 정보를 불러오는 중입니다. 잠시만 기다려주세요.'
    }

    const temp = weather.temp
    const humidity = weather.humidity
    const description = weather.description

    // 한국어 프롬프트
    const prompt = `날씨: ${temp}°C, 습도 ${humidity}%, ${description}. 이 날씨에 대한 친근한 조언을 해주세요. 참고로 이 서비스는 열사병 방지를 위한 서비스임을 명시하고 300자 내 한글로 적어주세요.`

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            model: "meta-llama/Llama-3.1-8B-Instruct:fireworks-ai",
            max_tokens: 500,
            temperature: 0.8
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          const generatedText = data.choices[0].message.content
          
          if (generatedText && generatedText.length > 10) {
            // md형식 제거
            let cleanText = generatedText
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
              .replace(/`(.*?)`/g, '$1')
              .replace(/#{1,6}\s/g, '')
              .replace(/([.!?])\s+/g, '$1\n')
              .replace(/(\d+\.\s)/g, '\n$1')
              .replace(/\n{3,}/g, '\n\n')
              .trim()
            
            return `🤖 ${cleanText}`
          }
        }
      }

      //실패 시 기본 분석으로 대체
      console.log('Llama 모델 API 응답이 올바르지 않아 기본 분석을 사용합니다.')
      return generateBasicAnalysis(weather)
      
    } catch (err) {
      console.error('Llama 모델 API 호출 실패:', err)
      return generateBasicAnalysis(weather)
    }
  }

  // 기본 분석
  const generateBasicAnalysis = (weather) => {
    console.log('generateBasicAnalysis - weather 데이터:', weather);
    
    if (!weather || typeof weather.temp === 'undefined') {
      return '날씨 정보를 불러오는 중입니다. 잠시만 기다려주세요.'
    }
    
    const temp = weather.temp
    const humidity = weather.humidity
    const description = weather.description

    let analysis = ''

    if (temp >= 30) {
      analysis += '🔥 매우 더운 날씨입니다! '
      if (humidity > 70) {
        analysis += '습도도 높아서 체감 온도가 더욱 높게 느껴질 수 있어요. '
      }
      analysis += '외출 시에는 충분한 수분 섭취와 그늘막 쉼터를 이용하시는 것을 추천드려요. '
    } else if (temp >= 25) {
      analysis += '☀️ 따뜻한 날씨입니다! '
      if (humidity > 60) {
        analysis += '습도가 다소 높아서 약간 답답할 수 있어요. '
      }
      analysis += '야외 활동하기 좋은 날씨지만, 자외선 차단제 사용을 잊지 마세요. '
    } else if (temp >= 20) {
      analysis += '🌤️ 쾌적한 날씨입니다! '
      analysis += '야외 활동하기 가장 좋은 온도예요. '
      if (humidity < 40) {
        analysis += '습도가 낮아서 피부가 건조할 수 있으니 보습에 신경 쓰세요. '
      }
    } else if (temp >= 15) {
      analysis += '🍂 선선한 날씨입니다! '
      analysis += '가벼운 겉옷을 챙기시면 좋을 것 같아요. '
    } else if (temp >= 10) {
      analysis += '🧥 쌀쌀한 날씨입니다! '
      analysis += '따뜻한 옷을 입고 외출하세요. '
    } else if (temp >= 0) {
      analysis += '❄️ 추운 날씨입니다! '
      analysis += '두꺼운 겉옷과 목도리, 장갑을 착용하세요. '
    } else {
      analysis += '🥶 매우 추운 날씨입니다! '
      analysis += '가능하면 실외 활동을 줄이고 실내에서 지내시는 것을 추천드려요. '
    }

    if (description.includes('rain') || description.includes('shower')) {
      analysis += '☔ 비가 오고 있어요. 우산이나 우비를 챙기시고, 미끄러운 길을 조심하세요. '
    } else if (description.includes('snow')) {
      analysis += '❄️ 눈이 내리고 있어요. 미끄러운 길을 조심하고, 따뜻한 옷을 입으세요. '
    } else if (description.includes('thunderstorm')) {
      analysis += '⚡ 천둥번개가 치고 있어요. 실외 활동을 피하고 안전한 실내에서 지내세요. '
    } else if (description.includes('cloud') || description.includes('overcast')) {
      analysis += '☁️ 흐린 날씨예요. 자외선은 적지만, 기분이 우울할 수 있어요. '
    } else if (description.includes('clear')) {
      analysis += '☀️ 맑은 날씨예요. 자외선이 강할 수 있으니 자외선 차단제를 꼭 바르세요. '
    }

    const hour = new Date().getHours()
    if (hour >= 6 && hour <= 10) {
      analysis += '🌅 아침 시간이에요. 상쾌한 공기를 마시며 하루를 시작해보세요! '
    } else if (hour >= 11 && hour <= 14) {
      analysis += '🌞 점심 시간이에요. 자외선이 가장 강한 시간대이니 그늘을 찾아 이동하세요. '
    } else if (hour >= 15 && hour <= 18) {
      analysis += '🌆 오후 시간이에요. 산책하기 좋은 시간대예요. '
    } else if (hour >= 19 && hour <= 22) {
      analysis += '🌙 저녁 시간이에요. 기온이 떨어질 수 있으니 겉옷을 챙기세요. '
    } else {
      analysis += '🌃 밤 시간이에요. 기온이 낮아질 수 있으니 따뜻하게 입으세요. '
    }

    return analysis
  }

  useEffect(() => {
    console.log('WeatherMessageWidget - weatherData 받음:', weatherData)
    
    if (weatherData && typeof weatherData.temp !== 'undefined') {
      console.log('WeatherMessageWidget - 유효한 weatherData 확인됨')
      setLoading(true)
      setError(null)
      
      const basicAnalysis = generateBasicAnalysis(weatherData)
      console.log('기본 분석 생성:', basicAnalysis)
      setSituation(basicAnalysis)
      
      generateSituationText(weatherData)
        .then((text) => {
          console.log('AI 생성된 텍스트:', text)
          if (text && text.length > 10) {
            setSituation(text)
          }
        })
        .catch((err) => {
          console.error('AI 분석 실패:', err)
          setError(err.message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [weatherData])

  if (!weatherData) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">💬</span>
          <h3 className="text-lg font-semibold text-white">AI 분석</h3>
        </div>
        <div className="text-white leading-relaxed">
          날씨 정보를 불러오는 중입니다. 잠시만 기다려주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">💬</span>
        <h3 className="text-lg font-semibold text-white">AI 분석</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-white">AI가 상황을 분석하고 있어요...</span>
        </div>
      ) : error ? (
        <div className="text-sm text-yellow-200 mb-2">
          AI 분석 중 오류가 발생했습니다. 기본 분석을 제공합니다.
        </div>
      ) : null}
      
      <div className="text-white leading-relaxed">
        {situation ? situation : '날씨 정보를 불러오는 중...'}
      </div>
    </div>
  )
}

export default WeatherLLM
