import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import ApiConfig from "../utils/ApiConfig.js";

function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicName, setPublicName] = useState("");
  const [publicNameError, setPublicNameError] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [removeProfilePictureButtonDisabled, setRemoveProfileButtonDisabled] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const navigate = (location) => { window.location.href = location };
  const routerNavigate = useNavigate();

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
        setRemoveProfileButtonDisabled(data.profilePicture == null);
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
  }, [routerNavigate]);

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

    setSaveInProgress(true);

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

  const handleRemoveProfilePicture = async () => {
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/me/delete/profile_picture`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setProfilePicture(null);
        setPreview(null);
        setRemoveProfileButtonDisabled(false);
      }
    } catch (err) {
      console.error("Failed to remove profile picture", err);
    }
  };

  if (loading) {
    return (
      <>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Loading label="Loading profile settings..." />
        </Container>
      </>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
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
            <Box sx={{ mb: { xs: 3, md: 0 }, mr: { xs: 0, md: 4 }, display: 'flex', justifyContent: 'start', alignItems: "center", flexDirection: "column", gap: 2 }}>
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
              <Button
                disabled={removeProfilePictureButtonDisabled}
                variant="contained"
                size="small"
                title="Remove the profile picture from your profile"
                onClick={handleRemoveProfilePicture}
              >
                <DeleteIcon fontSize="small" /> Remove picture
              </Button>            
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
                disabled={saveInProgress}
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
                disabled={saveInProgress}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="submit" variant="contained" color="primary" disabled={saveInProgress}>
                  {saveInProgress && <CircularProgress size={20} sx={{mr:1}} />}{" "}Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disableElevation
                  onClick={() => setShowDeleteModal(true)}
                  size="small"
                  disabled={saveInProgress}
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