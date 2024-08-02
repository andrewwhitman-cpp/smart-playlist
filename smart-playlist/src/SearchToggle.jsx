import { Button } from "@mui/material"

function SearchToggle({ f, text }) {
	return (
        <Button 
			onClick={f} 
			sx={{
				bgcolor: "tertiary.main",
				color: "secondary.main",
				p: 1,
				m: 2,
				width: "25vw"
			}}
        >
            {text}
        </Button>
	)
}

export default SearchToggle
