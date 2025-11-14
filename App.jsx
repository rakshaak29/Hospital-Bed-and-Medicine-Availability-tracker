import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import MedicineStock from './pages/MedicineStock'
import Alerts from './pages/Alerts'

function App() {
  const location = useLocation()
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="min-h-screen animated-gradient relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle absolute bg-sky-blue"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`,
            }}
          />
        ))}
        {/* Large floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-blue/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-blue/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-royal-blue-accent/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 bg-royal-blue-dark/80 backdrop-blur-xl border-b border-sky-blue/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold shimmer-text animate-pulse-slow">Medisphere</h1>
              <p className="text-sm text-light-sky italic animate-slide-down" style={{ animationDelay: '0.2s' }}>
                because every second in health counts
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  location.pathname === '/'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/medicine"
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  location.pathname === '/medicine'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Medicine Stock
              </Link>
              <Link
                to="/alerts"
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  location.pathname === '/alerts'
                    ? 'bg-sky-blue text-royal-blue font-semibold glow-effect'
                    : 'text-white hover:bg-sky-blue/20 hover:border border-sky-blue/50'
                }`}
              >
                Alerts
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicine" element={<MedicineStock />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

