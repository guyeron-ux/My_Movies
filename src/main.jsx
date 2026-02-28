import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1A1930',
          color: '#fff',
          border: '1px solid rgba(108,59,224,0.4)',
          fontFamily: 'Heebo, sans-serif',
          direction: 'rtl',
          fontSize: '16px',
        },
      }}
    />
  </React.StrictMode>,
)
