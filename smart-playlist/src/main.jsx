import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#000000"
    },
    tertiary: {
      main: "#20b2aa" // light sea green
      // main: "#CD5C5C" // indian red
      // main: "#9966CC" // amethyst
    },
  },
  typography: {
    // h1: {
    //   fontSize: "3rem",
    //   fontWeight: 600,
    // },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
  // </React.StrictMode>,
)
