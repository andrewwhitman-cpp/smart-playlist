import { Typography, Table, TableBody } from "@mui/material"
import { useEffect, useState } from "react"

function CurrentPlaylist(props) {
    const [songs, setSongs] = useState([])

    useEffect(() => {
        console.log(props.title, props.url)
        handleClearSongs()
        fetchPlaylistTracks(props.token, props.url)
            .then(data => {
                console.log(data)
                for (let i = 0; i < data.items.length; i++) {
                    let songName = data.items[i].track.name
                    let artist = data.items[i].track.artists[0].name
                    handleAddSong([songName, artist])
                }
            })
    }, [props.active, props.url])

    function handleAddSong(item) {
        setSongs(l => [...l, item])
    }

    function handleClearSongs() {
        setSongs([])
    }

    async function fetchPlaylistTracks(token, url) {
        const result = await fetch(url, {
            method: 'GET', headers: { Authorization: `Bearer ${token}` }
        })
    
        return await result.json()
    }

	return (
        <>
        <hr></hr>
        <Typography
            variant="h5"
            sx={{
                fontWeight: "bold"
            }}
        >
            {props.title}
        </Typography>
        <Table>
            {songs.map((item, index) => 
                <TableBody 
                    key={index}
                >
                    {item[0] + " by " + item[1]}
                </TableBody>
            )}
        </Table>
        </>
	)
}

export default CurrentPlaylist
