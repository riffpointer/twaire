import MenuIcon from "@mui/icons-material/Menu";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HomeIcon from "@mui/icons-material/Home";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  LinearProgress,
  ListItemText,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Tooltip,
  TextField,
  Toolbar,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import UserDropdown from "../components/UserDropdown.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import { DEFAULT_VIDEO_CATEGORY, VIDEO_CATEGORY_OPTIONS } from "../utils/VideoCategories.js";

const NAV_ITEMS = [
  { label: "Home", to: "/dashboard", icon: <HomeIcon /> },
  { label: "Videos", to: "/dashboard/videos", icon: <VideoLibraryIcon /> },
  { label: "Statistics", to: "/dashboard/statistics", icon: <BarChartIcon /> },
  { label: "Settings", to: "/dashboard/settings", icon: <SettingsIcon /> },
];

function SectionShell({ title, children }) {
  return (
    <Box sx={{ p: { xs: 0, md: 0 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function DummyStatistics({ activeMetrics }) {
  const cards = [
    ["Views", "12.4K"],
    ["Watch time", "84h"],
    ["CTR", "6.8%"],
    ["Subscribers", "+42"],
  ];

  return (
    <SectionShell title="Statistics">
      <Grid container spacing={2.5}>
        {cards.map(([label, value]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUpIcon fontSize="small" />
          <Typography variant="body2">{activeMetrics.growthText}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon fontSize="small" />
          <Typography variant="body2">{activeMetrics.activeDays} active days</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <VideoLibraryIcon fontSize="small" />
          <Typography variant="body2">{activeMetrics.videoCount} videos</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          mt: 2.5,
          minHeight: 220,
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          display: "grid",
          placeItems: "center",
          color: "text.secondary",
          bgcolor: "action.hover",
        }}
      >
        Placeholder for charts and performance trends.
      </Box>
    </SectionShell>
  );
}

function DashboardHome({ videos, stats, chartData, growthRate, activeDays }) {
  const totalViews = chartData.totalViews;
  const averageViews = chartData.averageViews;
  const chartHeight = 280;
  const chartWidth = Math.max(chartData.series.length, 30) * 28;
  const maxViews = chartData.series.reduce((max, bucket) => Math.max(max, bucket.views || 0), 0);
  const chartPath = chartData.series
    .map((bucket, index) => {
      const x = chartData.series.length > 1 ? (index / (chartData.series.length - 1)) * (chartWidth - 56) + 28 : chartWidth / 2;
      const ratio = maxViews > 0 ? bucket.views / maxViews : 0;
      const y = (chartHeight - 28) - ratio * (chartHeight - 56);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const chartAreaPath = chartPath ? `${chartPath} L ${chartWidth - 28} ${chartHeight - 28} L 28 ${chartHeight - 28} Z` : "";

  const metricCards = [
    ["Videos", videos.length, "Uploaded content"],
    ["Views", stats.views || 0, "Total watch activity"],
    ["Likes", stats.likes || 0, "Audience reactions"],
    ["Subscribers", stats.subscribers || 0, "Channel growth"],
  ];

  return (
    <SectionShell title="Home">
      <Grid container spacing={2.5} mb={3}>
        {metricCards.map(([label, value, helper]) => (
          <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {helper}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Channel views
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily views over the last 30 days.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                      {totalViews.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      30-day total
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                      {averageViews.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Daily average
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ position: "relative", width: "100%", overflow: "hidden" }}>
                <Box component="svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" sx={{ width: "100%", height: chartHeight, display: "block" }}>
                  {[0.25, 0.5, 0.75, 1].map((step) => {
                    const y = 28 + (chartHeight - 56) * (1 - step);
                    return (
                      <g key={step}>
                        <line x1={28} x2={chartWidth - 28} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.15" strokeDasharray="5 6" />
                        <text x={8} y={y + 4} fill="currentColor" opacity="0.6" fontSize="11">
                          {Math.round(maxViews * step)}
                        </text>
                      </g>
                    );
                  })}
                  {chartAreaPath && <path d={chartAreaPath} fill="currentColor" fillOpacity="0.08" />}
                  {chartPath && <path d={chartPath} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Quick snippets
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Growth</Typography>
                <Typography variant="body2" fontWeight={700}>{growthRate >= 0 ? "+" : ""}{growthRate}%</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Active days</Typography>
                <Typography variant="body2" fontWeight={700}>{activeDays}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Comments</Typography>
                <Typography variant="body2" fontWeight={700}>{stats.comments || 0}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Replies</Typography>
                <Typography variant="body2" fontWeight={700}>{stats.replies || 0}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SectionShell>
  );
}

function DummySettings() {
  const [tab, setTab] = useState(0);
  const [savedAt, setSavedAt] = useState(null);
  const [settings, setSettings] = useState({
    general: {
      country: "India",
      channelKeywords: "twaire, videos, creator",
      channelLanguage: "English",
      contentLocation: "India",
    },
    uploadDefaults: {
      visibility: "private",
      category: "entertainment",
      license: "standard",
      commentVisibility: "approve_all",
      tags: "twaire, creator",
    },
    privacy: {
      subscriptionsVisible: true,
      savedPlaylistsVisible: true,
      communityPostsVisible: true,
      subscriberCountVisible: true,
    },
    permissions: {
      inviteEmail: "",
      collaborationMode: "viewer",
      notifyOnChanges: true,
    },
    advanced: {
      channelId: "twaire-creator",
      monetization: "enabled",
      audience: "not_made_for_kids",
      uploadDelay: 0,
      automaticCaptions: true,
    },
  });

  const updateSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  return (
    <SectionShell title="Settings">
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Tab label="General" />
        <Tab label="Upload defaults" />
        <Tab label="Privacy" />
        <Tab label="Permissions" />
        <Tab label="Advanced" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Channel language"
              value={settings.general.channelLanguage}
              onChange={(event) => updateSection("general", "channelLanguage", event.target.value)}
              helperText="Used for language-specific recommendations and captions."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Country of residence"
              value={settings.general.country}
              onChange={(event) => updateSection("general", "country", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Content location"
              value={settings.general.contentLocation}
              onChange={(event) => updateSection("general", "contentLocation", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Channel keywords"
              value={settings.general.channelKeywords}
              onChange={(event) => updateSection("general", "channelKeywords", event.target.value)}
              helperText="Comma-separated keywords for your channel."
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Accordion defaultExpanded>
              <AccordionSummary>
                <Typography fontWeight={700}>Visibility hints</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Studio usually centralizes profile discoverability, featured sections, and regional defaults here. This area is ready for more backend-backed options later.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Default visibility</FormLabel>
              <Select
                value={settings.uploadDefaults.visibility}
                onChange={(event) => updateSection("uploadDefaults", "visibility", event.target.value)}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Default category</FormLabel>
              <Select
                value={settings.uploadDefaults.category}
                onChange={(event) => updateSection("uploadDefaults", "category", event.target.value)}
              >
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="gaming">Gaming</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="tech">Technology</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>License</FormLabel>
              <Select
                value={settings.uploadDefaults.license}
                onChange={(event) => updateSection("uploadDefaults", "license", event.target.value)}
              >
                <MenuItem value="standard">Standard YouTube License</MenuItem>
                <MenuItem value="creative_commons">Creative Commons</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Comments and ratings</FormLabel>
              <Select
                value={settings.uploadDefaults.commentVisibility}
                onChange={(event) => updateSection("uploadDefaults", "commentVisibility", event.target.value)}
              >
                <MenuItem value="approve_all">Approve all comments</MenuItem>
                <MenuItem value="hold_potential">Hold potentially inappropriate comments for review</MenuItem>
                <MenuItem value="hold_all">Hold all comments for review</MenuItem>
                <MenuItem value="disable">Disable comments</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Default tags"
              value={settings.uploadDefaults.tags}
              onChange={(event) => updateSection("uploadDefaults", "tags", event.target.value)}
              helperText="Applied automatically to new uploads."
            />
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          {[
            ["subscriptionsVisible", "Show subscriptions publicly"],
            ["savedPlaylistsVisible", "Show saved playlists publicly"],
            ["communityPostsVisible", "Show community activity publicly"],
            ["subscriberCountVisible", "Show subscriber count publicly"],
          ].map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {label}
                  </Typography>
                  <RadioGroup
                    row
                    value={settings.privacy[field] ? "yes" : "no"}
                    onChange={(event) => updateSection("privacy", field, event.target.value === "yes")}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="On" />
                    <FormControlLabel value="no" control={<Radio />} label="Off" />
                  </RadioGroup>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Invite collaborator by email"
              value={settings.permissions.inviteEmail}
              onChange={(event) => updateSection("permissions", "inviteEmail", event.target.value)}
              helperText="Prepared for future team access workflows."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Default collaborator role</FormLabel>
              <Select
                value={settings.permissions.collaborationMode}
                onChange={(event) => updateSection("permissions", "collaborationMode", event.target.value)}
              >
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Notification behavior
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Notify collaborators when settings or upload defaults change.
                </Typography>
                <RadioGroup
                  row
                  value={settings.permissions.notifyOnChanges ? "yes" : "no"}
                  onChange={(event) => updateSection("permissions", "notifyOnChanges", event.target.value === "yes")}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="On" />
                  <FormControlLabel value="no" control={<Radio />} label="Off" />
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 4 && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Channel ID"
              value={settings.advanced.channelId}
              onChange={(event) => updateSection("advanced", "channelId", event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Audience</FormLabel>
              <Select
                value={settings.advanced.audience}
                onChange={(event) => updateSection("advanced", "audience", event.target.value)}
              >
                <MenuItem value="not_made_for_kids">Not made for kids</MenuItem>
                <MenuItem value="made_for_kids">Made for kids</MenuItem>
                <MenuItem value="mixed">Set by video</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1 }}>Monetization status</FormLabel>
              <Select
                value={settings.advanced.monetization}
                onChange={(event) => updateSection("advanced", "monetization", event.target.value)}
              >
                <MenuItem value="enabled">Enabled</MenuItem>
                <MenuItem value="review">Under review</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Upload delay
              </Typography>
              <Slider
                value={settings.advanced.uploadDelay}
                onChange={(_, value) => updateSection("advanced", "uploadDelay", value)}
                step={5}
                marks
                min={0}
                max={60}
                valueLabelDisplay="auto"
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Accordion>
              <AccordionSummary>
                <Typography fontWeight={700}>Advanced caption and processing options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Automatic captions
                </Typography>
                <RadioGroup
                  row
                  value={settings.advanced.automaticCaptions ? "yes" : "no"}
                  onChange={(event) => updateSection("advanced", "automaticCaptions", event.target.value === "yes")}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="On" />
                  <FormControlLabel value="no" control={<Radio />} label="Off" />
                </RadioGroup>
                <ListItemText
                  primary="Processing defaults"
                  secondary="These controls are placeholders for future backend-backed processing rules."
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 3, flexWrap: "wrap" }}>
        <Typography variant="caption" color="text.secondary">
          {savedAt ? `Last saved at ${savedAt}` : "Changes are local until you wire them to the backend."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setTab(0);
            }}
          >
            Reset view
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save settings
          </Button>
        </Box>
      </Box>
    </SectionShell>
  );
}

function DashboardVideos({
  videos,
  setVideos,
}) {
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editingTag, setEditingTag] = useState({ index: null, text: "" });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState(DEFAULT_VIDEO_CATEGORY);
  const [visibility, setVisibility] = useState("public");
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  const validateForm = () => {
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!file) nextErrors.file = "Please select or drop a video file.";
    return nextErrors;
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
    setTagInput("");
  };

  const handleTagInputKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddTag();
    } else if (event.key === "Backspace" && tagInput === "" && tags.length > 0) {
      event.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const handleEditTagStart = (index, text) => setEditingTag({ index, text });
  const handleEditTagChange = (event) => setEditingTag({ ...editingTag, text: event.target.value });
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

  const deriveTitleFromFilename = (filename) => {
    const baseName = filename.replace(/\.[^/.]+$/, "");
    return baseName
      .replace(/[_-]+/g, " ")
      .replace(/[^\w\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((word) => {
        if (/^\d+$/.test(word)) return word;
        const lower = word.toLowerCase();
        return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
      })
      .join(" ");
  };

  const handleSelectedFile = (videoFile) => {
    setFile(videoFile);
    setErrors((prev) => ({ ...prev, file: null }));
    setTitle((current) => (current.trim() ? current : deriveTitleFromFilename(videoFile.name)));
  };

  const handleUpload = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("visibility", visibility === "public" ? "0" : visibility === "unlisted" ? "1" : "2");
    formData.append("video", file);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (tags.length > 0) formData.append("tags", tags.join(","));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${ApiConfig.serverUrl}/api/videos`, true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      setUploadProgress(0);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setVideos((current) => [data, ...current]);
          setAlert({ type: "success", message: "Video uploaded successfully." });
          setOpenUpload(false);
          setTitle("");
          setDescription("");
          setTags([]);
          setTagInput("");
          setEditingTag({ index: null, text: "" });
          setFile(null);
          setThumbnail(null);
          setCategory(DEFAULT_VIDEO_CATEGORY);
          setVisibility("public");
          setErrors({});
        } else {
          setAlert({ type: "error", message: data.error || "Upload failed" });
        }
      } catch {
        setAlert({ type: "error", message: "Upload failed" });
        setOpenUpload(false);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setUploadProgress(0);
      setAlert({ type: "error", message: "Error uploading video." });
    };

    xhr.send(formData);
  };

  const handleDragEvents = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    handleDragEvents(event);
    setIsDragging(false);
    const videoFile = Array.from(event.dataTransfer.files).find((entry) => entry.type.startsWith("video/"));
    if (videoFile) {
      handleSelectedFile(videoFile);
    } else {
      setAlert({ type: "error", message: "Invalid file type. Please drop a video." });
    }
  };

  const getVisibilityLabel = (video) => {
    const raw = video.visibility ?? video.privacy ?? video.status;
    if (raw === 0 || raw === "0" || raw === "public") return "Public";
    if (raw === 1 || raw === "1" || raw === "unlisted") return "Unlisted";
    if (raw === 2 || raw === "2" || raw === "private") return "Private";
    return "Public";
  };

  const getVisibilityValue = (video) => {
    const raw = video.visibility ?? video.privacy ?? video.status;
    if (raw === 0 || raw === "0" || raw === "public") return "public";
    if (raw === 1 || raw === "1" || raw === "unlisted") return "unlisted";
    if (raw === 2 || raw === "2" || raw === "private") return "private";
    return "public";
  };

  const handleVisibilityChange = async (videoId, nextVisibility) => {
    setVideos((current) =>
      current.map((video) =>
        video._id === videoId ? { ...video, visibility: nextVisibility } : video,
      ),
    );

    try {
      await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visibility:
            nextVisibility === "public" ? "0" : nextVisibility === "unlisted" ? "1" : "2",
        }),
      });
    } catch (error) {
      console.error("Failed to update visibility", error);
    }
  };

  const getVideoCount = (video) => video.views || 0;
  const getLikeCount = (video) => video.likes?.length || video.likeCount || 0;
  const getCommentCount = (video) => video.comments?.length || video.commentCount || 0;

  return (
    <SectionShell title="Videos">
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setOpenUpload(true)}>
          Upload video
        </Button>
        <Button
          variant="outlined"
          startIcon={viewMode === "grid" ? <ViewListIcon /> : <GridViewIcon />}
          onClick={() => setViewMode((mode) => (mode === "grid" ? "list" : "grid"))}
        >
          {viewMode === "grid" ? "List view" : "Grid view"}
        </Button>
      </Box>

      {videos.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No videos uploaded yet.
          </Typography>
        </Box>
      ) : viewMode === "grid" ? (
        <Grid container spacing={2}>
          {videos.map((video) => (
            <Grid key={video._id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ButtonBase
                onClick={() => navigate(`/watch/${video._id}`)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  boxShadow: 1,
                }}
              >
                <Box sx={{ aspectRatio: "16 / 9", bgcolor: "grey.200" }}>
                  <img
                    src={
                      video.thumbnail
                        ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
                        : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title || "Video")}`
                    }
                    alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {video.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {video.views || 0} views
                  </Typography>
                </Box>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Divider sx={{ width: "100%", mb: 1.25 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.7fr) 120px 90px 80px 100px",
              gap: 2,
              px: 2,
              pb: 1,
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            <Box>Video</Box>
            <Box>Visibility</Box>
            <Box>Views</Box>
            <Box>Likes</Box>
            <Box>Comments</Box>
          </Box>
          {videos.map((video) => (
            <ButtonBase
              key={video._id}
              onClick={() => navigate(`/watch/${video._id}`)}
              sx={{
                width: "100%",
                textAlign: "left",
                borderRadius: 2.5,
                overflow: "hidden",
                bgcolor: "rgba(255, 255, 255, 0.04)",
                boxShadow: (theme) => theme.shadows[2],
                border: "1px solid",
                borderColor: "divider",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.7fr) 120px 90px 80px 100px",
                gap: 2,
                alignItems: "center",
                p: 1.25,
                transition: "border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(255,255,255,0.1)",
                  boxShadow: (theme) => theme.shadows[3],
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                <Box sx={{ width: 160, flexShrink: 0, aspectRatio: "16 / 9", borderRadius: 1.5, overflow: "hidden", bgcolor: "grey.900" }}>
                  <img
                    src={
                      video.thumbnail
                        ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
                        : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title || "Video")}`
                    }
                    alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={800} noWrap>
                    {video.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : "Recently uploaded"}
                  </Typography>
                </Box>
              </Box>
              <Select
                value={getVisibilityValue(video)}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => handleVisibilityChange(video._id, event.target.value)}
                variant="standard"
                disableUnderline
                IconComponent={ArrowDropDownIcon}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  width: "fit-content",
                  minWidth: 0,
                  "& .MuiSelect-select": {
                    paddingRight: "18px !important",
                    paddingLeft: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: 16,
                    color: "text.secondary",
                    right: 0,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 0.5,
                    },
                  },
                }}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="unlisted">Unlisted</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
              <Typography variant="body2" fontWeight={600} noWrap>
                {getVideoCount(video).toLocaleString()}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {getLikeCount(video).toLocaleString()}
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {getCommentCount(video).toLocaleString()}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      )}

      <Dialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            transition: "width 220ms ease, height 220ms ease, transform 220ms ease",
          },
        }}
      >
        <DialogTitle>Upload Video</DialogTitle>
        <DialogContent
          dividers
          sx={{
            transition: "min-height 220ms ease, padding 220ms ease",
          }}
        >
          {alert && (
            <Alert severity={alert.type === "error" ? "error" : alert.type} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}
          {uploading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 420 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", mb: 0.5 }}
                >
                  Uploading
                </Typography>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{ textAlign: "center", lineHeight: 1, mb: 1 }}
                >
                  {uploadProgress}%
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 10,
                    borderRadius: 999,
                    overflow: "hidden",
                    bgcolor: "action.hover",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${uploadProgress}%`,
                      borderRadius: 999,
                      bgcolor: "primary.main",
                      transition: "width 180ms ease-out",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Title *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Description"
                multiline
                minRows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="upload-category-label">Category *</InputLabel>
                <Select
                  labelId="upload-category-label"
                  label="Category *"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {VIDEO_CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Choose the category that best matches your video.</FormHelperText>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="upload-visibility-label">Visibility *</InputLabel>
                <Select
                  labelId="upload-visibility-label"
                  label="Visibility *"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value)}
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
                fullWidth
                margin="normal"
                label="Tags"
                value={tagInput}
                placeholder={tags.length === 0 ? "e.g., tutorial, react, node" : ""}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagInputKeyDown}
                InputProps={{
                  startAdornment: tags.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "nowrap", gap: 0.5, p: 0.5 }}>
                      {tags.map((tag, index) => (
                        editingTag.index === index ? (
                          <TextField
                            key={`${tag}-${index}`}
                            value={editingTag.text}
                            onChange={handleEditTagChange}
                            onBlur={handleEditTagSubmit}
                            onKeyDown={(event) => event.key === "Enter" && handleEditTagSubmit()}
                            autoFocus
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Chip
                            key={`${tag}-${index}`}
                            label={tag}
                            onDelete={() => setTags(tags.filter((entry) => entry !== tag))}
                            onClick={() => handleEditTagStart(index, tag)}
                            size="small"
                          />
                        )
                      ))}
                    </Box>
                  ),
                }}
              />
              <FormControl fullWidth margin="normal" error={!!errors.file}>
                <ButtonBase disabled={uploading}>
                  <Box
                    component="label"
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                    sx={{
                      border: `2px dashed ${errors.file ? "red" : "#757575"}`,
                      borderRadius: 2,
                      p: 4,
                      width: "100%",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isDragging ? "action.hover" : "transparent",
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(event) => event.target.files?.[0] && handleSelectedFile(event.target.files[0])}
                      disabled={uploading}
                    />
                    <CloudUploadIcon sx={{ fontSize: 50, color: "text.secondary", mb: 2 }} />
                    <Typography>
                      {file ? file.name : "Drag & drop your video here or click to select a video"}
                    </Typography>
                  </Box>
                </ButtonBase>
                {errors.file && <FormHelperText>{errors.file}</FormHelperText>}
              </FormControl>
              <FormControl fullWidth margin="normal">
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Custom thumbnail (optional)
                </Typography>
                <Button variant="outlined" component="label" disabled={uploading}>
                  {thumbnail ? thumbnail.name : "Select Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
                  />
                </Button>
              </FormControl>
              {file && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {file.name}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </SectionShell>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState("/dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    setCurrentSection(location.pathname);
  }, [location.pathname]);

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

        const videosRes = await fetch(`${ApiConfig.serverUrl}/api/users/${data._id}/videos`);
        const videosData = await videosRes.json();
        setVideos(videosData);

        const analyticsRes = await fetch(`${ApiConfig.serverUrl}/api/users/me/analytics/views?days=30`, {
          credentials: "include",
        });
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());

        const summaryRes = await fetch(`${ApiConfig.serverUrl}/api/users/me/analytics/summary`, {
          credentials: "include",
        });
        if (summaryRes.ok) setSummary(await summaryRes.json());
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const activeNavItem = useMemo(
    () => NAV_ITEMS.find((item) => currentSection === item.to) || NAV_ITEMS[0],
    [currentSection],
  );

  const activeMetrics = {
    growthRate: analytics?.growthRate ?? 0,
    activeDays: analytics?.activeDays ?? 0,
    videoCount: videos.length,
  };
  const stats = summary?.totals || {};
  const chartData = {
    series: analytics?.series || [],
    totalViews: analytics?.totalViews ?? 0,
    averageViews: analytics?.averageViews ?? 0,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <MenuIcon />
          </IconButton>
          <Tooltip title="Go back to the Twaire home page" arrow placement="bottom-start">
            <Box
              component={Link}
              to="/"
              sx={{
                minWidth: 0,
                flex: 1,
                color: "inherit",
                textDecoration: "none",
                display: "inline-flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} noWrap>
                Twaire Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {activeNavItem.label}
              </Typography>
            </Box>
          </Tooltip>
          {user && (
            <UserDropdown
              user={user}
              handleLogout={async () => {
                try {
                  await fetch(`${ApiConfig.serverUrl}/api/users/logout`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ switchToken: user?.switchToken || null }),
                  });
                  navigate("/login");
                } catch (error) {
                  console.error("Logout failed", error);
                }
              }}
              savedAccounts={[]}
              handleSwitchAccount={async () => {}}
              handleAddAccount={() => navigate("/login")}
            />
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Box
          sx={{
            width: sidebarOpen ? 260 : 0,
            flexShrink: 0,
            position: "sticky",
            top: { xs: "56px", sm: "64px" },
            height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
            overflow: "hidden",
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.standard,
            }),
            borderRight: sidebarOpen ? "1px solid" : "0 solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 260,
              boxSizing: "border-box",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Toolbar
              sx={{
                minHeight: 80,
                justifyContent: "center",
                alignItems: "center",
                mt: 1,
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Box
                component={Link}
                to={user?.username ? `/user/${user.username}` : "/myaccount"}
                aria-label={user?.username ? `${user.publicName || user.username} channel page` : "My account"}
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  textDecoration: "none",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 1,
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0, 0, 0, 0.38)",
                    opacity: 0,
                    transition: theme.transitions.create("opacity", {
                      duration: theme.transitions.duration.shortest,
                    }),
                  },
                  "&:hover::after, &:focus-visible::after": {
                    opacity: 1,
                  },
                  "&:hover .avatar-overlay, &:focus-visible .avatar-overlay": {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                }}
              >
                <UserAvatar
                  user={user}
                  size={68}
                  sx={{
                    width: 68,
                    height: 68,
                    fontSize: 26,
                  }}
                />
                <Box
                  className="avatar-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    color: "common.white",
                    opacity: 0,
                    transform: "translateY(4px)",
                    transition: theme.transitions.create(["opacity", "transform"], {
                      duration: theme.transitions.duration.shortest,
                    }),
                    zIndex: 1,
                  }}
                >
                  <OpenInNewIcon fontSize="small" />
                  </Box>
              </Box>
              <Box sx={{ textAlign: "center", mt: 0.25 }}>
                <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 220 }}>
                  {user?.publicName || user?.username || "My channel"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: "block" }}>
                  {user?.username ? `@${user.username}` : "@username"}
                </Typography>
              </Box>
            </Toolbar>
            <Divider />
            <Box sx={{ p: 1.25, overflowY: "auto", flex: 1 }}>
              {NAV_ITEMS.map((item) => (
                <ButtonBase
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1.35,
                    my: 0.45,
                    borderRadius: 2,
                    color: "text.primary",
                    textAlign: "left",
                    bgcolor: currentSection === item.to ? "action.selected" : "transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {item.icon}
                  <Typography variant="body2" fontWeight={700}>
                    {item.label}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, lg: 3 } }}>
            {currentSection === "/dashboard/statistics" ? (
              <DummyStatistics activeMetrics={{ growthText: `${activeMetrics.growthRate >= 0 ? "+" : ""}${activeMetrics.growthRate}% last 7 days`, activeDays: activeMetrics.activeDays, videoCount: activeMetrics.videoCount }} />
            ) : currentSection === "/dashboard/videos" ? (
              <DashboardVideos videos={videos} setVideos={setVideos} />
            ) : currentSection === "/dashboard/settings" ? (
              <DummySettings />
            ) : (
              <DashboardHome
                videos={videos}
                stats={stats}
                chartData={chartData}
                growthRate={activeMetrics.growthRate}
                activeDays={activeMetrics.activeDays}
              />
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
