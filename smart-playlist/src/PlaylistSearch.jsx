import { Box, Button, List, ListItem, Table, TableBody, TableCell, Typography } from '@mui/material'
import { useState } from 'react'

function PlaylistSearch(props) {
    const token = props.token
    const [query, setQuery] = useState("")
    const [queryResults, setQueryResults] = useState([])

    const changeQuery = event => {
        setQuery(event.target.value)
    }
    
    function submitQuery() {
        let limit = 15
        handleClearQueryResult()
        searchPlaylist(token, query, limit)
            .then(data => {
                console.log(data)
                for (let i = 0; i < limit; i++) {
                    let playlistName = data.playlists.items[i].name
                    let playlistOwner = data.playlists.items[i].owner.display_name
                    handleAddQueryResult(playlistName + " by " + playlistOwner)
                }
            })
    }
    
    function handleAddQueryResult(item) {
        setQueryResults(l => [...l, item])
    }

    function handleClearQueryResult() {
        setQueryResults([])
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

            <Table>
                {queryResults.map((playlist, index) => 
                    <TableBody 
                        key={index} 
                        onClick={() => props.f(playlist)}
                    >
                        {playlist}
                    </TableBody>
                )}
            </Table>
        </div>
    )
}

export default PlaylistSearch
