import { Box, Button, List, ListItem, Typography } from '@mui/material'
import { useState } from 'react'

function PlaylistSearch(props) {
    const token = props.token
    const [query, setQuery] = useState("")
    const [queryResults, setQueryResults] = useState([])
    const [playlistOwners, setPlaylistOwners] = useState([])

    const changeQuery = event => {
        setQuery(event.target.value)
    }
    
    function submitQuery() {
        let limit = 15
        handleClearQueryResult()
        handleClearPlaylistOwners()
        searchPlaylist(token, query, limit)
            .then(data => {
                console.log(data)
                for (let i = 0; i < limit; i++) {
                    let playlistName = data.playlists.items[i].name
                    let playlistOwner = data.playlists.items[i].owner.display_name
                    handleAddQueryResult(playlistName)
                    handleAddPlaylistOwner(playlistOwner)
                }
            })
    }
    
    function handleAddQueryResult(item) {
        setQueryResults(l => [...l, item])
    }

    function handleClearQueryResult() {
        setQueryResults([])
    }

    function handleAddPlaylistOwner(item) {
        setPlaylistOwners(l => [...l, item])
    }

    function handleClearPlaylistOwners() {
        setPlaylistOwners([])
    }

    async function searchPlaylist(token, query, limit) {
        let urlEncodedQuery = 'https://api.spotify.com/v1/search?q=' + query.replace(' ', '+') + '&type=playlist&limit=' + limit
        const result = await fetch(urlEncodedQuery, {
            method: 'GET', headers: { Authorization: `Bearer ${token}` }
        })
    
        return await result.json()
    }

    return (
        <div>
            <Typography>
                Search for a playlist to order its songs by similarity.
            </Typography>

            <div>
                <input onChange={changeQuery} value={query} placeholder='Enter playlist name'></input>
                <button onClick={submitQuery}>Submit</button>
            </div>

            <List>
                {queryResults.map((item, index) => 
                <li key={index}>
                    <button onClick={() => props.f(item)}>{item}</button>
                </li>)}
            </List>
        </div>
    )
}

export default PlaylistSearch
