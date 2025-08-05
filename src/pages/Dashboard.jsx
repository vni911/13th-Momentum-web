import React from 'react'
import WeatherWidget from '../components/WeatherWidget'

const Dashboard = () => {

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <WeatherWidget />
        </div>
      </div>
    </div>
  )
}

export default Dashboard