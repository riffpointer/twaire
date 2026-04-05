import LockIcon from "@mui/icons-material/Lock";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ApiConfig from "../utils/ApiConfig.js";
import { getRelativeTime } from "../utils/DateUtils.js";
import UserAvatar from "../components/UserAvatar.jsx";

const VISIBILITY_MAP = {
  0: { label: "Public", icon: <PublicIcon fontSize="small" /> },
  1: { label: "Unlisted", icon: <LinkIcon fontSize="small" /> },
  2: { label: "Private", icon: <LockIcon fontSize="small" /> },
};

function PlaylistVideoRow({ video, index }) {
  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title || "Video")}`;

  return (
    <Box
      component={Link}
      to={`/watch/${video._id}`}
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        px: 1.5,
        py: 1,
        borderRadius: 1,
        textDecoration: "none",
        color: "inherit",
        transition: "background 0.15s",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
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
        </Box>
      </Box>

      {/* Play button */}
      <Tooltip title="Play">
        <IconButton size="small" component={Link} to={`/watch/${video._id}`} onClick={(e) => e.stopPropagation()}>
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
            <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "16/9", borderRadius: 2, mb: 2 }} />
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

  const bannerThumb = playlist.videos?.find((v) => v.thumbnail)?.thumbnail;
  const bannerUrl = bannerThumb
    ? `${ApiConfig.serverUrl}/data/thumbnails/${bannerThumb}`
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
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 0.75 }}>
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
                {playlist.isDefault && (
                  <Chip
                    label="Default"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                  />
                )}
              </Stack>

              {/* Play all */}
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
            </Box>
          </Card>
        </div>

        {/* Right panel – video list */}
        <div className="col-lg-8">
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, px: 0.5 }}>
            Videos
          </Typography>
          {playlist.videos?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ px: 0.5 }}>
              This playlist has no videos yet.
            </Typography>
          ) : (
            <Stack divider={<Divider />}>
              {playlist.videos.map((video, index) => (
                <PlaylistVideoRow key={video._id} video={video} index={index} />
              ))}
            </Stack>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Playlist;
