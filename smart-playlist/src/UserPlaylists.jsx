import { useEffect, useState } from "react"

function UserPlaylists(props) {
    const token = props.token
    const userID = props.userID

    const [queryResults, setQueryResults] = useState([])

    useEffect(() => {
        const limit = 50
        handleClearQueryResult()
		const loadUserPlaylists = async () => {
            fetchUserPlaylists(token, limit)
                .then(data => {
                    console.log(data)
                    for (let i = 0; i < data.items.length; i++) {
                        let playlistName = data.items[i].name
                        handleAddQueryResult(playlistName)
                    }
                })
		}
		loadUserPlaylists()
	}, [props.toggle])

    async function fetchUserPlaylists(token, limit) {
        let query = 'https://api.spotify.com/v1/users/' + userID + '/playlists?limit=' + limit
        const result = await fetch(query, {
            method: 'GET', headers: { Authorization: `Bearer ${token}` }
        })
    
        return await result.json()
    }

    function handleAddQueryResult(item) {
        setQueryResults(l => [...l, item])
    }

    function handleClearQueryResult() {
        setQueryResults([])
    }

	return (
        <div>
            <ul>
                {queryResults.map((item, index) => 
                <li key={index}>
                    <button onClick={() => props.f(item)}>{item}</button>
                </li>)}
            </ul>
        </div>
	)
}

export default UserPlaylists
