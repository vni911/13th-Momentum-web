import React, { useState, useEffect } from 'react'

const MapWidget = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true)
        
        const apiKey = import.meta.env.VITE_MAP_API_KEY
        if (!apiKey) {
          throw new Error('지도 API 키가 설정되지 않았습니다.')
        }

        // 임시로 로딩 완료 
        setTimeout(() => {
          setLoading(false)
        }, 1500)
        
      } catch (error) {
        console.error('지도 초기화 실패:', error)
        setError(error.message)
        setLoading(false)
      }
    }

    initializeMap()
  }, [])

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">지도</h3>
        <p className="text-sm text-gray-600">근처 시설을 지도에서 확인해보세요</p>
      </div>
      
      <div className="relative">
        {loading ? (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">지도 로딩 중...</span>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-red-500">오류: {error}</span>
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                다시 시도
              </button>
            </div>
          </div>
                 ) : (
           <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
             <div className="flex flex-col items-center space-y-2">
               <div className="text-4xl text-gray-400">🗺️</div>
               <span className="text-sm text-gray-500">지도가 여기에 표시됩니다</span>
               <p className="text-xs text-gray-400 text-center">
                 API 키: {import.meta.env.VITE_MAP_API_KEY ? '설정됨' : '설정되지 않음'}
               </p>
             </div>
           </div>
         )}
      </div>
    </div>
  )
}

export default MapWidget
