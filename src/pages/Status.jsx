import React, { useEffect, useState } from 'react'
import { getMyLastHealthData } from '../api/healthApi'

const Status = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval
    const fetchData = async () => {
      try {
        const res = await getMyLastHealthData()
        setData(res)
        setError(null)
      } catch (e) {
        setError(e?.response?.data?.message || e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>불러오는 중...</div>
  if (error) return <div>오류: {error}</div>
  if (!data) return <div>데이터 없음</div>

  const bpm = data.heartRate ?? '-'
  const temp = data.bodyTemperature ?? '-'
  const time = data.measurementTime ? new Date(data.measurementTime).toLocaleTimeString() : '-'

  return (
    <div className="p-4">
      <p className="font-bold text-xl mb-2">건강 상태</p>
      <div className="grid gap-3">
        <div>
          <p className="text-gray-500 text-xs">심박수 (BPM)</p>
          <p className="text-3xl font-bold">{bpm}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">체온 (°C)</p>
          <p className="text-3xl font-bold">{temp}</p>
        </div>
        <p className="text-gray-500 text-xs">측정 시각: {time}</p>
      </div>
    </div>
  )
}

export default Status