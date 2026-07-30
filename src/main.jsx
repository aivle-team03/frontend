import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import './styles/global.css'
import './styles/layout.css'
import './styles/dashboard.css'
import './styles/placeholder-page.css'
import './styles/education.css'
import './styles/service-footer.css'
import './styles/policy-document.css'
import App from './App.jsx'
import theme from './theme/theme.js'
import { installAuthInterceptors } from './api/authInterceptor.js'

installAuthInterceptors()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
