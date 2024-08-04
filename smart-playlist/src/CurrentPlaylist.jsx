import { Typography } from "@mui/material"

function CurrentPlaylist(props) {
	return (
        <>
        <hr></hr>
        <Typography>
            {props.title}
        </Typography>
        </>
	)
}

export default CurrentPlaylist
