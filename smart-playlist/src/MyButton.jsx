import { Button } from "@mui/material"

function MyButton(props) {
    const c = props.color ? props.color : "primary.main"
    return (
        <Button
            sx={{
                p: 1,
                m: 1,
                border: 1,
                borderColor: props.active ? c : "text.primary",
                bgcolor: props.active ? c : "background.default",
                color: props.active ? "background.default" : "text.primary",
                width: props.width,
                ":hover": {
                    borderColor: c,
                    bgcolor: c,
                    color: "background.default"
                }
            }}
            onClick={props.f}
        >
            {props.text}
        </Button>
    )
}

export default MyButton
