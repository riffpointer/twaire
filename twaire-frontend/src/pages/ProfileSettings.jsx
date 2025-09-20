import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";
import {
  Button,
  TextField,
  Avatar,
  Tooltip,
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckIcon from '@mui/icons-material/Check';


function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicName, setPublicName] = useState("");
  const [publicNameError, setPublicNameError] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
  const handleDeleteAccount = async () => {
    try {
      await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
        method: "DELETE",
        credentials: "include",
      });
      navigate("/signup");
    } catch (err) {
      console.error("Account deletion failed", err);
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
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Loading label="Loading profile settings..." />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" mb={2} gutterBottom>
            Profile Settings
          </Typography>
          <Alert severity="info" mb={2}>
            You cannot change your username once you have created your account. To request a username change, please contact the Twaire team.
          </Alert>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, width: "100%", mt: 3 }}
            onSubmit={handleSubmit}
            noValidate
          >
            <Box sx={{ mb: { xs: 3, md: 0 }, mr: { xs: 0, md: 4 }, display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="Change Profile Picture">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{ width: 100, height: 100, p: 0 }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <Avatar
                    src={preview || `${ApiConfig.serverUrl}/api/helper/placeholder/100x100?text=${publicName.charAt(0)}`}
                    sx={{ width: 100, height: 100 }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      color: "white",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <CameraAltIcon />
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                label="Public Name"
                fullWidth
                value={publicName}
                onChange={handlePublicNameChange}
                error={!!publicNameError}
                helperText={publicNameError}
                title="This will be displayed on your user profile and on the watch page."
                sx={{ mb: 3 }}
              />
              <TextField
                label="Bio"
                fullWidth
                multiline
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                title="Write some words about yourself; This will be displayed on your user profile page."
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="submit" variant="contained" color="primary">
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disableElevation
                  onClick={() => setShowDeleteModal(true)}
                  size="small"
                >
                  Delete Account
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete your account? This action is irreversible and will delete all your data, including videos and comments.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setShowDeleteModal(false);
              handleDeleteAccount();
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProfileSettings;