import { Button } from "@mui/material"

function MyButton(props) {
    return (
        <Button
            sx={{
                p: 1,
                m: 1,
                border: 1,
                borderColor: props.active ? "primary.main" : "text.primary",
                bgcolor: props.active ? "primary.main" : "background.default",
                color: props.active ? "background.default" : "text.primary",
                width: props.width,
                ":hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.dark",
                    color: "background.default",
                }
            }}
            onClick={props.f}
        >
            {props.text}
        </Button>
    )
}

export default MyButton
