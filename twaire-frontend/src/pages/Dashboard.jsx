import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadIcon from "@mui/icons-material/Upload";
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
  Divider,
  FormControl,
  FormHelperText,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiConfig from "../utils/Api.js";
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
  const [statUserCreationDate, setStatUserCreationDate] = useState(null);

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
        setStatUserCreationDate(
          new Date(data.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          }),
        );
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
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: displaySizeMd ? "column" : "row",
        gap: 4,
        height: displaySizeMd ? "100%" : "80vh",
      }}
    >
      {/* Left Panel */}
      <Card
        sx={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          height: displaySizeMd ? "20em" : "100%",
          minWidth: displaySizeMd ? "100%" : "18em",
        }}
      >
        <Box p={2} pb={0}>
          <Typography variant="h6">Your Videos</Typography>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto", height: "100%" }}>
          {videos.map((v) => (
            <ListItemButton
              key={v._id}
              onClick={() => navigate(`/watch/${v._id}`)}
            >
              <ListItemText
                primary={v.title}
                secondary={
                  v.uploadedAt
                    ? "Uploaded at " +
                      new Date(v.uploadedAt).toLocaleDateString()
                    : ""
                }
              />
            </ListItemButton>
          ))}
          {videos.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              p={2}
              width="100%"
              textAlign="center"
            >
              No videos uploaded yet.
            </Typography>
          )}
        </List>
      </Card>

      {/* Right Panel */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant={displaySizeMd ? "h3" : "h2"} gutterBottom>
          Welcome to your dashboard!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Have an overview of how your videos are performing, update or delete
          your previous uploads, or upload a new video, all in one place!
        </Typography>
        <Divider />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2, mt: 2, width: displaySizeMd ? "100%" : "auto" }}
        >
          <UploadIcon sx={{ mr: 1 }} />
          Upload a video
        </Button>
        <Divider />
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Channel Statistics
            </Typography>
            <ul style={{ marginBottom: 0 }}>
              <li>
                You've uploaded <b>{videos.length}</b> videos so far!
              </li>
              <li>
                Your account was created on{" "}
                <b>{user ? statUserCreationDate : "..."}</b>, that was{" "}
                <b>{user ? getRelativeTime(user.createdAt) : "..."}</b>!
              </li>
              <li>
                You've got <b>{user ? user.subscribers : "..."}</b> subscriber
                {user && user.subscribers != 1 && "s"}{" "}
                {user && (user.subscribers == 0 ? " :(" : ":D")}
              </li>
            </ul>
          </CardContent>
        </Card>

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
      </Box>
    </Container>
  );
}

export default Dashboard;
