import { TabContext, TabList, TabPanel } from '@mui/lab';
import VideoPlayer from './VideoPlayer.jsx';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  FormControl,
  Menu,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { getRelativeTime } from '../utils/DateUtils.js';
import { detectLinkPlatform, ensureAbsoluteUrl } from '../utils/ProfileLinks.js';
import ApiConfig from '../utils/ApiConfig.js';
import UserAvatar from './UserAvatar.jsx';
import VerifiedUserBadge from './VerifiedUserBadge.jsx';
import VideoGrid from './VideoGrid.jsx';
import SubscribeButton from './SubscribeButton.jsx';

const makeBiIcon = (cls) => ({ fontSize, className = "", ...props }) => (
  <Box component="i" className={`${cls}${fontSize === "small" ? " fs-6" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />
);
const DeleteOutlineIcon = makeBiIcon("bi bi-trash");
const ImageIcon = makeBiIcon("bi bi-image");
const EditIcon = makeBiIcon("bi bi-pencil");
const ExpandMoreIcon = makeBiIcon("bi bi-chevron-down");
const FacebookIcon = makeBiIcon("bi bi-facebook");
const ForumIcon = makeBiIcon("bi bi-chat-dots");
const GitHubIcon = makeBiIcon("bi bi-github");
const InstagramIcon = makeBiIcon("bi bi-instagram");
const LanguageIcon = makeBiIcon("bi bi-globe");
const LinkedInIcon = makeBiIcon("bi bi-linkedin");
const LinkIcon = makeBiIcon("bi bi-link-45deg");
const LockIcon = makeBiIcon("bi bi-lock-fill");
const MoreVertIcon = makeBiIcon("bi bi-three-dots-vertical");
const PublicIcon = makeBiIcon("bi bi-globe");
const RedditIcon = makeBiIcon("bi bi-reddit");
const ShareIcon = makeBiIcon("bi bi-share");
const SmartDisplayIcon = makeBiIcon("bi bi-display");
const ViewListIcon = makeBiIcon("bi bi-list");
const ViewModuleIcon = makeBiIcon("bi bi-grid-3x3-gap");
const PlaylistAddIcon = makeBiIcon("bi bi-plus-square");
const XIcon = makeBiIcon("bi bi-twitter-x");

function formatBookmarkTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const wholeSeconds = Math.floor(safeSeconds);
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secs = wholeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function BookmarkVideoThumbnail({ video }) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);

  const safeThumbnail = video?.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video?.title || "Untitled video")}`;

  useEffect(() => {
    setLoaded(false);
  }, [safeThumbnail]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      setLoaded(true);
    }
  }, [safeThumbnail]);

  return (
    <Box sx={{ position: "relative", width: 120, minWidth: 120, aspectRatio: "16 / 9", borderRadius: 1, overflow: "hidden", bgcolor: "action.hover" }}>
      {!loaded && <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0 }} />}
      <Box
        component="img"
        ref={imageRef}
        src={safeThumbnail}
        alt={video?.title || "Video thumbnail"}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 180ms ease-out",
        }}
      />
    </Box>
  );
}

const VISIBILITY_OPTIONS = [
  { value: 0, label: "Public", icon: <PublicIcon fontSize="small" /> },
  { value: 1, label: "Unlisted", icon: <LinkIcon fontSize="small" /> },
  { value: 2, label: "Private", icon: <LockIcon fontSize="small" /> },
];

