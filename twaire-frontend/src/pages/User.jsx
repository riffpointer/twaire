import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Box, Container, Grid, Paper, Skeleton, Typography } from "@mui/material";
import Loading from "@/components/Loading.jsx";
import SubscribeButton from "@/components/SubscribeButton.jsx";
import UserHeader from "@/components/UserHeader.jsx";
import UserTabs from "@/components/UserTabs.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import AppSnackbar from "@/components/AppSnackbar.jsx";

function User() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchUserAndVideos = async () => {
      try {
        const resUser = await fetch(
          `${ApiConfig.serverUrl}/api/users/${username}`,
        );
        if (!resUser.ok) throw new Error("User not found");
        const userData = await resUser.json();
        setUser(userData);

        const resVideos = await fetch(
          `${ApiConfig.serverUrl}/api/videos?uploader=${userData._id}`,
        );
        if (resVideos.ok) {
          const vidData = await resVideos.json();
          setVideos(vidData);
        }

        const resSubscriptions = await fetch(
          `${ApiConfig.serverUrl}/api/users/${userData._id}/subscriptions`,
        );
        if (resSubscriptions.ok) {
          const subscriptionsData = await resSubscriptions.json();
          setSubscriptions(subscriptionsData);
        }

        const resPlaylists = await fetch(
          `${ApiConfig.serverUrl}/api/playlists/user/${userData.username}`,
          { credentials: "include" }
        );
        if (resPlaylists.ok) {
          const playlistData = await resPlaylists.json();
          setPlaylists(playlistData);
        }

        const subRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${userData._id}/isSubscribed`,
          { credentials: "include" },
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscribed(subData.subscribed);
        }

        document.title = `${userData.username} - Twaire`;
      } catch (err) {
        console.error(err);
        showSnackbar(`Unable to load videos: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch {
        // Not logged in
      }
    };

    fetchUserAndVideos();
    fetchCurrentUser();
  }, [username, subscribed]);

  const handleSubscribe = async () => {
    if (!user?._id) return;

    if (currentUser && user._id === currentUser._id) {
      showSnackbar("You may not subscribe to yourself", "warning");
      return;
    }

    try {
      setSubLoading(true);
      const res = await fetch(
        `${ApiConfig.serverUrl}/api/users/${user._id}/subscribe`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribed(data.subscribed);
    } catch (err) {
      console.error(err);
      showSnackbar("Subscription failed: " + err.message, "error");
    } finally {
      setSubLoading(false);
    }
  };

  if (loading)
    return (
      <Container sx={{ mb: 10 }}>
        {/* User Header Skeleton */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={112} height={112} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="25%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="35%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </Paper>

        {/* Tabs Skeleton */}
        <Paper elevation={2} sx={{ p: 2, pt: 1 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, borderBottom: 1, borderColor: "divider", pb: 1 }}>
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="text" width={60} height={24} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width={160} height={40} sx={{ mb: 2 }} />
          </Box>
          <Grid container spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" height={16} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );

  if (!user)
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
            <i className="bi bi-search-off" style={{ fontSize: 34 }} aria-hidden="true" />
            <i className="bi bi-emoji-frown" style={{ fontSize: 30 }} aria-hidden="true" />
          </Box>
          <Typography variant="h4" gutterBottom>
            User not found
          </Typography>
          <Typography color="text.secondary">
            This channel may not exist, or the username may have been typed incorrectly.
          </Typography>
        </Paper>
        <AppSnackbar
          open={snackbarOpen}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </Container>
    );

  return (
    <Container sx={{ mb: 10 }}>
      {user && (
        <UserHeader user={user}>
          <div className="mt-2">
            <SubscribeButton
              subscribed={subscribed}
              subLoading={subLoading}
              handleSubscribe={handleSubscribe}
            />
          </div>
        </UserHeader>
      )}

      <UserTabs user={user} videos={videos} subscriptions={subscriptions} playlists={playlists} currentUser={currentUser} subscribed={subscribed} />

      <AppSnackbar
        open={snackbarOpen}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Container>
  );
}

export default User;
