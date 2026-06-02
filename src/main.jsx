import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MacroDataProvider } from './contexts/MacroDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MacroDataProvider>
      <App />
    </MacroDataProvider>
  </StrictMode>,
)
