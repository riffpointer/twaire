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
            {user.profilePicture ? (
              <img
                src={`${ApiConfig.serverUrl}/${user.profilePicture}`}
                alt="Profile"
                className="rounded-circle me-3"
                width={100}
                height={100}
              />
            ) : (
              <div className="me-3 no-profile-icon">
                <i className="bi bi-person-fill"></i>
              </div>
            )}
            <div>
              <h3 className="mb-0">{user.publicName || user.username}</h3>
              <p className="text-muted mb-0">@{user.username}</p>
              <small className="text-muted mb-2 mt-0 d-block">
                {user.subscribers.length} subscribers &bull;&nbsp;
                {user.accountViews || 0} views
              </small>
              <Link to="/editprofile">
                <Button variant="outlined" size="small">Edit Profile</Button>
              </Link>
            </div>
          </div>

          {user.bio && (
            <div className="card p-3 mb-3">
              <strong>About this channel</strong>
              <p className="mb-0">{user.bio}</p>
            </div>
          )}

          <h2 className="mb-0 mt-2">Your videos</h2>
          {videos.length === 0 && (
            <i>No videos.</i>
          )}

          {videos.length > 0 && (
            <div className="mt-3">
              <div className="row g-3">
                {videos.map((video) => (
                  <div key={video._id} className="col-md-4">
                    <Link to={`/watch/${video._id}`} className="text-decoration-none">
                      <VideoCard video={video} />
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
