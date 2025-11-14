import { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { API_ENDPOINTS } from '../config/api'

ChartJS.register(ArcElement, Tooltip, Legend)

const Alerts = () => {
  const [filter, setFilter] = useState('all') // 'all', 'bed', 'medicine'
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filteredAlerts, setFilteredAlerts] = useState([])

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filter !== 'all') {
          params.append('type', filter)
        }
        
        const response = await fetch(`${API_ENDPOINTS.ALERTS}?${params.toString()}`)
        const result = await response.json()
        
        if (result.success) {
          setAlerts(result.data)
          setFilteredAlerts(result.data)
        } else {
          console.error('Error fetching alerts:', result.error)
        }
      } catch (err) {
        console.error('Error fetching alerts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    
    // Refresh alerts every 15 seconds
    const interval = setInterval(fetchAlerts, 15000)
    return () => clearInterval(interval)
  }, [filter])

  // Mock alert data (fallback)
  const mockAlerts = [
    {
      id: 1,
      type: 'bed',
      district: 'Mumbai',
      hospital: 'City General Hospital',
      severity: 'critical',
      message: 'ICU beds at critical shortage - only 1 bed available',
      timestamp: '2024-01-15T10:30:00',
    },
    {
      id: 2,
      type: 'medicine',
      district: 'Delhi',
      hospital: 'Regional Medical Center',
      severity: 'critical',
      message: 'Insulin Glargine shortage - urgent restocking needed',
      timestamp: '2024-01-15T09:15:00',
    },
    {
      id: 3,
      type: 'bed',
      district: 'Chennai',
      hospital: 'Central Hospital',
      severity: 'critical',
      message: 'Only 2 ICU beds remaining',
      timestamp: '2024-01-15T08:45:00',
    },
    {
      id: 4,
      type: 'medicine',
      district: 'Bangalore',
      hospital: 'Metro Hospital',
      severity: 'moderate',
      message: 'Paracetamol stock running low',
      timestamp: '2024-01-15T07:20:00',
    },
    {
      id: 5,
      type: 'bed',
      district: 'Hyderabad',
      hospital: 'Sunshine Medical',
      severity: 'moderate',
      message: 'General ward beds at 20% capacity',
      timestamp: '2024-01-15T06:10:00',
    },
    {
      id: 6,
      type: 'medicine',
      district: 'Mumbai',
      hospital: 'City General Hospital',
      severity: 'critical',
      message: 'Atorvastatin recall - check batch numbers immediately',
      timestamp: '2024-01-14T22:00:00',
    },
    {
      id: 7,
      type: 'bed',
      district: 'Pune',
      hospital: 'Pune Medical Center',
      severity: 'critical',
      message: 'Emergency department at full capacity',
      timestamp: '2024-01-14T21:30:00',
    },
    {
      id: 8,
      type: 'medicine',
      district: 'Kolkata',
      hospital: 'Eastern Medical',
      severity: 'moderate',
      message: 'Metformin supply chain disruption expected',
      timestamp: '2024-01-14T20:15:00',
    },
  ]


  const criticalAlerts = filteredAlerts.filter(a => a.severity === 'critical').length
  const nonCriticalAlerts = filteredAlerts.filter(a => a.severity !== 'critical').length

  const pieData = {
    labels: ['Critical Alerts', 'Non-Critical Alerts'],
    datasets: [
      {
        data: [criticalAlerts, nonCriticalAlerts],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(100, 255, 218, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(100, 255, 218, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: 'Alert Distribution',
        color: '#fff',
      },
    },
  }

  const recentAlerts = alerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-blue mb-4"></div>
          <div className="text-white text-xl animate-pulse">Loading alerts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h2 className="text-4xl font-bold text-white mb-2 animate-fade-in">Critical Alerts & Shortages</h2>
          <p className="text-light-sky animate-slide-up" style={{ animationDelay: '0.2s' }}>Monitor critical shortages and alerts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Alerts Section */}
          <div className="lg:col-span-2">
            {/* Filter Toggle */}
            <div className="mb-6 flex gap-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border-2 border-sky-blue/30 shadow-xl animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  filter === 'all'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Show All
              </button>
              <button
                onClick={() => setFilter('bed')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  filter === 'bed'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Bed Alerts
              </button>
              <button
                onClick={() => setFilter('medicine')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  filter === 'medicine'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Medicine Alerts
              </button>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center text-white py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 animate-fade-in">
                  <div className="text-6xl mb-4 animate-bounce-slow">🔔</div>
                  <p>No alerts found for the selected filter.</p>
                </div>
              ) : (
                filteredAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl glow-effect-hover animate-scale-in group ${
                      alert.severity === 'critical'
                        ? 'border-red-500'
                        : 'border-yellow-500'
                    }`}
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                  >
                    <div className="flex items-start">
                      <div className={`text-3xl mr-4 ${alert.severity === 'critical' ? 'animate-bounce-slow' : 'animate-pulse-slow'}`}>
                        {alert.severity === 'critical' ? '🚨' : '⚠️'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-royal-blue group-hover:text-sky-blue transition-colors duration-300">{alert.hospital}</h3>
                            <p className="text-sm text-sky-blue">{alert.district}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white animate-pulse-slow ${
                              alert.severity === 'critical'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2 group-hover:translate-x-1 transition-transform duration-300">{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(alert.timestamp)}
                          </span>
                          <span className="text-xs px-2 py-1 bg-sky-blue/20 text-sky-blue rounded group-hover:bg-sky-blue/30 transition-colors duration-300">
                            {alert.type === 'bed' ? '🏥 Bed Alert' : '💊 Medicine Alert'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border-2 border-sky-blue/30 shadow-xl animate-scale-in glow-effect-hover" style={{ animationDelay: '0.5s' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>

            {/* Recent Alerts Panel */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-white/30 animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-xl font-bold text-royal-blue mb-4 animate-fade-in">Recent Alerts</h3>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-light-sky/50 rounded-lg border-l-2 border-sky-blue hover:border-sky-blue hover:bg-light-sky/70 transition-all duration-300 transform hover:translate-x-1 animate-scale-in group"
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-royal-blue group-hover:text-sky-blue transition-colors duration-300">
                        {alert.hospital}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{alert.message}</p>
                    <span className="text-xs text-sky-blue mt-1 block">
                      {alert.district} • {alert.type === 'bed' ? 'Bed' : 'Medicine'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts

