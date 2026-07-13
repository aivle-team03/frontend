import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2f64b7',
      dark: '#173b78',
      light: '#dbeafe',
    },
    background: {
      default: '#f4f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#64748b',
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      '"NanumSquare", "NanumSquareRound", "Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 800,
      letterSpacing: 0,
    },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.06)',
    '0 4px 12px rgba(15, 23, 42, 0.07)',
    '0 10px 24px rgba(15, 23, 42, 0.08)',
    '0 14px 32px rgba(15, 23, 42, 0.1)',
    ...Array(20).fill('0 14px 32px rgba(15, 23, 42, 0.1)'),
  ],
})

export default theme
