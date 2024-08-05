import { Button } from "@mui/material"

function MyButton(props) {
    return (
        <Button
            sx={{
                p: 1,
                m: 1,
                border: 1,
                borderColor: "secondary.main",
                bgcolor: "primary.main",
                color: "secondary.main",
                width: "20vw",
                ":hover": {
                    borderColor: "tertiary.main",
                    bgcolor: "tertiary.main",
                    color: "primary.main"
                }
            }}
            onClick={props.f}
        >
            {props.text}
        </Button>
    )
}

export default MyButton
