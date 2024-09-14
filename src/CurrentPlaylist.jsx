import { Typography, Divider, Box, List, ListItem, ListItemText } from "@mui/material"
import { useEffect, useState } from "react"
import MyButton from "./MyButton"

function CurrentPlaylist(props) {
    const [songs, setSongs] = useState([])
    const [songIDs, setSongIDs] = useState([])
    const [songURIs, setSongURIs] = useState([])
    const [sortedPlaylist, setSortedPlaylist] = useState([])
    const [sortedIndices, setSortedIndices] = useState([])
    const [newOrder, setNewOrder] = useState(false)

    useEffect(() => {
        handleClearSongs()
        handleClearSongIDs()
        handleClearSongURIs()
        handleClearSortedSongs()
        handleClearSortedIndices()
        fetchPlaylistTracks(props.token, props.url)
            .then(data => {
                for (let i = 0; i < data.items.length; i++) {
                    let songID = data.items[i].track.id
                    let songURI = data.items[i].track.uri
                    let songName = data.items[i].track.name
                    let artist = data.items[i].track.artists[0].name
                    handleAddSong([songName, artist])
                    handleAddSongID(songID)
                    handleAddSongURI(songURI)
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

    function handleAddSongID(id) {
        setSongIDs(l => [...l, id])
    }

    function handleClearSongIDs() {
        setSongIDs([])
    }

    function handleAddSongURI(item) {
        setSongURIs(l => [...l, item])
    }

    function handleClearSongURIs() {
        setSongURIs([])
    }

    function handleAddSortedSong(item) {
        setSortedPlaylist(l => [...l, item])
    }

    function handleClearSortedSongs() {
        setSortedPlaylist([])
    }

    function handleClearSortedIndices() {
        setSortedIndices([])
    }

    async function fetchPlaylistTracks(token, url) {
        const result = await fetch(url, {
            method: 'GET', headers: { Authorization: `Bearer ${token}` }
        })

        return await result.json()
    }

    async function fetchMultipleAudioFeatures(token, songIDs) {
        let query = 'https://api.spotify.com/v1/audio-features?ids='
        for (let i = 0; i < songIDs.length; i++) {
            query += songIDs[i]
            if (i != songIDs.length - 1) query += ','
        }

        const result = await fetch(query, {
            method: 'GET', headers: { Authorization: `Bearer ${token}` }
        })

        return await result.json()
    }

    function similarityMatrix(playlistAudioFeatures) {
        const n = playlistAudioFeatures.length

        let mat = []
        for (let i = 0; i < n; i++) {
            let row = []
            for (let j = 0; j < n; j++) {
                if (j == i) row.push(Infinity)
                else row.push(getSimilarityScore(playlistAudioFeatures[i], playlistAudioFeatures[j])['score'])
            }
            mat.push(row)
        }

        return mat
    }

    function getSimilarityScore(audioFeatures1, audioFeatures2) {
        let score = 0

        // key change
        let keyDiff = Math.abs(audioFeatures1['key'] - audioFeatures2['key'])
        if (keyDiff == 0) {
            score += 0
        } else if (keyDiff == 4 || keyDiff == 5 || keyDiff == 7) {
            // third, fourth, or fifth
            score += 1
        } else {
            score += 2
        }

        // score += Math.abs(keyDiff) / 2
        // score += Math.abs(audioFeatures1['acousticness'] - audioFeatures2['acousticness']) * 2
        // score += Math.abs(audioFeatures1['danceability'] - audioFeatures2['danceability'])
        score += Math.abs(audioFeatures1['energy'] - audioFeatures2['energy'])
        // score += Math.abs(audioFeatures1['instrumentalness'] - audioFeatures2['instrumentalness']) * 3
        // score += Math.abs(audioFeatures1['liveness'] - audioFeatures2['liveness'])
        score += Math.abs(audioFeatures1['loudness'] - audioFeatures2['loudness'])
        // score += Math.abs(audioFeatures1['valence'] - audioFeatures2['valence'])

        return { score }
    }

    function sortPlaylistBySimilarity(simMat) {
        const n = simMat.length
        let simimlaritySum = 0
        let score = 0

        let songUsed = []
        for (let i = 0; i < n; i++) {
            songUsed.push(0)
        }

        let i = 0
        let count = 0
        let songOrder = []
        while (true) {
            count += 1

            let tempMinVal = 1000000
            let tempMinIndex = 0

            for (let j = 0; j < n; j++) {
                if (i == j) continue
                if (!songUsed[j] && simMat[i][j] < tempMinVal) {
                    tempMinVal = simMat[i][j]
                    tempMinIndex = j
                    simimlaritySum += simMat[i][j]
                }
            }

            songOrder.push(i)
            songUsed[i] = 1
            i = tempMinIndex

            if (count == n) break
        }
        score = simimlaritySum / n

        console.log("new song index order: " + songOrder)

        return songOrder
    }

    function sortPlaylistBySongAlpha() {
        // Create an array of indices
        let songOrder = songs.map((_, index) => index);

        // Sort the indices based on the first element of the sub-arrays (song title)
        songOrder.sort((a, b) => {
            const songA = songs[a][0];
            const songB = songs[b][0];
            
            // Compare the song title strings
            if (songA < songB) return -1;
            if (songA > songB) return 1;
            return 0;
          });
        console.log("new song index order: " + songOrder)

        return songOrder
    }

    async function newPlaylist() {
        const method = 'POST'
        const headers = { Authorization: `Bearer ${props.token}`, 'Content-Type': 'application/json' }
        const newTitle = props.title + " - Smart Sorted"
        const data = `{"name": "${newTitle}", "description": "Smart sorted playlist", "public": false}`

        const result = await fetch('https://api.spotify.com/v1/users/' + props.userID + '/playlists', {
            method: method, headers: headers, body: data
        })

        const result_json = await result.json()

        return result_json
    }

    async function populatePlaylist(id) {
        const method = 'POST'
        const headers = { Authorization: `Bearer ${props.token}`, 'Content-Type': 'application/json' }

        let newPlaylistURIs = []
        for (let i = 0; i < songs.length; i++) {
            const currentURI = songURIs[sortedIndices[i]]
            newPlaylistURIs.push(currentURI)
        }
        const data = { "uris": newPlaylistURIs, "position": 0 }

        const result = await fetch('https://api.spotify.com/v1/playlists/' + id + '/tracks?uris=' + newPlaylistURIs, {
            method: method, headers: headers, data: data
        })

        return await result.json()
    }

    async function reorder(type) {
        setNewOrder(true)
        if (type === "smart") {
            console.log("smart sorting...")

            const audioFeatures = await fetchMultipleAudioFeatures(props.token, songIDs)

            // create similarity matrix
            const simMat = similarityMatrix(audioFeatures.audio_features)

            // sort playlist for high similarity with adjacent songs
            const sortedPlaylistIndices = sortPlaylistBySimilarity(simMat)
            setSortedIndices(sortedPlaylistIndices)

            // get sorted track names
            for (let i = 0; i < sortedPlaylistIndices.length; i++) {
                handleAddSortedSong(songs[sortedPlaylistIndices[i]])
            }
        } else if (type === "songAlpha") {
            console.log("sorting alphabetically by song title...")

            // sort playlist alphabetically by song title
            const sortedPlaylistIndices = sortPlaylistBySongAlpha()
            setSortedIndices(sortedPlaylistIndices)

            // get sorted track names
            for (let i = 0; i < sortedPlaylistIndices.length; i++) {
                handleAddSortedSong(songs[sortedPlaylistIndices[i]])
            }
        } else if (type === "artistAlpha") {
            //
        } else if (type === "songLength") {
            //
        }
    }

    return (
        <>
            <hr></hr>
            <MyButton
                text="Smart Sort"
                width="20vw"
                f={() => reorder("smart")}
            />
            <br />
            <MyButton
                text="Sort by Song Title"
                width="20vw"
                f={() => reorder("songAlpha")}
            />
            <br />

            {newOrder &&
                <MyButton
                    text="Save New Playlist"
                    width="25vw"
                    f={async () => {
                        const newPL = await newPlaylist()
                        const result = await populatePlaylist(newPL.id)
                        if (result.snapshot_id) {
                            alert("Success!")
                        } else {
                            alert("Playlist creation error")
                        }
                    }}
                />
            }

            <Typography
                variant="h5"
                sx={{ p: 1, m: 1, fontWeight: "bold" }}
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
                        sx={{ fontWeight: "bold", textDecoration: "underline" }}
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
                            {sortedPlaylist.map((item, index) =>
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
        </>
    )
}

export default CurrentPlaylist
