import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import JobTracker from './pages/JobTracker'
import Preparation from './pages/Preparation'
import InterviewPreparationFlow from './pages/InterviewPreparationFlow'
import InterviewSimulation from './pages/InterviewSimulation'
import QuestionBank from './pages/QuestionBank'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Test from './pages/Test'
import ProtectedRoute from './components/ProtectedRoute'
import { DarkModeProvider } from './context/DarkModeContext'
import { ActivityProvider } from './context/ActivityContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simple timeout to ensure we're past any initial loading issues
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Error catching
    const handleError = (event: ErrorEvent) => {
      console.error('App error caught:', event.error)
      setError(event.error?.message || 'An unknown error occurred')
    }

    window.addEventListener('error', handleError)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('error', handleError)
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading CareerQuestAI...</h2>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Please try refreshing the page or check your internet connection.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    )
  }

  // Normal app render with error boundaries
  try {
    return (
      <AuthProvider>
        <DarkModeProvider>
          <ActivityProvider>
            <Router>
              <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/build" element={
                      <ProtectedRoute>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    } />
                    <Route path="/job-tracker" element={
                      <ProtectedRoute>
                        <JobTracker />
                      </ProtectedRoute>
                    } />
                    <Route path="/preparation" element={
                      <ProtectedRoute>
                        <Preparation />
                      </ProtectedRoute>
                    } />
                    <Route path="/question-bank" element={
                      <ProtectedRoute>
                        <QuestionBank />
                      </ProtectedRoute>
                    } />
                    <Route path="/prepare/:id" element={
                      <ProtectedRoute>
                        <InterviewPreparationFlow />
                      </ProtectedRoute>
                    } />
                    <Route path="/interview-simulation/:id" element={
                      <ProtectedRoute>
                        <InterviewSimulation />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </ActivityProvider>
        </DarkModeProvider>
      </AuthProvider>
    )
  } catch (err) {
    console.error('App render error:', err)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">The application couldn't load properly</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
}

export default App