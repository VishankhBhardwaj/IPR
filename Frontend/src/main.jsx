import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.9rem',
        },
      }}
    />
  </StrictMode>,
)
