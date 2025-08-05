import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-purple-200 to-blue-300">
      <div className="max-w-md w-full text-center">
        {/* 404 아이콘 */}
        <div className="mb-16 relative">
          <div className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
            404
          </div>
          <div className="absolute inset-0 text-9xl font-bold text-gray-300/20 -z-10 animate-pulse">
            404
          </div>
        </div>
        
        {/* 메인 메시지 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          페이지를 찾을 수 없습니다
        </h1>
        
        {/* 설명 */}
        <p className="text-gray-600 mb-12">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link 
            to="/" 
            className="relative px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 font-semibold border border-gray-200 rounded-lg transition-all duration-300 group hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent hover:shadow-lg"
          >
            홈으로 돌아가기
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="relative px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 font-semibold border border-gray-200 rounded-lg transition-all duration-300 group hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white hover:border-transparent hover:shadow-lg"
          >
            이전 페이지로 돌아가기
          </button>
        </div>
        
        {/* 추가 정보 */}
        <div className="text-sm text-gray-500">
          <p>문제가 지속되면 관리자에게 문의해주세요.</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound 