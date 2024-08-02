import { Button, Container, Typography } from "@mui/material"
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import SearchToggle from './SearchToggle.jsx'
import UserPlaylists from './UserPlaylists.jsx'
import PlaylistSearch from './PlaylistSearch.jsx'
import { useState, useEffect, createContext } from 'react'
import CurrentPlaylist from './CurrentPlaylist.jsx'

function App() {
	const clientId = '9e2d4dd8eba243c9a01de32cb6b428c6'
	const params = new URLSearchParams(window.location.search)
	const code = params.get('code')

	const [accessToken, setAccessToken] = useState('')
	const [profileName, setProfileName] = useState('')
	const [profileID, setProfileID] = useState('')
	const [useSearch, setUseSearch] = useState(false)
	const [currentPlaylistName, setCurrentPlaylistName] = useState('')

	useEffect(() => {
		const userLogin = async () => {
			if (!code) {
				redirectToAuthCodeFlow(clientId)
			} else {
				getAccessToken(clientId, code)
					.then(tokenResponse => {
						setAccessToken(tokenResponse)

						fetchProfile(tokenResponse)
							.then(profileResponse => {
								setProfileName(profileResponse.display_name)
								setProfileID(profileResponse.id)
							})
					})
			}
		}
		userLogin()
	}, [])
	
	async function redirectToAuthCodeFlow(clientId) {
		const verifier = generateCodeVerifier(128)
		const challenge = await generateCodeChallenge(verifier)
	
		localStorage.setItem('verifier', verifier)
	
		const params = new URLSearchParams()
		params.append('client_id', clientId)
		params.append('response_type', 'code')
		params.append('redirect_uri', 'http://localhost:5173/callback')
		params.append('scope', 'user-read-private user-read-email playlist-modify-public playlist-modify-private')
		params.append('code_challenge_method', 'S256')
		params.append('code_challenge', challenge)
	
		document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
	}

	function generateCodeVerifier(length) {
		let text = ''
		let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	
		for (let i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length))
		}
		return text
	}

	async function generateCodeChallenge(codeVerifier) {
		const data = new TextEncoder().encode(codeVerifier)
		const digest = await window.crypto.subtle.digest('SHA-256', data)
		return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '')
	}

	async function getAccessToken(clientId, code) {
		const verifier = localStorage.getItem('verifier')
	
		const params = new URLSearchParams()
		params.append('client_id', clientId)
		params.append('grant_type', 'authorization_code')
		params.append('code', code)
		params.append('redirect_uri', 'http://localhost:5173/callback')
		params.append('code_verifier', verifier)
	
		const result = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: params
		})
	
		const { access_token } = await result.json()
		return access_token
	}

	async function fetchProfile(token) {
		const result = await fetch('https://api.spotify.com/v1/me', {
			method: 'GET', headers: { Authorization: `Bearer ${token}` }
		})

		return await result.json()
	}

	return (
		<Container sx={{ 
			textAlign: "center",
			fontFamily: "arial" }}
		>
			{profileName && <Header user={profileName}/>}
			
			<SearchToggle f={() => setUseSearch(false)} text="My Playlists"/>

			<SearchToggle f={() => setUseSearch(true)} text="Search for Playlist"/>

			<hr></hr>

			{accessToken && !useSearch && <UserPlaylists f={(data) => setCurrentPlaylistName(data)} token={accessToken} userID={profileID} toggle={useSearch}/>}

			{accessToken && useSearch && <PlaylistSearch token={accessToken}/>}

			{currentPlaylistName && <CurrentPlaylist title={currentPlaylistName}/>}

			<Footer />
		</Container>
	);
}

export default App
