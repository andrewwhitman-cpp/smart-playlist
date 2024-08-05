import { Typography, Table, TableBody, Button, Container, Divider, Box, List, ListItem, ListItemText } from "@mui/material"
import { useEffect, useState } from "react"
import MyButton from "./MyButton"

function CurrentPlaylist(props) {
    const [songs, setSongs] = useState([])
    const [newOrder, setNewOrder] = useState(false)

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

    useEffect(() => {
        setNewOrder(false)
    }, [songs])

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
        <MyButton text="Reorder" f={() => setNewOrder(true)}></MyButton>

        <Typography
            variant="h5"
            sx={{
                p: 1,
                m: 1,
                fontWeight: "bold"
            }}
        >
            {props.title}
        </Typography>

        <Box 
            display="flex" 
            alignItems="center"
            flex={1}
        >
            <Box 
                p={2}
                flex={1}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        textDecoration: "underline"
                    }}
                >
                    Original Order
                </Typography>

                <List>
                    {songs.map((item, index) => 
                        <ListItem key={index} sx={{ textAlign: "center" }}>
                            <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                                {index + 1}.
                            </Typography>
                            <ListItemText>
                                {item[0] + " by " + item[1]}
                            </ListItemText>
                        </ListItem>
                    )}
                </List>
            </Box>

            {newOrder &&
            <Divider orientation="vertical" flexItem />
            }

            {newOrder &&
            <Box 
                p={2}
                flex={1}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        textDecoration: "underline"
                    }}
                >
                    New Order
                </Typography>

                <List>
                    {songs.map((item, index) => 
                        <ListItem key={index} sx={{ textAlign: "center" }}>
                            <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                                {index + 1}.
                            </Typography>
                            <ListItemText>
                                {item[0] + " by " + item[1]}
                            </ListItemText>
                        </ListItem>
                    )}
                </List>
            </Box>
            }
        </Box>

        {newOrder &&
        <MyButton text="Save New Order"></MyButton>
        }
        </>
	)
}

export default CurrentPlaylist
