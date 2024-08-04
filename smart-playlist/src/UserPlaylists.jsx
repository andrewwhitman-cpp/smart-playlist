import { List, ListItem, Table, TableBody, TableCell } from "@mui/material"
import { useEffect, useState } from "react"

function UserPlaylists(props) {
    const token = props.token
    const userID = props.userID

    const [playlists, setPlaylists] = useState([])

    useEffect(() => {
        const limit = 50
        handleClearPlaylists()
		const loadUserPlaylists = async () => {
            fetchUserPlaylists(token, limit)
                .then(data => {
                    console.log(data)
                    for (let i = 0; i < data.items.length; i++) {
                        let id = data.items[i].id
                        let name = data.items[i].name
                        let owner = data.items[i].owner.display_name
                        handleAddPlaylist([id, name, owner])
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

    function handleAddPlaylist(item) {
        setPlaylists(l => [...l, item])
    }

    function handleClearPlaylists() {
        setPlaylists([])
    }

	return (
        <Table>
            {playlists.map((item, index) => 
                <TableBody 
                    key={index} 
                    onClick={() => props.f(item)}
                >
                    {item[1]}
                </TableBody>
            )}
        </Table>
	)
}

export default UserPlaylists
