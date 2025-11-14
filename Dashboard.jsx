import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { API_ENDPOINTS } from '../config/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredHospitals, setFilteredHospitals] = useState([])

  useEffect(() => {
    // Fetch hospitals from API
    const fetchHospitals = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(API_ENDPOINTS.HOSPITALS)
        const result = await response.json()
        
        if (result.success) {
          setHospitals(result.data)
          setFilteredHospitals(result.data)
        } else {
          setError(result.error || 'Failed to fetch hospital data')
        }
      } catch (err) {
        setError('Failed to connect to server. Please ensure the backend is running.')
        console.error('Error fetching hospitals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchHospitals, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredHospitals(hospitals)
    } else {
      const filtered = hospitals.filter(
        hospital =>
          hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.district.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredHospitals(filtered)
    }
  }, [searchTerm, hospitals])

  const getAvailabilityStatus = (available, total) => {
    const percentage = (available / total) * 100
    if (percentage >= 30) return { status: 'good', color: 'bg-green-500', text: 'Good Availability' }
    if (percentage >= 15) return { status: 'moderate', color: 'bg-yellow-500', text: 'Moderate Availability' }
    return { status: 'critical', color: 'bg-red-500', text: 'Critical Shortage' }
  }

  const chartData = {
    labels: filteredHospitals.map(h => h.name),
    datasets: [
      {
        label: 'Total Beds',
        data: filteredHospitals.map(h => h.totalBeds),
        backgroundColor: 'rgba(10, 25, 47, 0.8)',
        borderColor: 'rgba(100, 255, 218, 1)',
        borderWidth: 2,
      },
      {
        label: 'Available Beds',
        data: filteredHospitals.map(h => h.availableBeds),
        backgroundColor: 'rgba(100, 255, 218, 0.6)',
        borderColor: 'rgba(100, 255, 218, 1)',
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Hospital Bed Availability Overview',
        color: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-blue mb-4"></div>
          <div className="text-white text-xl animate-pulse">Loading hospital data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400 text-xl animate-wiggle">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h2 className="text-4xl font-bold text-white mb-2 animate-fade-in">Real-Time Hospital Bed Overview</h2>
          <p className="text-light-sky animate-slide-up" style={{ animationDelay: '0.2s' }}>Monitor bed availability across hospitals</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by district or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border-2 border-sky-blue/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:border-sky-blue transition-all duration-300 hover:border-sky-blue/50"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-blue animate-pulse">🔍</span>
          </div>
        </div>

        {/* Chart */}
        {filteredHospitals.length > 0 && (
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-sky-blue/30 shadow-xl animate-scale-in glow-effect-hover" style={{ animationDelay: '0.4s' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Hospital Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.length === 0 ? (
            <div className="col-span-full text-center text-white py-12 animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce-slow">🔍</div>
              <p>No hospitals found matching your search.</p>
            </div>
          ) : (
            filteredHospitals.map((hospital, index) => {
              const bedStatus = getAvailabilityStatus(hospital.availableBeds, hospital.totalBeds)
              const icuStatus = getAvailabilityStatus(hospital.availableIcu, hospital.icuBeds)

              return (
                <div
                  key={hospital.id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-white/30 hover:border-sky-blue/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl glow-effect-hover animate-scale-in group"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/0 to-sky-blue/0 group-hover:from-sky-blue/5 group-hover:to-transparent rounded-xl transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-royal-blue group-hover:text-sky-blue transition-colors duration-300">{hospital.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${bedStatus.color} animate-pulse-slow`}>
                        {bedStatus.text}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-gray-600">Total Beds:</span>
                        <span className="font-semibold text-royal-blue">{hospital.totalBeds}</span>
                      </div>
                      <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                        <span className="text-gray-600">Available Beds:</span>
                        <span className="font-semibold text-sky-blue animate-pulse">{hospital.availableBeds}</span>
                      </div>
                      <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                        <span className="text-gray-600">ICU Beds:</span>
                        <span className="font-semibold text-royal-blue">{hospital.icuBeds}</span>
                      </div>
                      <div className="flex justify-between group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.15s' }}>
                        <span className="text-gray-600">Available ICU:</span>
                        <span className={`font-semibold ${icuStatus.status === 'critical' ? 'text-red-500 animate-pulse' : icuStatus.status === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
                          {hospital.availableIcu}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      <div className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-gray-600">Contact: </span>
                        <span className="text-royal-blue font-medium">{hospital.contact}</span>
                      </div>
                      <div className="text-sm group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                        <span className="text-gray-600">Address: </span>
                        <span className="text-gray-700">{hospital.address}</span>
                      </div>
                      <div className="text-sm group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.1s' }}>
                        <span className="text-gray-600">District: </span>
                        <span className="text-sky-blue font-medium">{hospital.district}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

