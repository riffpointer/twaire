import { Button, CircularProgress } from "@mui/material";

function SubscribeButton({ subscribed, subLoading, handleSubscribe }) {
    return (
        <Button
            variant="contained"
            disableElevation
            color={subscribed ? "secondary" : "error"}
            size="small"
            onClick={handleSubscribe}
            disabled={subLoading}
            startIcon={subLoading ? (
                <CircularProgress
                    size={20}
                    sx={{
                        color: '#495057',
                        position: 'relative',
                        top: -1
                    }}
                />
            ) : null}
            sx={subscribed ? {
                backgroundColor: '#6c757d',
                '&:hover': {
                    backgroundColor: '#565e64'
                }
            } : {}}
        >
            {subLoading ? "Processing..." : (
                subscribed ? "Subscribed" : "Subscribe"
            )}
        </Button>

    );
}

export default SubscribeButton;