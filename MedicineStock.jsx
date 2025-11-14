import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { API_ENDPOINTS } from '../config/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const MedicineStock = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Fetch medicines from API
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (searchTerm) {
          params.append('search', searchTerm)
        }
        params.append('limit', '50')
        
        const response = await fetch(`${API_ENDPOINTS.MEDICINES}?${params.toString()}`)
        const result = await response.json()
        
        if (result.success) {
          setMedicines(result.data)
          setFilteredMedicines(result.data)
        } else {
          setError(result.error || 'Failed to fetch medicine data')
        }
      } catch (err) {
        setError('Failed to connect to server. Please ensure the backend is running.')
        console.error('Error fetching medicines:', err)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchMedicines()
    }, searchTerm ? 500 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Mock medicine data (fallback)
  const mockMedicines = [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      manufacturer: 'ABC Pharmaceuticals',
      category: 'Analgesic',
      availability: 'high',
      warning: null,
      recall: false,
    },
    {
      id: 2,
      name: 'Insulin Glargine',
      manufacturer: 'XYZ Medical',
      category: 'Antidiabetic',
      availability: 'low',
      warning: 'Shortage expected in next 2 weeks',
      recall: false,
    },
    {
      id: 3,
      name: 'Amoxicillin 250mg',
      manufacturer: 'MedCorp Industries',
      category: 'Antibiotic',
      availability: 'moderate',
      warning: null,
      recall: false,
    },
    {
      id: 4,
      name: 'Aspirin 75mg',
      manufacturer: 'HealthFirst Pharma',
      category: 'Antiplatelet',
      availability: 'high',
      warning: null,
      recall: false,
    },
    {
      id: 5,
      name: 'Metformin 500mg',
      manufacturer: 'Generic Pharma',
      category: 'Antidiabetic',
      availability: 'moderate',
      warning: 'Limited stock available',
      recall: false,
    },
    {
      id: 6,
      name: 'Ibuprofen 400mg',
      manufacturer: 'Relief Pharmaceuticals',
      category: 'NSAID',
      availability: 'high',
      warning: null,
      recall: false,
    },
    {
      id: 7,
      name: 'Atorvastatin 20mg',
      manufacturer: 'CardioMed',
      category: 'Statin',
      availability: 'low',
      warning: 'Critical shortage',
      recall: false,
    },
    {
      id: 8,
      name: 'Omeprazole 20mg',
      manufacturer: 'Digestive Health',
      category: 'PPI',
      availability: 'moderate',
      warning: null,
      recall: false,
    },
    {
      id: 9,
      name: 'Levothyroxine 50mcg',
      manufacturer: 'Hormone Pharma',
      category: 'Hormone',
      availability: 'low',
      warning: 'Recall issued - check batch numbers',
      recall: true,
    },
    {
      id: 10,
      name: 'Amlodipine 5mg',
      manufacturer: 'BP Control Inc',
      category: 'Antihypertensive',
      availability: 'high',
      warning: null,
      recall: false,
    },
  ]


  const shortageTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Trending Medicine Shortages',
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

  // Fetch shortage trends
  const [shortageTrendData, setShortageTrendData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Shortage Reports',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgba(100, 255, 218, 1)',
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  })

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SHORTAGE_TRENDS)
        const result = await response.json()
        if (result.success && result.data) {
          setShortageTrendData({
            labels: result.data.labels,
            datasets: [{
              label: 'Shortage Reports',
              data: result.data.data,
              borderColor: 'rgba(100, 255, 218, 1)',
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              tension: 0.4,
              fill: true,
            }]
          })
        }
      } catch (err) {
        console.error('Error fetching trends:', err)
      }
    }
    fetchTrends()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredMedicines])

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'high':
        return 'bg-green-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAvailabilityText = (availability) => {
    switch (availability) {
      case 'high':
        return 'High Availability'
      case 'moderate':
        return 'Moderate Availability'
      case 'low':
        return 'Low Availability'
      default:
        return 'Unknown'
    }
  }

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h2 className="text-4xl font-bold text-white mb-2 animate-fade-in">Medicine Stock Availability</h2>
          <p className="text-light-sky animate-slide-up" style={{ animationDelay: '0.2s' }}>Search and monitor medicine availability</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search medicines by name, manufacturer, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border-2 border-sky-blue/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-blue focus:border-sky-blue transition-all duration-300 hover:border-sky-blue/50"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-blue animate-pulse">💊</span>
          </div>
        </div>

        {/* Trending Shortages Chart */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-sky-blue/30 shadow-xl animate-scale-in glow-effect-hover" style={{ animationDelay: '0.4s' }}>
          <Line data={shortageTrendData} options={shortageTrendOptions} />
        </div>

        {/* Medicine Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {currentMedicines.length === 0 ? (
            <div className="col-span-full text-center text-white py-12 animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce-slow">💊</div>
              <p>{loading ? 'Loading medicines...' : 'No medicines found matching your search.'}</p>
            </div>
          ) : (
            currentMedicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-white/30 hover:border-sky-blue/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl glow-effect-hover animate-scale-in group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-blue/0 to-sky-blue/0 group-hover:from-sky-blue/5 group-hover:to-transparent rounded-xl transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-royal-blue group-hover:text-sky-blue transition-colors duration-300">{medicine.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getAvailabilityColor(medicine.availability)} animate-pulse-slow`}>
                      {getAvailabilityText(medicine.availability)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-gray-600">Manufacturer: </span>
                      <span className="text-royal-blue font-medium">{medicine.manufacturer}</span>
                    </div>
                    <div className="group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '0.05s' }}>
                      <span className="text-gray-600">Category: </span>
                      <span className="text-sky-blue font-medium">{medicine.category}</span>
                    </div>
                  </div>

                  {/* Shortage Meter */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Availability Meter</span>
                      <span className="font-semibold text-royal-blue">{medicine.availability.toUpperCase()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${getAvailabilityColor(medicine.availability)} transition-all duration-1000 group-hover:animate-pulse`}
                        style={{
                          width: medicine.availability === 'high' ? '80%' : medicine.availability === 'moderate' ? '50%' : '20%',
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Warning/Recall Info */}
                  {medicine.warning && (
                    <div className={`p-3 rounded-lg mb-2 animate-wiggle ${medicine.recall ? 'bg-red-100 border-2 border-red-400' : 'bg-yellow-100 border-2 border-yellow-400'}`}>
                      <div className="flex items-start">
                        <span className="text-xl mr-2 animate-bounce-slow">{medicine.recall ? '⚠️' : '⚠️'}</span>
                        <div>
                          {medicine.recall && (
                            <span className="text-red-600 font-semibold text-sm">RECALL: </span>
                          )}
                          <span className={`text-sm ${medicine.recall ? 'text-red-700' : 'text-yellow-700'}`}>
                            {medicine.warning}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 animate-fade-in">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border-2 border-sky-blue/30 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-blue/20 hover:border-sky-blue hover:scale-110 transition-all duration-300 transform"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border-2 border-sky-blue/30 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-blue/20 hover:border-sky-blue hover:scale-110 transition-all duration-300 transform"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicineStock

