import React, { useEffect, useState } from 'react'

const DEFAULT_CENTER = { lat: 35.8299, lng: 128.7614 }

const loadKakaoMapScript = (appKey) => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(resolve)
      return
    }

    const existing = document.getElementById('kakao-map-sdk')
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(resolve)
        } else {
          reject(new Error('카카오맵 SDK 로딩에 실패했습니다.'))
        }
      })
      existing.addEventListener('error', () => reject(new Error('카카오맵 스크립트를 불러오지 못했습니다.')))
      return
    }

    const script = document.createElement('script')
    script.id = 'kakao-map-sdk'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`
    script.async = true
    console.log('Kakao SDK 로딩 다시시시도', script.src)
    const timeoutId = setTimeout(() => {
      console.warn('Kakao SDK 로드 타임아웃')
      reject(new Error('카카오맵 스크립트 로드가 시간 초과되었습니다. 네트워크/도메인/키 설정을 확인해주세요.'))
    }, 5000)
    script.onload = () => {
      clearTimeout(timeoutId)
      if (window.kakao && window.kakao.maps) {
        const mapsLoadTimeout = setTimeout(() => {
          console.warn('타임아웃')
          // 폴백: autoload=true로 재시도
          const fallbackId = 'kakao-map-sdk-autoload'
          if (!document.getElementById(fallbackId)) {
            const fb = document.createElement('script')
            fb.id = fallbackId
            fb.async = true
            fb.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=true&libraries=services,clusterer`
            fb.onload = () => {
              if (window.kakao && window.kakao.maps) {
                console.log('로드 성공')
                resolve()
              } else {
                reject(new Error('카카오맵 로드에 실패했습니다.'))
              }
            }
            fb.onerror = () => reject(new Error('카카오맵 스크립트를 불러오지 못했습니다.'))
            document.head.appendChild(fb)
          } else {
            resolve()
          }
        }, 5000)
        try {
          window.kakao.maps.load(() => {
            clearTimeout(mapsLoadTimeout)
            resolve()
          })
        } catch {
          clearTimeout(mapsLoadTimeout)
          reject(new Error('카카오맵 라이브러리 초기화 중 오류가 발생했습니다.'))
        }
      } else {
        reject(new Error('카카오맵 SDK 로딩에 실패했습니다.'))
      }
    }
    script.onerror = () => {
      clearTimeout(timeoutId)
      reject(new Error('카카오맵 스크립트를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })
}

const MapWidget = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [initialCenter, setInitialCenter] = useState(null)
  const [containerEl, setContainerEl] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [marker, setMarker] = useState(null)
  const [isLocating, setIsLocating] = useState(false)

  const waitForContainerReady = (container) => {
    return new Promise((resolve, reject) => {
      if (!container) return reject(new Error('지도 컨테이너가 존재하지 않습니다.'))

      const inDom = () => container && document.body.contains(container)
      const hasSize = () => inDom() && container.offsetWidth > 0 && container.offsetHeight > 0

      if (hasSize()) return resolve()

      const observer = new ResizeObserver(() => {
        if (hasSize()) {
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(container)

      // 타임아웃
      const timeoutId = setTimeout(() => {
        observer.disconnect()
        reject(new Error('지도 컨테이너가 준비되지 않았습니다. (timeout)'))
      }, 5000)

      // DOM 연결 체크
      const intervalId = setInterval(() => {
        if (!inDom()) return
        if (hasSize()) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          observer.disconnect()
          resolve()
        }
      }, 100)
    })
  }

  // Kakao SDK 로드
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    const loadSdk = async () => {
      try {
        console.log('SDK 로드 시작')
        const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY || import.meta.env.VITE_MAP_API_KEY
        if (!appKey) {
          throw new Error('API 키가 설정되지 않았습니다.')
        }
        await loadKakaoMapScript(appKey)
        console.log('SDK 로드 완료')
        setSdkReady(true)
      } catch (err) {
        console.error('지도 SDK 로드 실패:', err)
        const hint = err.message.includes('스크립트를 불러오지 못했습니다')
          ? `API 키가 설정되지 않았습니다.`
          : ''
        setError(`${err.message}${hint ? `\n${hint}` : ''}`)
        setLoading(false)
      }
    }
    loadSdk()
  }, [reloadNonce])

  // 초기위치치
  useEffect(() => {
    let done = false
    if (!('geolocation' in navigator)) {
      setInitialCenter(DEFAULT_CENTER)
      return
    }
    const fallbackTimer = setTimeout(() => {
      if (!done) {
        done = true
        setInitialCenter(DEFAULT_CENTER)
      }
    }, 1200)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (done) return
        done = true
        clearTimeout(fallbackTimer)
        const { latitude, longitude } = pos.coords
        setInitialCenter({ lat: latitude, lng: longitude })
      },
      () => {
        if (done) return
        done = true
        clearTimeout(fallbackTimer)
        setInitialCenter(DEFAULT_CENTER)
      },
      { enableHighAccuracy: true, timeout: 3000 }
    )
    return () => clearTimeout(fallbackTimer)
  }, [])

  // 지도 인스턴스 생성
  useEffect(() => {
    if (!sdkReady) return
    if (!initialCenter) return
    if (mapInstance) return

    let cancelled = false
    const run = async () => {
      const container = containerEl
      if (!container) return
      try {
        console.log('컨테이너 준비 대기 시작')
        await waitForContainerReady(container)
        console.log('컨테이너 준비 완료', { w: container.offsetWidth, h: container.offsetHeight })
        if (cancelled) return

        const map = new window.kakao.maps.Map(
          container,
          {
            center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
            level: 3,
          }
        )
        setMapInstance(map)

        const mk = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
        })
        mk.setMap(map)
        setMarker(mk)

        const zoomControl = new window.kakao.maps.ZoomControl()
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

        setLoading(false)
        console.log('지도 생성 완료')
      } catch (err) {
        console.error('지도 생성 실패:', err)
        setError('지도를 초기화하는 중 문제가 발생했습니다. (컨테이너 준비 실패)')
        setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [sdkReady, reloadNonce, initialCenter, containerEl, mapInstance])


  // 내 위치
  const recenterToCurrentLocation = () => {
    if (!mapInstance) return
    if (!('geolocation' in navigator)) {
      setError('이 브라우저에서는 위치 정보를 사용할 수 없습니다.')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const latLng = new window.kakao.maps.LatLng(latitude, longitude)
        mapInstance.panTo(latLng)
        if (marker) {
          marker.setPosition(latLng)
        }
        setIsLocating(false)
      },
      (err) => {
        console.warn('위치 요청 실패', err)
        setIsLocating(false)
        setError('현재 위치를 가져오지 못했습니다.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">지도</h3>
        <p className="text-sm text-gray-600">근처 시설을 지도에서 확인해보세요</p>
      </div>

      <div className="relative">
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
          <div ref={setContainerEl} className="h-full w-full" />
        </div>

        <div className="absolute right-3 bottom-3 z-10">
          <button
            onClick={recenterToCurrentLocation}
            disabled={isLocating}
            className={`px-3 py-2 text-sm rounded-md border shadow bg-white hover:bg-gray-50 ${isLocating ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="내 위치"
          >
            {isLocating ? '위치 확인 중...' : '내 위치'}
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
                    console.log('수동 재시도')
                    setError(null)
                    setLoading(true)
                    setSdkReady(false)
                    // 강제로 다시 렌더링
                    setReloadNonce((n) => n + 1)
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
  )
}

export default MapWidget