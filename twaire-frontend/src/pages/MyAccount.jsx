import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Paper,
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading.jsx";
import UserHeader from "@/components/UserHeader.jsx";
import UserTabs from "@/components/UserTabs.jsx";
import ApiConfig from "../utils/ApiConfig.js";

function MyAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videoVisibility, setVideoVisibility] = useState("all");
  const [playlists, setPlaylists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
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

        const params = new URLSearchParams();
        if (videoVisibility !== "all") {
          params.set("visibility", videoVisibility);
        }
        const vidRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${data._id}/videos${params.toString() ? `?${params.toString()}` : ""}`,
        );
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          setVideos(vidData);
        }

        const subscriptionsRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${data._id}/subscriptions`,
        );
        if (subscriptionsRes.ok) {
          const subscriptionsData = await subscriptionsRes.json();
          setSubscriptions(subscriptionsData);
        }

        const playlistsRes = await fetch(
          `${ApiConfig.serverUrl}/api/playlists/user/${data.username}`,
          { credentials: "include" },
        );
        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
        }

        const bookmarksRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/me/bookmarks`,
          { credentials: "include" },
        );
        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json();
          setBookmarkedVideos(Array.isArray(bookmarksData) ? bookmarksData : []);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, videoVisibility]);

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

  if (loading)
    return (
      <Container sx={{ mb: 4 }}>
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Skeleton variant="circular" width={112} height={112} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={40} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="25%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="35%" height={20} sx={{ mb: 1 }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </Paper>

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

  return (
    <>
      <Container sx={{ mb: 4 }}>
        {user && (
          <UserHeader user={user}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={Link}
                to="/editprofile"
                variant={user.banner ? "contained" : "outlined"}
                color={user.banner ? "inherit" : "primary"}
                size="small"
                sx={
                  user.banner
                    ? {
                        bgcolor: "rgba(255,255,255,0.16)",
                        color: "common.white",
                        backdropFilter: "blur(8px)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.24)",
                        },
                      }
                    : undefined
                }
              >
                Edit Profile
              </Button>
              <Button
                variant={user.banner ? "contained" : "outlined"}
                color="error"
                disableElevation
                onClick={() => setShowLogoutModal(true)}
                size="small"
                sx={
                  user.banner
                    ? {
                        bgcolor: "rgba(211, 47, 47, 0.82)",
                        color: "common.white",
                        "&:hover": {
                          bgcolor: "rgba(198, 40, 40, 0.94)",
                        },
                      }
                    : undefined
                }
              >
                Logout
              </Button>
            </Box>
          </UserHeader>
        )}
        <UserTabs
          user={user}
          videos={videos}
          subscriptions={subscriptions}
          playlists={playlists}
          showBookmarksTab={true}
          bookmarkedVideos={bookmarkedVideos}
          videoVisibility={videoVisibility}
          onVideoVisibilityChange={setVideoVisibility}
        />
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
