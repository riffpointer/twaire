import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ApiConfig from "../utils/ApiConfig.js";
import { getRelativeTime } from "../utils/DateUtils.js";
import UserAvatar from "../components/UserAvatar.jsx";

const makeBiIcon = (cls) => ({ fontSize, className = "", ...props }) => (
  <Box component="i" className={`${cls}${fontSize === "small" ? " fs-6" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />
);
const LockIcon = makeBiIcon("bi bi-lock-fill");
const LinkIcon = makeBiIcon("bi bi-link-45deg");
const PublicIcon = makeBiIcon("bi bi-globe");
const PlayArrowIcon = makeBiIcon("bi bi-play-fill");
const QueueMusicIcon = makeBiIcon("bi bi-music-note-list");
const SentimentDissatisfiedIcon = makeBiIcon("bi bi-emoji-frown");
const EditIcon = makeBiIcon("bi bi-pencil");
const DeleteIcon = makeBiIcon("bi bi-trash");
const ImageIcon = makeBiIcon("bi bi-image");
const CalendarTodayIcon = makeBiIcon("bi bi-calendar-event-fill");
const SortIcon = makeBiIcon("bi bi-sort-down");
const DragIndicatorIcon = makeBiIcon("bi bi-grip-vertical");

const VISIBILITY_MAP = {
  0: { label: "Public", icon: <PublicIcon fontSize="small" /> },
  1: { label: "Unlisted", icon: <LinkIcon fontSize="small" /> },
  2: { label: "Private", icon: <LockIcon fontSize="small" /> },
};

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return null;
  const s = Math.floor(Number(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function PlaylistVideoRow({
  video,
  index,
  isReorderable,
  isDragging,
  dragOverIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}) {
  const navigate = useNavigate();
  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title || "Video")}`;

  return (
    <Box
      draggable={isReorderable}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()} // necessary to allow dropping
      onDrop={(e) => onDrop && onDrop(e, index)}
      onClick={() => navigate(`/watch/${video._id}`)}
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        px: 1.5,
        py: 1,
        borderRadius: 1,
        textDecoration: "none",
        color: "inherit",
        cursor: isReorderable ? "grab" : "pointer",
        transition: "background 0.15s",
        bgcolor: isDragging ? "action.selected" : "transparent",
        opacity: isDragging ? 0.5 : 1,
        borderTop: dragOverIndex === index && dragOverIndex !== null ? "2px solid" : "2px solid transparent",
        borderTopColor: dragOverIndex === index && dragOverIndex !== null ? "primary.main" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {isReorderable && (
        <DragIndicatorIcon sx={{ color: "text.disabled", cursor: "grab", mr: -1 }} />
      )}
      {/* Index number */}
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign: "right", flexShrink: 0 }}>
        {index + 1}
      </Typography>

      {/* Thumbnail */}
      <Box
        component="img"
        src={safeThumbnail}
        alt={video.title}
        sx={{ width: 120, height: 68, objectFit: "cover", borderRadius: 1, flexShrink: 0, bgcolor: "action.hover" }}
        loading="lazy"
      />

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.25 }}>
          {video.title || "Untitled video"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", flexWrap: "wrap" }}>
          {video.uploader?.publicName && (
            <Typography variant="caption" noWrap>
              {video.uploader.publicName}
            </Typography>
          )}
          {video.views !== undefined && (
            <Typography variant="caption" noWrap>
              · {video.views} view{video.views === 1 ? "" : "s"}
            </Typography>
          )}
          {video.uploadedAt && (
            <Typography variant="caption" noWrap>
              · {getRelativeTime(video.uploadedAt)}
            </Typography>
          )}
          {formatDuration(video.duration) && (
            <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: "text.primary" }}>
              · {formatDuration(video.duration)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Play button */}
      <Tooltip title="Play">
        <IconButton
          size="small"
          aria-label="Play"
          onClick={(e) => { e.stopPropagation(); navigate(`/watch/${video._id}`); }}
        >
          <PlayArrowIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function Playlist() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVisibility, setEditVisibility] = useState(0);
  const [editThumbFile, setEditThumbFile] = useState(null);
  const [editThumbPreview, setEditThumbPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [videoSort, setVideoSort] = useState("default");
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    fetch(`${ApiConfig.serverUrl}/api/users/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCurrentUser(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`${ApiConfig.serverUrl}/api/playlists/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPlaylist(data);
          setEditName(data.name);
          setEditDescription(data.description || "");
          setEditVisibility(data.visibility);
          document.title = `${data.name} – Twaire`;
        }
      })
      .catch(() => setError("Failed to load playlist"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mb: 6, mt: 2 }}>
        <div className="row">
          <div className="col-lg-4 mb-4">
            <Skeleton variant="rectangular" width="100%" height="auto" sx={{ aspectRatio: "16/9", borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={24} />
          </div>
          <div className="col-lg-8">
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 1.5, px: 1.5 }}>
                <Skeleton variant="rectangular" width={120} height={68} sx={{ borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="50%" />
                </Box>
              </Box>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (error || !playlist) {
    return (
      <Container sx={{ mb: 6, mt: 4 }}>
        <Card elevation={1} sx={{ p: { xs: 3, sm: 4 }, textAlign: "center", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.25, color: "text.secondary", mb: 2 }}>
            <QueueMusicIcon sx={{ fontSize: 34 }} />
            <SentimentDissatisfiedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Typography variant="h5" gutterBottom>Playlist unavailable</Typography>
          <Typography color="text.secondary">{error || "This playlist could not be loaded."}</Typography>
        </Card>
      </Container>
    );
  }

  const visibility = VISIBILITY_MAP[playlist.visibility] ?? VISIBILITY_MAP[0];
  const firstVideoId = playlist.videos?.[0]?._id;
  const isOwner = currentUser && playlist.owner?._id === currentUser._id;

  const sortedVideos = [...(playlist.videos || [])].sort((a, b) => {
    if (videoSort === "shortest") return (a.duration ?? Infinity) - (b.duration ?? Infinity);
    if (videoSort === "longest") return (b.duration ?? -1) - (a.duration ?? -1);
    return 0;
  });

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    // Needed for Firefox
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragEnter = (e, index) => {
    if (dragIndex !== null && index !== dragIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      handleDragEnd();
      return;
    }

    const newVideos = [...playlist.videos];
    const [movedElement] = newVideos.splice(dragIndex, 1);
    newVideos.splice(index, 0, movedElement);

    // Optimistic UI update
    setPlaylist((prev) => ({ ...prev, videos: newVideos }));
    handleDragEnd();

    try {
      await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoIds: newVideos.map((v) => v._id) }),
      });
    } catch {
      // Could handle revert here if needed
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), visibility: editVisibility, description: editDescription }),
      });
      if (res.ok) {
        const updated = await res.json();
        // Upload new thumbnail if selected
        if (editThumbFile) {
          const fd = new FormData();
          fd.append("thumbnail", editThumbFile);
          const thumbRes = await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}/thumbnail`, {
            method: "POST",
            credentials: "include",
            body: fd,
          });
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            updated.thumbnail = thumbData.thumbnail;
          }
        }
        setPlaylist((prev) => ({ ...prev, name: updated.name, visibility: updated.visibility, description: updated.description, thumbnail: updated.thumbnail }));
        setEditThumbFile(null);
        setEditThumbPreview(null);
        setEditOpen(false);
      }
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const handleRemoveThumbnail = async () => {
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}/thumbnail`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPlaylist((prev) => ({ ...prev, thumbnail: "" }));
        setEditThumbPreview(null);
        setEditThumbFile(null);
      }
    } catch { /* silent */ }
  };

  // Prefer custom thumbnail, then first video thumbnail, then placeholder
  const bannerUrl = playlist.thumbnail
    ? `${ApiConfig.serverUrl}/data/playlist_thumbnails/${playlist.thumbnail}`
    : playlist.videos?.find((v) => v.thumbnail)?.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${playlist.videos.find((v) => v.thumbnail).thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(playlist.name)}`;

  return (
    <Container sx={{ mb: 6, mt: 2 }}>
      <div className="row">
        {/* Left panel – playlist info */}
        <div className="col-lg-4 mb-4">
          <Card
            elevation={4}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)"
                  : "linear-gradient(160deg, #6750A4 0%, #9c7bca 100%)",
              color: "#fff",
            }}
          >
            {/* Thumbnail / cover */}
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
              <Box
                component="img"
                src={bannerUrl}
                alt={playlist.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
                }}
              />
            </Box>

            {/* Info block */}
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, color: "#fff" }}>
                {playlist.name}
              </Typography>

              {/* Owner */}
              {playlist.owner && (
                <Box
                  component={Link}
                  to={`/user/${playlist.owner.username}`}
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, textDecoration: "none" }}
                >
                  <UserAvatar user={playlist.owner} size={26} />
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                    {playlist.owner.publicName || playlist.owner.username}
                  </Typography>
                </Box>
              )}

              {/* Meta chips */}
              <Stack direction="row" spacing={0.75} sx={{ mb: playlist.description ? 1.5 : 2, overflowX: "auto", pb: 0.5 }}>
                <Chip
                  icon={<Box sx={{ display: "flex", color: "#fff !important" }}>{visibility.icon}</Box>}
                  label={visibility.label}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", "& .MuiChip-icon": { color: "#fff" } }}
                />
                <Chip
                  label={`${playlist.videos?.length || 0} video${playlist.videos?.length === 1 ? "" : "s"}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                />
                {playlist.createdAt && (
                  <Chip
                    icon={<CalendarTodayIcon sx={{ fontSize: "0.8rem", color: "#fff !important" }} />}
                    label={`Created ${new Date(playlist.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`}
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", "& .MuiChip-icon": { color: "#fff" } }}
                  />
                )}
              </Stack>

              {/* Description */}
              {playlist.description && (
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.78)", mb: 2, lineHeight: 1.6, whiteSpace: "pre-wrap" }}
                >
                  {playlist.description}
                </Typography>
              )}

              {/* Buttons */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {firstVideoId && (
                  <Box
                    component={Link}
                    to={`/watch/${firstVideoId}`}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      bgcolor: "rgba(255,255,255,0.22)",
                      color: "#fff",
                      px: 2,
                      py: 0.75,
                      borderRadius: 999,
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.32)" },
                    }}
                  >
                    <PlayArrowIcon fontSize="small" />
                    Play all
                  </Box>
                )}
                {isOwner && (
                  <Box
                    component="button"
                    onClick={() => setEditOpen(true)}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      bgcolor: "rgba(255,255,255,0.12)",
                      border: "none",
                      color: "#fff",
                      px: 2,
                      py: 0.75,
                      borderRadius: 999,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                    }}
                  >
                    <EditIcon sx={{ fontSize: "1.1rem" }} />
                    Edit
                  </Box>
                )}
              </Box>
            </Box>
          </Card>
        </div>

        {/* Right panel – video list */}
        <div className="col-lg-8">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, px: 0.5, flexWrap: "wrap" }}>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              Videos
            </Typography>
            {(playlist.videos?.length ?? 0) > 1 && (
              <TextField
                select
                size="small"
                label="Sort by"
                value={videoSort}
                onChange={(e) => setVideoSort(e.target.value)}
                variant="outlined"
                sx={{ minWidth: 170 }}
                InputProps={{ startAdornment: <SortIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} /> }}
              >
                <MenuItem value="default">Default order</MenuItem>
                <MenuItem value="shortest">Shortest first</MenuItem>
                <MenuItem value="longest">Longest first</MenuItem>
              </TextField>
            )}
          </Box>
          {playlist.videos?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ px: 0.5 }}>
              This playlist has no videos yet.
            </Typography>
          ) : (
            <Stack divider={<Divider />}>
              {sortedVideos.map((video, index) => (
                <PlaylistVideoRow
                  key={video._id}
                  video={video}
                  index={index}
                  isReorderable={isOwner && videoSort === "default"}
                  isDragging={dragIndex === index}
                  dragOverIndex={dragOverIndex}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
              ))}
            </Stack>
          )}
        </div>
      </div>

      {/* Edit Playlist Dialog */}
      {playlist && (
        <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditThumbFile(null); setEditThumbPreview(null); }} fullWidth maxWidth="sm">
          <DialogTitle>Edit playlist</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>

            {/* Thumbnail Upload Section – banner style */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>Thumbnail</Typography>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  bgcolor: "grey.200",
                  backgroundImage: (editThumbPreview || playlist.thumbnail)
                    ? "none"
                    : "repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 14px, rgba(0,0,0,0.04) 14px 28px)",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {/* Current thumbnail image – only shown when a custom one exists */}
                {(editThumbPreview || playlist.thumbnail) && (
                  <Box
                    component="img"
                    src={
                      editThumbPreview
                        ? editThumbPreview
                        : `${ApiConfig.serverUrl}/data/playlist_thumbnails/${playlist.thumbnail}`
                    }
                    alt="Thumbnail preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                )}
                {/* Hover overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0, left: 0, width: "100%", height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    bgcolor: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<ImageIcon />}
                    sx={{ color: "white", bgcolor: "rgba(0,0,0,0.55)", "&:hover": { bgcolor: "rgba(0,0,0,0.75)" } }}
                  >
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditThumbFile(file);
                          setEditThumbPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </Button>
                  {(playlist.thumbnail || editThumbFile) && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ color: "white" }}
                      onClick={() => {
                        if (editThumbFile) {
                          setEditThumbFile(null);
                          setEditThumbPreview(null);
                        } else {
                          handleRemoveThumbnail();
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            <TextField
              size="small"
              label="Playlist Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={playlist.isDefault}
              fullWidth
            />

            <TextField
              size="small"
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              placeholder="Add a description..."
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="playlist-vis-label">Visibility</InputLabel>
              <Select
                labelId="playlist-vis-label"
                label="Visibility"
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
                renderValue={(v) => {
                  const opt = VISIBILITY_MAP[v];
                  return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt?.icon}{opt?.label}</Box>;
                }}
              >
                {Object.entries(VISIBILITY_MAP).map(([val, opt]) => (
                  <MenuItem key={val} value={Number(val)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt.icon}{opt.label}</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditOpen(false); setEditThumbFile(null); setEditThumbPreview(null); }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!editName.trim() || saving}
              startIcon={saving ? <CircularProgress size={14} /> : null}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}

export default Playlist;
