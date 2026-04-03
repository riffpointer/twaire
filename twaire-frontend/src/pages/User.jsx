import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Container } from "@mui/material";
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
      } catch (err) {
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

  if (loading) return <Loading label="Loading user..." />;

  if (!user)
    return (
      <>
        <h1>User not found.</h1>
        <AppSnackbar
          open={snackbarOpen}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </>
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

      <UserTabs user={user} videos={videos} />

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