function PlaylistCard({ pl, onDeleted }) {
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(pl.name);
  const [editDescription, setEditDescription] = useState(pl.description || "");
  const [editVisibility, setEditVisibility] = useState(pl.visibility);
  const [editThumbFile, setEditThumbFile] = useState(null);
  const [editThumbPreview, setEditThumbPreview] = useState(null);
  const [removingThumb, setRemovingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [playlist, setPlaylist] = useState(pl);

  const visLabel = VISIBILITY_OPTIONS.find((o) => o.value === playlist.visibility)?.label ?? "Public";
  const isPrivate = playlist.visibility === 2;
  const shareUrl = `${window.location.origin}/playlist/${playlist._id}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update text fields
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), visibility: editVisibility, description: editDescription }),
      });
      if (res.ok) {
        const updated = await res.json();
        // 2. Upload new thumbnail if selected
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
    setRemovingThumb(true);
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
    } catch { /* silent */ } finally { setRemovingThumb(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDeleteOpen(false);
        onDeleted?.(playlist._id);
      }
    } catch { /* silent */ } finally { setDeleting(false); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(shareUrl);
    setMenuAnchor(null);
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{ position: "relative", cursor: "pointer", "&:hover": { boxShadow: 3 }, transition: "box-shadow 0.2s" }}
        onClick={() => navigate(`/playlist/${playlist._id}`)}
      >
        {/* Thumbnail */}
        <PlaylistThumbnail playlist={playlist} />

        {/* Info */}
        <Box sx={{ p: 1.5, width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>{playlist.name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
              {VISIBILITY_OPTIONS.find((o) => o.value === playlist.visibility)?.icon}
              <Typography variant="caption" color="text.secondary">{visLabel}</Typography>
            </Box>
          </Box>

          {/* 3-dot menu button */}
          <IconButton
            size="small"
            sx={{ mt: -0.25, flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            aria-label="Playlist options"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      {/* 3-dot menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip
          title={isPrivate ? "Make playlist public or unlisted to get a shareable link" : ""}
          placement="left"
        >
          <span>
            <MenuItem
              onClick={handleShare}
              disabled={isPrivate}
              sx={isPrivate ? { opacity: 0.45, cursor: "default" } : {}}
            >
              <ShareIcon fontSize="small" sx={{ mr: 1.5 }} />
              Copy shareable link
            </MenuItem>
          </span>
        </Tooltip>
        <MenuItem onClick={() => { setEditName(playlist.name); setEditDescription(playlist.description || ""); setEditVisibility(playlist.visibility); setEditThumbFile(null); setEditThumbPreview(null); setEditOpen(true); setMenuAnchor(null); }}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit playlist
        </MenuItem>
        {!playlist.isDefault && (
          <MenuItem onClick={() => { setDeleteOpen(true); setMenuAnchor(null); }} sx={{ color: "error.main" }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5 }} />
            Delete playlist
          </MenuItem>
        )}
      </Menu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditThumbFile(null); setEditThumbPreview(null); }} fullWidth maxWidth="sm" onClick={(e) => e.stopPropagation()}>
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
                    disabled={removingThumb}
                    startIcon={<DeleteOutlineIcon />}
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
            autoFocus
            size="small"
            label="Name"
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
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="edit-playlist-vis-label">Visibility</InputLabel>
            <Select
              labelId="edit-playlist-vis-label"
              label="Visibility"
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
              renderValue={(v) => {
                const opt = VISIBILITY_OPTIONS.find((o) => o.value === v);
                return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt?.icon}{opt?.label}</Box>;
              }}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt.icon}{opt.label}</Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditOpen(false); setEditThumbFile(null); setEditThumbPreview(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!editName.trim() || saving} startIcon={saving ? <CircularProgress size={14} /> : null}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs" onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Delete "{playlist.name}"?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently delete the playlist. Videos won't be affected.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={14} /> : null}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function SubscriptionCard({ subscription, currentUser, viewMode = "grid" }) {
  const [subscribed, setSubscribed] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser._id === subscription._id) return;
    
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/${subscription._id}/isSubscribed`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSubscribed(data.subscribed);
        }
      } catch {}
    };
    fetchStatus();
  }, [subscription._id, currentUser]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;
    if (currentUser._id === subscription._id) return;

    setSubLoading(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/${subscription._id}/subscribe`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribed(data.subscribed);
      }
    } catch {} finally {
      setSubLoading(false);
    }
  };

  const content = (
    <>
      <UserAvatar user={subscription} size={viewMode === "grid" ? 52 : 44} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {subscription.publicName}
          </Box>
          <VerifiedUserBadge user={subscription} />
        </Typography>
        {viewMode === "grid" ? (
          <>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{subscription.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subscription.subscribers || 0} subscriber{subscription.subscribers === 1 ? "" : "s"}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" noWrap>
            @{subscription.username} &bull; {subscription.subscribers || 0} subscriber{subscription.subscribers === 1 ? "" : "s"}
          </Typography>
        )}
      </Box>
      {currentUser && currentUser._id !== subscription._id && (
        <Box sx={{ ml: "auto", flexShrink: 0 }}>
          <SubscribeButton
            subscribed={subscribed}
            subLoading={subLoading}
            handleSubscribe={handleToggle}
          />
        </Box>
      )}
    </>
  );

  return (
    <Card variant="outlined" sx={{ width: "100%", transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 1 } }}>
      <CardActionArea
        component={Link}
        to={`/user/${subscription.username}`}
        sx={{
          p: viewMode === "grid" ? 2 : 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "left",
          gap: 1.5,
        }}
      >
        {content}
      </CardActionArea>
    </Card>
  );
}

function PlaylistThumbnail({ playlist }) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef(null);

  // Prefer custom thumbnail, then first video thumbnail, then placeholder
  const thumbUrl = playlist.thumbnail
    ? `${ApiConfig.serverUrl}/data/playlist_thumbnails/${playlist.thumbnail}`
    : playlist.videos?.length > 0 && playlist.videos[0]?.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${playlist.videos[0].thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(playlist.name)}`;

  useEffect(() => {
    setLoaded(false);
  }, [thumbUrl]);

  useEffect(() => {
    if (imageRef.current?.complete) {
      setLoaded(true);
    }
  }, [thumbUrl]);

  return (
    <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", bgcolor: "action.hover" }}>
       {!loaded && <Skeleton variant="rectangular" width="100%" height="100%" sx={{ position: "absolute", inset: 0 }} />}
       <Box
         component="img"
         ref={imageRef}
         src={thumbUrl}
         alt={playlist.name}
         onLoad={() => setLoaded(true)}
         onError={() => setLoaded(true)}
         sx={{
           width: "100%",
           height: "100%",
           objectFit: "cover",
           opacity: loaded ? 1 : 0,
           transition: "opacity 180ms ease-out",
         }}
       />
       <Box sx={{ position: "absolute", bottom: 8, right: 8, px: 1, py: 0.25, bgcolor: "rgba(0,0,0,0.8)", color: "#fff", borderRadius: 1, fontSize: "0.75rem", fontWeight: "bold" }}>
         {playlist.videos?.length || 0} video{playlist.videos?.length === 1 ? "" : "s"}
       </Box>
    </Box>
  );
}

function UserTabs({ user, videos, subscriptions = [], playlists = [], showBookmarksTab = false, bookmarkedVideos = [], videoVisibility, onVideoVisibilityChange, currentUser, onPlaylistCreated, onPlaylistDeleted, subscribed = false }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [sort, setSort] = useState("relevance");
  const [subscriptionsSort, setSubscriptionsSort] = useState("recent");
  const [subscriptionsView, setSubscriptionsView] = useState("grid");
  const [playlistsSort, setPlaylistsSort] = useState("default");
  
  const [newPlOpen, setNewPlOpen] = useState(false);
  const [newPlName, setNewPlName] = useState("");
  const [newPlDescription, setNewPlDescription] = useState("");
  const [newPlVisibility, setNewPlVisibility] = useState(2);
  const [newPlThumbFile, setNewPlThumbFile] = useState(null);
  const [newPlThumbPreview, setNewPlThumbPreview] = useState(null);
  const [creatingPl, setCreatingPl] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };

  const isOwnTab = currentUser?._id === user?._id;

  const handleCreatePlaylist = async () => {
    if (!newPlName.trim()) return;
    setCreatingPl(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlName.trim(), visibility: newPlVisibility, description: newPlDescription }),
      });
      if (res.ok) {
        const pl = await res.json();
        // Upload thumbnail if one was selected
        if (newPlThumbFile) {
          const fd = new FormData();
          fd.append("thumbnail", newPlThumbFile);
          const thumbRes = await fetch(`${ApiConfig.serverUrl}/api/playlists/${pl._id}/thumbnail`, {
            method: "POST",
            credentials: "include",
            body: fd,
          });
          if (thumbRes.ok) {
            const thumbData = await thumbRes.json();
            pl.thumbnail = thumbData.thumbnail;
          }
        }
        onPlaylistCreated?.(pl);
        setNewPlOpen(false);
        setNewPlName("");
        setNewPlDescription("");
        setNewPlVisibility(2);
        setNewPlThumbFile(null);
        setNewPlThumbPreview(null);
      }
    } catch {} finally {
      setCreatingPl(false);
    }
  };

  const sortedPlaylists = [...playlists].sort((a, b) => {
    if (playlistsSort === "default") {
      return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
    }
    if (playlistsSort === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    if (playlistsSort === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (playlistsSort === "videos") {
      return (b.videos?.length || 0) - (a.videos?.length || 0);
    }
    return 0;
  });

  const getLinkIcon = (url) => {
    const platform = detectLinkPlatform(url);
    if (platform === "youtube") return <SmartDisplayIcon fontSize="small" />;
    if (platform === "github") return <GitHubIcon fontSize="small" />;
    if (platform === "x") return <XIcon fontSize="small" />;
    if (platform === "instagram") return <InstagramIcon fontSize="small" />;
    if (platform === "linkedin") return <LinkedInIcon fontSize="small" />;
    if (platform === "facebook") return <FacebookIcon fontSize="small" />;
    if (platform === "reddit") return <RedditIcon fontSize="small" />;
    if (platform === "discord" || platform === "twitch") return <ForumIcon fontSize="small" />;
    return <LanguageIcon fontSize="small" />;
  };

  const userCreationDate = new Date(user.createdAt);
  const localUserCreationDate = userCreationDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const sortedSubscriptions = [...subscriptions].sort((left, right) => {
    if (subscriptionsSort === "subscribers") {
      return (right.subscribers || 0) - (left.subscribers || 0);
    }

    return 0;
  });
  const trailerVideo = user?.trailerVideo && typeof user.trailerVideo === "object" ? user.trailerVideo : null;
  const trailerVideoId = trailerVideo?._id || user?.trailerVideo;
  const trailerVideoSrc = trailerVideo?.filename
    ? `${ApiConfig.serverUrl}/data/uploads/${trailerVideo.filename}`
    : trailerVideoId
      ? `${ApiConfig.serverUrl}/api/videos/${trailerVideoId}`
      : null;

  return (
    <Paper elevation={2} sx={{ p: 2, pt: 1, mt: 1, mb: 2 }}>
      <TabContext value={selectedTabIndex.toString()}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 0 }}>
          <TabList onChange={handleTabChange} aria-label="channel info tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="Home" value="0" />
            <Tab label="Videos" value="1" />
            <Tab label="Playlists" value="4" />
            <Tab label="Subscriptions" value="2" />
            {showBookmarksTab && <Tab label="Bookmarks" value="3" />}
            <Tab label="About" value="5" />
          </TabList>
        </Box>

        <TabPanel value="0" sx={{ p: 0, m: 0, mt: 2 }}>
          {trailerVideoSrc && !subscribed ? (
            <Box
              mb={4}
              sx={{
                maxWidth: 720,
                mx: "auto",
              }}
            >
              <Typography variant="overline" sx={{ display: "block", mb: 1, color: "text.secondary", letterSpacing: 1.2 }}>
                Featured video
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" }, gap: 2.5, alignItems: "center" }}>
                <Box sx={{ order: { xs: 2, md: 1 } }}>
                  <Typography
                    variant="h5"
                    component={Link}
                    to={`/watch/${trailerVideoId}`}
                    sx={{
                      fontWeight: "bold",
                      mb: 1.25,
                      display: "block",
                      textDecoration: "none",
                      color: "text.primary",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {trailerVideo?.title || "Featured trailer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: "medium" }}>
                    {trailerVideo?.views?.toLocaleString() || 0} views &bull; Uploaded {trailerVideo?.uploadedAt ? new Date(trailerVideo.uploadedAt).toLocaleDateString() : "Unknown"} ({getRelativeTime(trailerVideo?.uploadedAt)})
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      display: "-webkit-box",
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.6,
                    }}
                  >
                    {trailerVideo?.description || "No description."}
                  </Typography>
                </Box>
                <VideoPlayer
                  src={trailerVideoSrc}
                  autoPlay={true}
                  videoElementId="channel-trailer-player"
                  sx={{
                    order: { xs: 1, md: 2 },
                    width: "100%",
                    aspectRatio: "16 / 9",
                    height: "auto",
                    minHeight: 202,
                    borderRadius: 3,
                  }}
                />
              </Box>
              <Box sx={{ borderBottom: 1, borderColor: "divider", my: 4 }} />
            </Box>
          ) : (
            <Box sx={{ mb: 4, textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No featured content.
              </Typography>
            </Box>
          )}

          {videos.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Latest Uploads
              </Typography>
              <VideoGrid videos={videos.slice(0, 8)} />
              {videos.length > 8 && (
                <Box mt={3} display="flex" justifyContent="center">
                  <Button
                    onClick={() => setSelectedTabIndex(1)}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: "none", px: 4 }}
                  >
                    View All Videos
                  </Button>
                </Box>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel value="1" sx={{ p: 0, m: 0, mt: 2 }}>
          {(videos.length === 0 && !videoVisibility) ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              This user has not uploaded any videos yet.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 1, mb: 2 }}>
                <TextField
                  select
                  size="small"
                  label="Sort by..."
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  variant="outlined"
                  sx={{ width: "auto", minWidth: 160 }}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="date">Upload date (Newest first)</MenuItem>
                  <MenuItem value="views">Most viewed</MenuItem>
                </TextField>
                {onVideoVisibilityChange && (
                  <TextField
                    select
                    size="small"
                    label="Visibility"
                    value={videoVisibility ?? "all"}
                    onChange={(e) => onVideoVisibilityChange(e.target.value)}
                    variant="outlined"
                    sx={{ width: "auto", minWidth: 150 }}
                  >
                    <MenuItem value="all">All videos</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="unlisted">Unlisted</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </TextField>
                )}
              </Box>
              {videos.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No videos match this filter.
                </Typography>
              ) : (
                <VideoGrid videos={videos} />
              )}
            </>
          )}
        </TabPanel>

        <TabPanel value="5" sx={{ p: 1, mt: 1 }}>
          <Box mb={2}>
            <Typography variant="h6">About this channel</Typography>
            <Typography component="div" variant="body2">
              {user.bio || (
                <Box component="i" sx={{ color: 'text.secondary' }}>
                  No bio.
                </Box>
              )}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="h6">More links</Typography>
            {Array.isArray(user.links) && user.links.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {user.links.map((link, index) => (
                  <Button
                    key={`channel-link-${index}`}
                    variant="outlined"
                    size="small"
                    component="a"
                    href={ensureAbsoluteUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={getLinkIcon(link.url)}
                    sx={{ borderRadius: 999, textTransform: "none" }}
                  >
                    {link.title}
                  </Button>
                ))}
              </Box>
            ) : (
              <Box component="i" sx={{ color: 'text.secondary' }}>
                No links.
              </Box>
            )}
          </Box>
          <Box>
            <small>
              <Box component="i" sx={{ color: 'text.secondary' }}>
                Account created at {user.createdAt ? localUserCreationDate : "unknown date"} ({getRelativeTime(user.createdAt) || "unknown days ago"}).
              </Box>
            </small>
          </Box>
        </TabPanel>

        <TabPanel value="4" sx={{ p: 0, m: 0, mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 1, mb: 2 }}>
            <TextField
              select
              size="small"
              label="Sort by..."
              value={playlistsSort}
              onChange={(e) => setPlaylistsSort(e.target.value)}
              variant="outlined"
              sx={{ width: "auto", minWidth: 160 }}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="newest">Newest created</MenuItem>
              <MenuItem value="alphabetical">Alphabetical (A-Z)</MenuItem>
              <MenuItem value="videos">Most videos</MenuItem>
            </TextField>

            {isOwnTab && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlaylistAddIcon />}
                onClick={() => setNewPlOpen(true)}
                sx={{ ml: { sm: "auto" }, height: 40 }}
              >
                New playlist
              </Button>
            )}
          </Box>

          {playlists.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              This user has no playlists.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))"
                },
              }}
            >
              {sortedPlaylists.map((pl) => (
                <PlaylistCard
                  key={pl._id}
                  pl={pl}
                  onDeleted={(deletedId) => onPlaylistDeleted?.(deletedId)}
                />
              ))}
            </Box>
          )}

          {/* New Playlist Dialog */}
          <Dialog
            open={newPlOpen}
            onClose={() => { setNewPlOpen(false); setNewPlThumbFile(null); setNewPlThumbPreview(null); }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Create new playlist</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>

              {/* Thumbnail – banner style */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>Thumbnail</Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    bgcolor: "grey.200",
                    backgroundImage: newPlThumbPreview
                      ? "none"
                      : "repeating-linear-gradient(-45deg, rgba(255,255,255,0.18) 0 14px, rgba(0,0,0,0.04) 14px 28px)",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {newPlThumbPreview && (
                    <Box
                      component="img"
                      src={newPlThumbPreview}
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
                            setNewPlThumbFile(file);
                            setNewPlThumbPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </Button>
                    {newPlThumbFile && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        sx={{ color: "white" }}
                        onClick={() => { setNewPlThumbFile(null); setNewPlThumbPreview(null); }}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <TextField
                autoFocus
                size="small"
                label="Name"
                placeholder="Ex: Coding study"
                value={newPlName}
                onChange={(e) => setNewPlName(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="Description"
                value={newPlDescription}
                onChange={(e) => setNewPlDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                maxRows={5}
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="new-playlist-vis-label">Visibility</InputLabel>
                <Select
                  labelId="new-playlist-vis-label"
                  label="Visibility"
                  value={newPlVisibility}
                  onChange={(e) => setNewPlVisibility(e.target.value)}
                  renderValue={(v) => {
                    const opt = VISIBILITY_OPTIONS.find((o) => o.value === v);
                    return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt?.icon}{opt?.label}</Box>;
                  }}
                >
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt.icon}{opt.label}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setNewPlOpen(false); setNewPlThumbFile(null); setNewPlThumbPreview(null); }}>Cancel</Button>
              <Button variant="contained" onClick={handleCreatePlaylist} disabled={!newPlName.trim() || creatingPl} startIcon={creatingPl ? <CircularProgress size={14} /> : null}>
                Create
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        <TabPanel value="2" sx={{ p: 0, m: 0, mt: 2 }}>
          {subscriptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              This user has not subscribed to any channels yet.
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Sort by:
                </Typography>
                <Tooltip title="Newest subscriptions first">
                  <Button
                    size="small"
                    variant={subscriptionsSort === "recent" ? "contained" : "outlined"}
                    onClick={() => setSubscriptionsSort("recent")}
                    sx={{ borderRadius: 999 }}
                  >
                    Subscription time
                  </Button>
                </Tooltip>
                <Tooltip title="Channels with the most subscribers first">
                  <Button
                    size="small"
                    variant={subscriptionsSort === "subscribers" ? "contained" : "outlined"}
                    onClick={() => setSubscriptionsSort("subscribers")}
                    sx={{ borderRadius: 999 }}
                  >
                    Subscribers
                  </Button>
                </Tooltip>
                <Box sx={{ ml: { xs: 0, sm: "auto" }, display: "flex", gap: 1 }}>
                  <Tooltip title="Show channels in a grid">
                    <Button
                      size="small"
                      startIcon={<ViewModuleIcon fontSize="small" />}
                      variant={subscriptionsView === "grid" ? "contained" : "outlined"}
                      onClick={() => setSubscriptionsView("grid")}
                      sx={{ borderRadius: 999 }}
                    >
                      Grid
                    </Button>
                  </Tooltip>
                  <Tooltip title="Show channels in a list">
                    <Button
                      size="small"
                      startIcon={<ViewListIcon fontSize="small" />}
                      variant={subscriptionsView === "list" ? "contained" : "outlined"}
                      onClick={() => setSubscriptionsView("list")}
                      sx={{ borderRadius: 999 }}
                    >
                      List
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              {subscriptionsView === "grid" ? (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      md: "repeat(3, minmax(0, 1fr))",
                    },
                    justifyItems: "start",
                  }}
                >
                  {sortedSubscriptions.map((subscription) => (
                    <Box key={subscription._id} sx={{ width: "100%", maxWidth: 360 }}>
                      <SubscriptionCard
                        subscription={subscription}
                        currentUser={currentUser}
                        viewMode="grid"
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {sortedSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription._id}
                      subscription={subscription}
                      currentUser={currentUser}
                      viewMode="list"
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </TabPanel>

        {showBookmarksTab && (
          <TabPanel value="3" sx={{ p: 0, m: 0, mt: 2 }}>
            {bookmarkedVideos.length === 0 ? (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No bookmarks saved yet.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {bookmarkedVideos.map((group) => (
                  <Accordion key={group.video?._id} disableGutters>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`bookmarks-panel-${group.video?._id}`}
                      id={`bookmarks-header-${group.video?._id}`}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, width: "100%" }}>
                        <BookmarkVideoThumbnail video={group.video} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {group.video?.title || "Untitled video"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {group.bookmarks?.length || 0} bookmark{(group.bookmarks?.length || 0) === 1 ? "" : "s"}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {(group.bookmarks || []).map((bookmark) => (
                          <Card key={bookmark._id} variant="outlined" sx={{ p: 1.25 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Chip label={formatBookmarkTime(bookmark.timestampSeconds)} size="small" color="primary" variant="outlined" />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {bookmark.note}
                              </Typography>
                              <Button
                                size="small"
                                component={Link}
                                to={`/watch/${group.video?._id}?t=${Math.floor(Number(bookmark.timestampSeconds) || 0)}`}
                                sx={{ ml: "auto" }}
                              >
                                Open
                              </Button>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </TabPanel>
        )}
      </TabContext>
    </Paper>
  );
}

export default UserTabs;
