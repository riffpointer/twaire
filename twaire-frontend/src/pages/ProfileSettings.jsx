import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import { Button, TextField, Avatar, ButtonBase, Tooltip } from "@mui/material";

function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicName, setPublicName] = useState("");
  const [publicNameError, setPublicNameError] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile Settings - Twaire";

    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);
        setPublicName(data.publicName || data.username);
        setBio(data.bio || "");
        if (data.profilePicture) {
          setPreview(`${ApiConfig.serverUrl}/${data.profilePicture}`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePublicNameChange = (e) => {
    setPublicName(e.target.value);
    if (e.target.value) {
      setPublicNameError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!publicName.trim()) {
      setPublicNameError("Public name cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append("publicName", publicName);
    formData.append("bio", bio);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        navigate("/myaccount");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <Loading label="Loading profile settings..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <div className="card shadow-sm p-3">
          <h3>Profile Settings</h3>
          <form className="d-flex flex-row w-100 mt-4" onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="profile-picture-container position-relative d-inline-block">
                <Avatar src={preview || `https://placehold.co/100x100?text=${publicName.charAt(0)}`} sx={{ width: 100, height: 100 }} />
                <input type="file" id="profile-picture-upload" hidden onChange={handleFileChange} accept="image/*" />
                <Tooltip title="Change Profile Picture">
                  <ButtonBase
                    component="label"
                    htmlFor="profile-picture-upload"
                    className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center rounded-circle"
                  >
                    <i className="bi bi-camera-fill text-white fs-2"></i>
                  </ButtonBase>
                </Tooltip>
              </div>
            </div>
            <div className="flex-grow-1 ms-4">
              <div className="mb-3">
                <TextField
                  label="Public Name"
                  fullWidth
                  value={publicName}
                  onChange={handlePublicNameChange}
                  error={!!publicNameError}
                  helperText={publicNameError}
                />
              </div>
              <div className="mb-3">
                <TextField
                  label="Bio"
                  fullWidth
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProfileSettings;