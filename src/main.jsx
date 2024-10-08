import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material'

const theme = createTheme({
	palette: {
		primary: {
			// main: '#20B2AA', // LightSeaGreen
			main: '#3AB09E',
			dark: '#2E8A7C',
			light: '#66CCBD',
		},
		secondary: {
			main: '#EBC484',
			dark: '#E2AA50',
			light: '#F4DDB9',
		},
		tertiary: {
			main: '#999999',
			dark: '#0A0A0A',
			light: '#F5F5F5',
		},
		background: {
			// default: '#F5F5F5', // Cool White
			default: '#F2F3F4', // Cool White
		},
		text: {
			// primary: '#333333', // Charcoal Gray
			primary: '#414A4C', // Charcoal Gray
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
