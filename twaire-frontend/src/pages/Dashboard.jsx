import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadIcon from "@mui/icons-material/Upload";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import Loading from "@/components/Loading.jsx";
import { getRelativeTime } from "../utils/DateUtils.js";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editingTag, setEditingTag] = useState({ index: null, text: "" });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const displaySizeMd = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    document.title = "Dashboard - Twaire";

    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);

        // Fetch user's uploaded videos
        const videosRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${data._id}/videos`,
        );
        const videosData = await videosRes.json();
        setVideos(videosData);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0 && alert?.videoId) {
      navigate(`/watch/${alert.videoId}`);
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, alert, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!file) newErrors.file = "Please select or drop a video file.";
    return newErrors;
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
    setTagInput("");
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleEditTagStart = (index, text) => setEditingTag({ index, text });
  const handleEditTagChange = (e) =>
    setEditingTag({ ...editingTag, text: e.target.value });
  const handleEditTagSubmit = () => {
    if (editingTag.index !== null) {
      const updatedTags = [...tags];
      const newText = editingTag.text.trim();
      const originalText = tags[editingTag.index];
      const isDuplicate = newText !== originalText && tags.includes(newText);

      if (newText && !isDuplicate) updatedTags[editingTag.index] = newText;
      else if (!newText) updatedTags.splice(editingTag.index, 1);

      setTags(updatedTags);
    }
    setEditingTag({ index: null, text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (tags.length > 0) formData.append("tags", tags.join(","));

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: "danger", message: data.error || "Upload failed" });
        return;
      }

      setAlert({
        type: "success",
        message: `Video uploaded successfully! Redirecting in`,
        videoId: data._id,
      });
      setRedirectCountdown(3);
      setDisabled(true);
      setTitle("");
      setDescription("");
      setTags([]);
      setFile(null);
      setThumbnail(null);
      setOpenDialog(false);

      setVideos((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
      setAlert({
        type: "danger",
        message: err.message || "Error uploading video.",
      });
    }
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    const videoFile = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("video/"),
    );
    if (videoFile) {
      setFile(videoFile);
      setErrors((prev) => ({ ...prev, file: null }));
    } else
      setAlert({
        type: "danger",
        message: "Invalid file type. Please drop a video.",
      });
  };

  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your videos, track performance, and upload new content.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "primary.main" }}>
                <VideoLibraryIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {videos.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Videos uploaded
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "primary.main" }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user ? user.subscribers ?? 0 : "..."}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Subscribers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ color: "primary.main" }}>
                <CalendarTodayIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user ? getRelativeTime(user.createdAt) : "..."}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Account age
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Video list - left side */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Your Videos
              </Typography>
              {videos.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic" py={1}>
                  No videos uploaded yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {videos.map((v) => (
                    <Grid key={v._id} size={{ xs: 12, sm: 6 }}>
                      <Box
                        onClick={() => navigate(`/watch/${v._id}`)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: 1,
                          borderColor: "divider",
                          "&:hover": { opacity: 0.9 },
                        }}
                      >
                        <Box sx={{ position: "relative", pt: "56.25%" }}>
                          <img
                            src={v.thumbnail ? `${ApiConfig.serverUrl}/${v.thumbnail}` : `${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
                            alt={v.title}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {v.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {v.uploadedAt ? getRelativeTime(v.uploadedAt) : "Just now"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload action - right side */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <Box sx={{ mb: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Upload a new video
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Share your content with the world
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenDialog(true)}
                startIcon={<UploadIcon />}
              >
                Upload
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={displaySizeMd}
          keepMounted
          scroll="paper"
        >
          <DialogTitle>Upload Video</DialogTitle>
          <DialogContent dividers={true}>
            {alert && (
              <Alert
                severity={alert.type === "danger" ? "error" : alert.type}
                sx={{ mb: 2 }}
              >
                {alert.message}
              </Alert>
            )}

            <TextField
              label="Title"
              fullWidth
              required
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
              error={!!errors.title}
              helperText={errors.title}
            />

            <TextField
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={disabled}
            />

            <TextField
              label="Tags"
              fullWidth
              margin="normal"
              value={tagInput}
              placeholder={
                tags.length === 0 ? "e.g., tutorial, react, node" : ""
              }
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              InputProps={{
                startAdornment: tags.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "nowrap",
                      gap: 0.5,
                      p: 0.5,
                    }}
                  >
                    {tags.map((tag, index) =>
                      editingTag.index === index ? (
                        <TextField
                          key={index}
                          value={editingTag.text}
                          onChange={handleEditTagChange}
                          onBlur={handleEditTagSubmit}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleEditTagSubmit()
                          }
                          autoFocus
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() =>
                            setTags(tags.filter((t) => t !== tag))
                          }
                          onClick={() => handleEditTagStart(index, tag)}
                          size="small"
                        />
                      ),
                    )}
                  </Box>
                ),
              }}
            />

            <FormControl fullWidth margin="normal" error={!!errors.file}>
              <ButtonBase disabled={disabled}>
                <Box
                  component="label"
                  onDragEnter={() => setIsDragging(true)}
                  onDragLeave={() => setIsDragging(false)}
                  onDragOver={handleDragEvents}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${errors.file ? "red" : grey[600]}`,
                    borderRadius: 2,
                    p: 4,
                    width: "100%",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragging
                      ? "action.hover"
                      : "transparent",
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={(e) =>
                      e.target.files[0] && setFile(e.target.files[0])
                    }
                    disabled={disabled}
                  />
                  <CloudUploadIcon
                    sx={{ fontSize: 50, color: "text.secondary", mb: 2 }}
                  />
                  <Typography>
                    {file
                      ? file.name
                      : "Drag & drop your video here or click to select a video"}
                  </Typography>
                </Box>
              </ButtonBase>
              {errors.file && <FormHelperText>{errors.file}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Custom thumbnail (optional)
              </Typography>
              <Button variant="outlined" component="label" disabled={disabled}>
                {thumbnail ? thumbnail.name : "Select Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                />
              </Button>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={disabled}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}

export default Dashboard;
