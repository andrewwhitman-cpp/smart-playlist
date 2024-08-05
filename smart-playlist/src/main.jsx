import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'

const theme = createTheme({
	palette: {
		primary: {
			main: '#20B2AA', // LightSeaGreen
		},
		secondary: {
			main: '#FF6F61', // Soft Coral
		},
		background: {
			default: '#F5F5F5', // Cool White
		},
		text: {
			primary: '#333333', // Charcoal Gray
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontWeight: 700,
		},
		h2: {
			fontWeight: 600,
		},
		// Customize other typography styles here
	},
})

ReactDOM.createRoot(document.getElementById('root')).render(
	// <React.StrictMode>
	<ThemeProvider theme={theme}>
		<App />
	</ThemeProvider>
	// </React.StrictMode>,
)
