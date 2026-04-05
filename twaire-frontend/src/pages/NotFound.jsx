import HomeIcon from "@mui/icons-material/Home";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function NotFound() {
  useEffect(() => {
    document.title = "Page not found - Twaire";
  }, []);

  return (
    <Container sx={{ mb: 10 }}>
      <Paper
        elevation={1}
        sx={{
          mt: 4,
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.25,
            color: "text.secondary",
            mb: 2,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 34 }} />
          <SentimentDissatisfiedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Typography variant="h4" gutterBottom>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          This page does not exist, or the URL may have been typed incorrectly.
        </Typography>
        <Button component={Link} to="/" variant="contained" startIcon={<HomeIcon />}>
          Go home
        </Button>
      </Paper>
    </Container>
  );
}

export default NotFound;
