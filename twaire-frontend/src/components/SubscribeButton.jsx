import { Button, CircularProgress } from "@mui/material";
import {grey} from "@mui/material/colors";

function SubscribeButton({ subscribed, subLoading, handleSubscribe }) {
  return (
    <Button
      variant="contained"
      disableElevation
      color={subscribed ? 'secondary' : 'error'}
      size="small"
      onClick={handleSubscribe}
      disabled={subLoading}
      startIcon={
        subLoading ? (
          <CircularProgress
            size={20}
            sx={{
              color: grey[600],
              position: 'relative',
              top: -1,
            }}
          />
        ) : null
      }
      sx={
        subscribed
          ? {
            backgroundColor: grey[600],
            '&:hover': {
              backgroundColor: grey[700],
            },
          }
          : {}
      }
    >
      {subLoading ? 'Processing...' : subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>

  );
}

export default SubscribeButton;