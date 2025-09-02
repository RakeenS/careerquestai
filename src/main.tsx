import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'
import { ActivityProvider } from './context/ActivityContext.tsx'
import { SpeedInsights } from '@vercel/speed-insights/react'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ActivityProvider>
          <App />
          <SpeedInsights />
        </ActivityProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)