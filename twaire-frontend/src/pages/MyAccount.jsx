import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import UserHeader from "../components/UserHeader.jsx";
import UserTabs from "../components/UserTabs.jsx";
import ApiConfig from "../utils/ApiConfig.js";

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

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };

  if (loading) return <Loading label="Loading your account..." />;

  return (
    <>
      <Container sx={{ mb: 4 }}>
        {user && (
          <UserHeader user={user}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={Link}
                to="/editprofile"
                variant="outlined"
                size="small"
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                disableElevation
                onClick={() => setShowLogoutModal(true)}
                size="small"
              >
                Logout
              </Button>
            </Box>
          </UserHeader>
        )}
        <UserTabs user={user} videos={videos} />
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