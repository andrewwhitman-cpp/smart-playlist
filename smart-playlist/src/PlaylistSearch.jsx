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
                    let id = data.playlists.items[i].id
                    let name = data.playlists.items[i].name
                    let owner = data.playlists.items[i].owner.display_name
                    let url = data.playlists.items[i].tracks.href
                    handleAddQueryResult([id, name, owner, url])
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
        <>
            <Typography>
                Search for a playlist to order its songs by similarity.
            </Typography>

            <div>
                <input onChange={changeQuery} value={query} placeholder='Enter playlist name'></input>
                <button onClick={submitQuery}>Submit</button>
            </div>

            <Table>
                {queryResults.map((item, index) => 
                    <TableBody 
                        key={index} 
                        onClick={() => props.f(item)}
                        sx={{
                            cursor: "pointer"
                        }}
                    >
                        {item[1] + " by " + item[2]}
                    </TableBody>
                )}
            </Table>
        </>
    )
}

export default PlaylistSearch
