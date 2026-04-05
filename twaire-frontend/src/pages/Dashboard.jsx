import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
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
import {
  DEFAULT_VIDEO_CATEGORY,
  VIDEO_CATEGORY_OPTIONS,
} from "../utils/VideoCategories.js";

function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(DEFAULT_VIDEO_CATEGORY);
  const [visibility, setVisibility] = useState("public");
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
  const [channelViewsAnalytics, setChannelViewsAnalytics] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [thumbnailLoadedMap, setThumbnailLoadedMap] = useState({});
  const [fabCollapsed, setFabCollapsed] = useState(false);

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

        const analyticsRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/me/analytics/views?days=30`,
          {
            credentials: "include",
          },
        );
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setChannelViewsAnalytics(analyticsData);
        }
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

  useEffect(() => {
    const handleScroll = () => {
      setFabCollapsed(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    formData.append("category", category);
    formData.append("visibility", visibility === "public" ? "0" : visibility === "unlisted" ? "1" : "2");
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
      setCategory(DEFAULT_VIDEO_CATEGORY);
      setVisibility("public");
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

  const markThumbnailLoaded = (videoId) => {
    setThumbnailLoadedMap((prev) => (prev[videoId] ? prev : { ...prev, [videoId]: true }));
  };

  const channelViewsSeries = channelViewsAnalytics?.series || [];
  const maxChannelViews = channelViewsSeries.reduce((max, bucket) => Math.max(max, bucket.views || 0), 0);
  const totalChannelViews = channelViewsAnalytics?.totalViews ?? 0;
  const averageChannelViews = channelViewsAnalytics?.averageViews ?? 0;

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
          <Card
            elevation={2}
            sx={{
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
              <Box
                sx={{
                  color: "primary.main",
                  bgcolor: "transparent",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <VideoLibraryIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                  {videos.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Videos uploaded
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
              <Box
                sx={{
                  color: "primary.main",
                  bgcolor: "transparent",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                  {user ? user.subscribers ?? 0 : "..."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Subscribers
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
              <Box
                sx={{
                  color: "primary.main",
                  bgcolor: "transparent",
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <CalendarTodayIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                  {user ? getRelativeTime(user.createdAt) : "..."}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Account age
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card elevation={2} sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Channel views
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily channel views for the last 30 days.
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                    {totalChannelViews.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total views
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(30, minmax(0, 1fr))",
                  alignItems: "end",
                  gap: 0.75,
                  minHeight: 180,
                  mt: 2,
                }}
              >
                {channelViewsSeries.map((bucket) => {
                  const barHeight = maxChannelViews ? Math.max((bucket.views / maxChannelViews) * 100, bucket.views > 0 ? 10 : 3) : 3;
                  return (
                    <Box key={bucket.date} sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                      <Box
                        sx={{
                          width: "100%",
                          minHeight: 160,
                          display: "flex",
                          alignItems: "end",
                        }}
                      >
                        <Box
                          title={`${bucket.date}: ${bucket.views.toLocaleString()} views`}
                          sx={{
                            width: "100%",
                            height: `${barHeight}%`,
                            minHeight: bucket.views > 0 ? 8 : 3,
                            borderRadius: 0.75,
                            bgcolor: "primary.main",
                            opacity: 0.82,
                            transition: "transform 160ms ease, opacity 160ms ease",
                            "&:hover": {
                              opacity: 1,
                              transform: "translateY(-2px)",
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: "0.65rem", lineHeight: 1, whiteSpace: "nowrap" }}
                      >
                        {new Intl.DateTimeFormat("en", { day: "numeric" }).format(new Date(bucket.date))}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, gap: 2, flexWrap: "wrap" }}>
                <Typography variant="caption" color="text.secondary">
                  Average per day: {averageChannelViews.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Video list */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2} sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Your Videos
                </Typography>
                <IconButton
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  size="small"
                  title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
                  sx={{ borderRadius: 1 }}
                >
                  {viewMode === "grid" ? <ViewListIcon /> : <GridViewIcon />}
                </IconButton>
              </Box>
              {videos.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No videos uploaded yet.
                  </Typography>
                </Box>
              ) : viewMode === "grid" ? (
                <Grid container spacing={2}>
                  {videos.map((v) => (
                    <Grid key={v._id} size={{ xs: 12, sm: 6 }}>
                      <ButtonBase
                        onClick={() => navigate(`/watch/${v._id}`)}
                        sx={{
                          cursor: "pointer",
                          borderRadius: 1,
                          overflow: "hidden",
                          display: "block",
                          textAlign: "left",
                          width: "100%",
                          bgcolor: "background.paper",
                          boxShadow: (theme) => theme.shadows[1],
                          transition: "box-shadow 0.18s ease",
                          "&:hover": {
                            boxShadow: (theme) => theme.shadows[3],
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", aspectRatio: "16 / 9", bgcolor: "grey.200" }}>
                          {!thumbnailLoadedMap[v._id] && (
                            <Skeleton
                              variant="rectangular"
                              sx={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          )}
                          <img
                            src={v.thumbnail ? `${ApiConfig.serverUrl}/data/thumbnails/${v.thumbnail}` : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(v.title)}`}
                            alt={v.title}
                            loading="lazy"
                            onLoad={() => markThumbnailLoaded(v._id)}
                            onError={() => markThumbnailLoaded(v._id)}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              opacity: thumbnailLoadedMap[v._id] ? 1 : 0,
                              transition: "opacity 180ms ease-out",
                            }}
                          />
                        </Box>
                        <Box sx={{ p: 1.75 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {v.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {v.views || 0} views &bull; {v.likes?.length || 0} likes &bull; {v.uploadedAt ? getRelativeTime(v.uploadedAt) : "Just now"}
                          </Typography>
                        </Box>
                      </ButtonBase>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {videos.map((v) => (
                    <ButtonBase
                      key={v._id}
                      onClick={() => navigate(`/watch/${v._id}`)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        gap: 2,
                        borderRadius: 1,
                        overflow: "hidden",
                        height: 100,
                        width: "100%",
                        textAlign: "left",
                        bgcolor: "background.paper",
                        boxShadow: (theme) => theme.shadows[1],
                        transition: "box-shadow 0.18s ease",
                        "&:hover": {
                          boxShadow: (theme) => theme.shadows[3],
                        },
                      }}
                    >
                      <Box sx={{ width: 160, height: 90, flexShrink: 0, bgcolor: "grey.200", position: "relative" }}>
                        {!thumbnailLoadedMap[v._id] && (
                          <Skeleton
                            variant="rectangular"
                            sx={{
                              position: "absolute",
                              inset: 0,
                            }}
                          />
                        )}
                        <img
                          src={v.thumbnail ? `${ApiConfig.serverUrl}/data/thumbnails/${v.thumbnail}` : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(v.title)}`}
                          alt={v.title}
                          loading="lazy"
                          onLoad={() => markThumbnailLoaded(v._id)}
                          onError={() => markThumbnailLoaded(v._id)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: thumbnailLoadedMap[v._id] ? 1 : 0,
                            transition: "opacity 180ms ease-out",
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {v.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {v.views || 0} views &bull; {v.likes?.length || 0} likes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {v.uploadedAt ? getRelativeTime(v.uploadedAt) : "Just now"}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          startIcon={<CloudUploadIcon />}
          sx={{
            borderRadius: 999,
            minHeight: 56,
            px: fabCollapsed ? 1.5 : 2.25,
            minWidth: fabCollapsed ? 56 : 132,
            width: "auto",
            boxShadow: (theme) => theme.shadows[6],
            transition: "all 220ms ease",
            overflow: "hidden",
            "& .MuiButton-startIcon": {
              marginRight: fabCollapsed ? 0 : 1,
              marginLeft: 0,
            },
          }}
          >
          <Box
            component="span"
            sx={{
              maxWidth: fabCollapsed ? 0 : 120,
              opacity: fabCollapsed ? 0 : 1,
              transition: "all 220ms ease",
              whiteSpace: "nowrap",
            }}
          >
            Upload
          </Box>
        </Button>
      </Box>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          fullScreen={displaySizeMd}
          keepMounted
          scroll="paper"
        >
          <DialogTitle sx={{ pb: 1 }}>Upload Video</DialogTitle>
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

            <FormControl fullWidth margin="normal" disabled={disabled}>
              <InputLabel id="video-category-label">Category</InputLabel>
              <Select
                labelId="video-category-label"
                id="video-category"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {VIDEO_CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Choose the category that best matches your video.
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth margin="normal" disabled={disabled}>
              <InputLabel id="video-visibility-label">Visibility</InputLabel>
              <Select
                labelId="video-visibility-label"
                id="video-visibility"
                value={visibility}
                label="Visibility"
                onChange={(e) => setVisibility(e.target.value)}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
              <FormHelperText>
                Public videos appear everywhere. Unlisted videos are accessible by link. Private videos are only visible to you.
              </FormHelperText>
            </FormControl>

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
