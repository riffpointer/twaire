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
  DialogContentText
} from "@mui/material";


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

        // fetch user's uploaded videos
        const vidRes = await fetch(`${ApiConfig.serverUrl}/api/videos?uploader=${data._id}`);
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

  if (loading) return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Loading label="Loading your account..." />
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <div className="card shadow-sm p-3">
          <div className="d-flex align-items-center mb-3">
            <img
              src={user.profilePicture ? `${ApiConfig.serverUrl}/${user.profilePicture}` : "https://placehold.co/100x100?text=Profile"}
              alt="Profile"
              className="rounded-circle me-3"
              width={100}
              height={100}
            />
            <div>
              <h3>{user.publicName || user.username}</h3>
              <p className="text-muted">@{user.username}</p>
            </div>
          </div>

          {user.bio && (
            <div className="mb-3">
              <strong>Bio:</strong>
              <p>{user.bio}</p>
            </div>
          )}

          <div className="mb-3">
            <strong>Subscribers:</strong> {user.subscribers.length} <br />
            <strong>Account views:</strong> {user.accountViews || 0}
          </div>

          <h4>Your videos</h4>
          {videos.length === 0 && (
            <i>No videos.</i>
          )}

          {videos.length > 0 && (
            <div className="mt-3">
              <div className="row g-3">
                {videos.map((video) => (
                  <div key={video._id} className="col-md-4">
                    <Link to={`/watch/${video._id}`} className="text-decoration-none">
                      <VideoCard
                        title={video.title}
                        channel={video.channel || video.uploaderUsername}
                        views={video.views}
                        thumbnail={video.thumbnail}
                        description={video.description}
                        uploadedAt={video.uploadedAt}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr />
          <Button variant="contained" color="error" disableElevation onClick={() => setShowLogoutModal(true)}>
            Logout
          </Button>
        </div>
      </div>

      {/* MUI Dialog for logout confirmation */}
      <Dialog
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? This action will redirect you to the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowLogoutModal(false);
              handleLogout();
            }}
            color="error"
            variant="text"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyAccount;
