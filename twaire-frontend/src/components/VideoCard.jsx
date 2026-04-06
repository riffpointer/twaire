import { getRelativeTime } from "../utils/DateUtils.js";
import ApiConfig from "../utils/ApiConfig.js";
import { Alert, Box, Button, Card, CardActionArea, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, Skeleton, Snackbar, TextField, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import { useQueue } from "../contexts/QueueContext.jsx";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog.jsx";


function VideoCard({ video, sx={} }) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccessOpen, setReportSuccessOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const thumbnailRef = useRef(null);
  const menuOpen = Boolean(menuAnchorEl);
  const { addToQueue } = useQueue();

  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title)}`;

  useEffect(() => {
    setThumbnailLoaded(false);
  }, [safeThumbnail]);

  useEffect(() => {
    // Cached images may already be complete before onLoad fires in some navigation paths.
    if (thumbnailRef.current?.complete) {
      setThumbnailLoaded(true);
    }
  }, [safeThumbnail]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, { credentials: "include" });
        if (res.ok) setCurrentUser(await res.json());
      } catch { /* not logged in */ }
    };
    fetchCurrentUser();
  }, []);

  // Format uploaded date
  //   const formattedDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "";

  const uploadedAtFormatted = getRelativeTime(video.uploadedAt);

  const handleOpenMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchorEl(null);

  const handleAddToQueue = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToQueue(video);
    handleCloseMenu();
  };

  const handleReport = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setReportDialogOpen(true);
    handleCloseMenu();
  };

  const handleSaveToPlaylist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSaveDialogOpen(true);
    handleCloseMenu();
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setReportReason("spam");
    setReportDetails("");
  };

  return (
    <Card
      elevation={3}
      sx={{
        userSelect: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minWidth: 200,
        position: "relative",
        ...sx,
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", height: "100%", cursor: "pointer" }}
      >
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9", flexGrow: 1 }}>
          {!thumbnailLoaded && (
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
          <Box
            component="img"
            ref={thumbnailRef}
            src={safeThumbnail}
            alt={video.title}
            loading="lazy"
            onLoad={() => setThumbnailLoaded(true)}
            onError={() => setThumbnailLoaded(true)}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: thumbnailLoaded ? 1 : 0,
              transition: "opacity 180ms ease-out",
            }}
          />
        </Box>

        <CardContent sx={{ p: 1.5, pt: 1, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, mb: 0.5 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{ flex: 1, minWidth: 0, fontWeight: 500 }}
              title={video.description || ""}
            >
              {video.title}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenMenu(e);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                aria-label="Video actions"
                sx={{ color: "text.secondary", mt: -0.5, mr: -1 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <MenuItem onClick={handleAddToQueue}>
                  <QueuePlayNextIcon fontSize="small" style={{ marginRight: 8 }} />
                  Add to queue
                </MenuItem>
                <MenuItem onClick={handleSaveToPlaylist}>
                  <PlaylistAddIcon fontSize="small" style={{ marginRight: 8 }} />
                  Save to playlist
                </MenuItem>
                <MenuItem onClick={handleReport} sx={{ color: "warning.main" }}>
                  <FlagOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />
                  Report
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            <UserAvatar user={video.uploader} size={24} />
            <Typography
              variant="body2"
              noWrap
              sx={{ fontSize: "inherit", color: "inherit" }}
            >
              {video.uploader.publicName}
            </Typography>

            {video.uploader.verified && (
              <CheckCircleIcon sx={{ fontSize: 14, color: "primary.main" }} />
            )}

            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              • {video.views} views
            </Box>

            {uploadedAtFormatted && (
              <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                • {uploadedAtFormatted}
              </Box>
            )}
          </Box>
        </CardContent>
      </Box>

      <Dialog open={reportDialogOpen} onClose={handleCloseReportDialog} fullWidth maxWidth="sm">
        <DialogTitle>Report video</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Tell us why you are reporting this video. This currently opens a local reporting flow only.
          </DialogContentText>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="video-report-reason-label">Reason</InputLabel>
            <Select
              labelId="video-report-reason-label"
              label="Reason"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              <MenuItem value="spam">Spam or misleading</MenuItem>
              <MenuItem value="harassment">Harassment or bullying</MenuItem>
              <MenuItem value="hate">Hateful or abusive</MenuItem>
              <MenuItem value="sexual">Sexual or inappropriate</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Additional details"
            value={reportDetails}
            onChange={(event) => setReportDetails(event.target.value)}
            placeholder="Optional context"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              handleCloseReportDialog();
              setReportSuccessOpen(true);
            }}
          >
            Submit report
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={reportSuccessOpen}
        autoHideDuration={2200}
        onClose={() => setReportSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={() => setReportSuccessOpen(false)} severity="warning" variant="filled">
          Report submitted.
        </Alert>
      </Snackbar>

      <SaveToPlaylistDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        videoId={video._id}
        currentUser={currentUser}
      />
    </Card>
  );
}

export default VideoCard;
