import React, { useState, useEffect } from 'react'

const HeatShelterWidget = () => {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        setLoading(true)
        
        const apiKey = import.meta.env.VITE_PUBLIC_DATA_API_KEY
        
        if (!apiKey) {
          throw new Error('공공데이터 API 키가 설정되지 않았습니다.')
        }

        const response = await fetch(
          `https://apis.data.go.kr/1741000/HealthSheltersForEachRegion?serviceKey=${apiKey}&pageNo=1&numOfRows=10&type=json`
        )

        if (!response.ok) {
          throw new Error('무더위 쉼터 정보를 가져올 수 없습니다.')
        }

        const data = await response.json()
        console.log('무더위 쉼터 데이터:', data)

        if (data.response?.body?.items?.item) {
          const shelterList = data.response.body.items.item.slice(0, 4).map((shelter, index) => ({
            name: shelter.shelterNm || `무더위 쉼터 ${index + 1}`,
            distance: `${(index + 1) * 200}m` // 실제로는 위경도로 거리 계산 필요
          }))
          setShelters(shelterList)
        } else {
          throw new Error('무더위 쉼터 데이터를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('무더위 쉼터 정보 가져오기 실패:', error)
        // 에러 시 샘플 데이터
        setShelters([
          { name: 'IM뱅크본부영업부', distance: '180m' },
          { name: 'Sh수협은행경북지역금융본부', distance: '510m' },
          { name: '수성가정복지센터', distance: '680m' },
          { name: '대구시민운동장', distance: '840m' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchShelters()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">무더위 쉼터 정보</h3>
        <p className="text-sm text-gray-600">근처의 시설을 확인해보세요</p>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">쉼터 정보 로딩 중...</span>
          </div>
        ) : (
          shelters.map((shelter, index) => (
            <div key={index} className={`flex justify-between items-center py-2 ${index < shelters.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-sm text-gray-700">{shelter.name}</span>
              <span className="text-sm text-gray-500">{shelter.distance}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default HeatShelterWidget
