import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoCard from "../components/VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Container,
  Paper,
  Box,
  Avatar,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';

function MyAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Account - Twaire";

    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);

        const vidRes = await fetch(
          `${ApiConfig.serverUrl}/api/videos?uploader=${data._id}`
        );
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          setVideos(vidData);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(`${ApiConfig.serverUrl}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Loading label="Loading your account..." />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              src={user.profilePicture ? `${ApiConfig.serverUrl}/${user.profilePicture}` : undefined}
              sx={{ width: 100, height: 100, mr: 3, fontSize: '4rem' }}
            >
              {!user.profilePicture && <PersonIcon fontSize="inherit" />}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 0 }}>
                {user.publicName || user.username}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                @{user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.subscribers.length} subscribers &bull;&nbsp;
                {user.accountViews || 0} views
              </Typography>
              <Button
                component={Link}
                to="/editprofile"
                variant="outlined"
                size="small"
                sx={{mt:0.5}}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>

          {user.bio && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" component="strong">
                About this channel
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {user.bio}
              </Typography>
            </Paper>
          )}

          <Typography variant="h6" component="h2" sx={{ mb: 2, mt: 3 }}>
            Your videos
          </Typography>
          {videos.length === 0 ? (
            <Typography variant="body2" fontStyle="italic">
              No videos.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {videos.map((video) => (
                <Grid item key={video._id}>
                  <Link
                    to={`/watch/${video._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <VideoCard video={video} />
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}

          <Divider sx={{ my: 3 }} />
          <Box sx={{display:"flex", width: "100%", justifyContent:"center"}}>
            <Button
              variant="contained"
              color="error"
              disableElevation
              onClick={() => setShowLogoutModal(true)}
              sx={{width:"100%"}}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>

      <Dialog
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? This action will redirect you to
            the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutModal(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowLogoutModal(false);
              handleLogout();
            }}
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyAccount;