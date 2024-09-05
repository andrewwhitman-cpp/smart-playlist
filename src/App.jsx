import { Container } from "@mui/material"
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import UserPlaylists from './UserPlaylists.jsx'
import PlaylistSearch from './PlaylistSearch.jsx'
import { useState, useEffect } from 'react'
import CurrentPlaylist from './CurrentPlaylist.jsx'
import MyButton from "./MyButton.jsx"

function App() {
	const clientId = '9e2d4dd8eba243c9a01de32cb6b428c6'
	const params = new URLSearchParams(window.location.search)
	const code = params.get('code')

	const [accessToken, setAccessToken] = useState('')
	const [profileName, setProfileName] = useState('')
	const [profileID, setProfileID] = useState('')
	const [useSearch, setUseSearch] = useState(false)
	const [currentPlaylist, setCurrentPlaylist] = useState('')

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

	useEffect(() => {
		setCurrentPlaylist('')
	}, [useSearch])

	async function redirectToAuthCodeFlow(clientId) {
		const verifier = generateCodeVerifier(128)
		const challenge = await generateCodeChallenge(verifier)

		localStorage.setItem('verifier', verifier)

		const params = new URLSearchParams()
		params.append('client_id', clientId)
		params.append('response_type', 'code')
		if (window.location.href.includes('localhost:5173')) {
			params.append('redirect_uri', 'http://localhost:5173/smart-playlist/callback') // dev
		} else if (window.location.href.includes('localhost:5174')) {
			params.append('redirect_uri', 'http://localhost:5174/smart-playlist/callback') // preview
		} else if (window.location.href.includes('localhost:4173')) {
			params.append('redirect_uri', 'http://localhost:4173/smart-playlist/callback') // preview
		} else {
			params.append('redirect_uri', 'https://andrewwhitman-cpp.github.io/smart-playlist') // prod
		}
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
		if (window.location.href.includes('localhost:5173')) {
			params.append('redirect_uri', 'http://localhost:5173/smart-playlist/callback') // dev
		} else if (window.location.href.includes('localhost:5174')) {
			params.append('redirect_uri', 'http://localhost:5174/smart-playlist/callback') // preview
		} else if (window.location.href.includes('localhost:4173')) {
			params.append('redirect_uri', 'http://localhost:4173/smart-playlist/callback') // preview
		} else {
			params.append('redirect_uri', 'https://andrewwhitman-cpp.github.io/smart-playlist') // prod
		}
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
			fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
		}}
		>
			{profileName && <Header user={profileName} />}

			<MyButton
				text="My Playlists"
				width="30vw"
				active={!useSearch}
				f={() => setUseSearch(false)}
			/>

			<MyButton
				text="Search for Playlist"
				width="30vw"
				active={useSearch}
				f={() => setUseSearch(true)}
			/>

			<hr></hr>

			{accessToken &&
				!useSearch &&
				<UserPlaylists
					token={accessToken}
					userID={profileID}
					toggle={useSearch}
					f={(data) => setCurrentPlaylist(data)}
				/>}

			{accessToken &&
				useSearch &&
				<PlaylistSearch
					token={accessToken}
					f={(data) => setCurrentPlaylist(data)}
				/>}

			{currentPlaylist &&
				<CurrentPlaylist
					active={currentPlaylist}
					token={accessToken}
					userID={profileID}
					playlistID={currentPlaylist[0]}
					title={currentPlaylist[1]}
					url={currentPlaylist[3]}
				/>}

			<hr />
			{/* <Footer /> */}
		</Container>
	);
}

export default App
