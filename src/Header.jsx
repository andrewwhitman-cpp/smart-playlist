import { Typography } from "@mui/material"

function Header(props) {
	return (
		<Typography
			// sx={{ my: 4, textAlign: "center" }}
		>
			<Typography
				variant="h2"
			>
				Smart Playlist Sorter
			</Typography>
			<Typography
				variant="h5"
				color={"primary.main"}
			>
				Logged in as {props.user ? props.user : "Nobody"}
			</Typography>
			<hr></hr>
		</Typography>
	)
}

export default Header
