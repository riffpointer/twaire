import { useEffect, useState } from "react";
import ApiConfig from "../utils/ApiConfig.js";
import PromptLoginDialog from "@/components/PromptLoginDialog.jsx";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";

const DEFAULT_NOTE_PLACEHOLDER = "04:20 - Great guitar solo";

function formatBookmarkTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const rounded = Math.round(safeSeconds * 1000) / 1000;
  const wholeSeconds = Math.floor(rounded);
  const milliseconds = Math.round((rounded - wholeSeconds) * 1000);

  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const secs = wholeSeconds % 60;

  const base =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  if (milliseconds === 0) return base;
  return `${base}.${String(milliseconds).padStart(3, "0").replace(/0+$/, "")}`;
}

function VideoBookmarks({
  videoId,
  videoElementId = "main-video-player",
  open = false,
  onClose = () => {},
}) {
  const [bookmarks, setBookmarks] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [promptLoginDialogShown, showPromptLogin] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (!videoId || !open) return undefined;

    const controller = new AbortController();

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/bookmarks`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (res.status === 401) {
          showPromptLogin(true);
          setRequiresLogin(true);
          setBookmarks([]);
          return;
        }

        setRequiresLogin(false);

        if (!res.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const data = await res.json();
        setBookmarks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load personal bookmarks.");
          setBookmarks([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();

    return () => controller.abort();
  }, [videoId, open]);

  const getVideoElement = () => document.getElementById(videoElementId);

  const handleSaveBookmark = async (event) => {
    event.preventDefault();
    const video = getVideoElement();
    if (!video) return;

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setError("Add a short note before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const timestampSeconds = Math.max(0, Math.round((video.currentTime || 0) * 1000) / 1000);
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/bookmarks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestampSeconds,
          note: trimmedNote,
        }),
      });

      if (res.status === 401) {
        showPromptLogin(true);
        setRequiresLogin(true);
        return;
      }

      setRequiresLogin(false);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save bookmark");
      }

      setBookmarks((current) => {
        const next = current.filter((bookmark) => bookmark._id !== data._id);
        next.push(data);
        return next.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
      });
      setNote("");
    } catch (err) {
      setError(err.message || "Failed to save bookmark.");
    } finally {
      setSaving(false);
    }
  };

  const handleJumpToBookmark = (bookmark) => {
    const video = getVideoElement();
    if (!video) return;
    video.currentTime = bookmark.timestampSeconds;
    video.pause();
    onClose();
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    const shouldDelete = window.confirm("Delete this bookmark?");
    if (!shouldDelete) return;

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/bookmarks/${bookmarkId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        showPromptLogin(true);
        setRequiresLogin(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete bookmark");
      }

      setBookmarks((current) => current.filter((bookmark) => bookmark._id !== bookmarkId));
    } catch (err) {
      setError(err.message || "Failed to delete bookmark.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setError("");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <BookmarkIcon fontSize="small" color="action" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Video bookmarks
              </Typography>
            </Stack>
            <IconButton onClick={handleCloseDialog} aria-label="Close bookmarks dialog">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Save private timestamps and notes for yourself. These are not visible to other viewers.
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Stack spacing={1.25}>
              <Skeleton variant="rounded" height={72} />
              <Skeleton variant="rounded" height={72} />
            </Stack>
          ) : requiresLogin ? (
            <Alert severity="info">Login to save private bookmarks for this video.</Alert>
          ) : bookmarks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No bookmarks saved for this video yet.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {bookmarks.map((bookmark) => (
                <Card
                  key={bookmark._id}
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: 1,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={0.75} justifyContent="flex-start" sx={{ flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleJumpToBookmark(bookmark)}
                        aria-label="Jump to timestamp"
                        title="Jump to timestamp"
                        sx={{
                          minWidth: 0,
                          width: 40,
                          height: 32,
                          px: 0,
                          borderRadius: 1.5,
                        }}
                      >
                        <PlayArrowIcon fontSize="small" />
                      </Button>
                    </Stack>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                        <Chip
                          label={formatBookmarkTime(bookmark.timestampSeconds)}
                          size="small"
                          color="primary"
                          variant="filled"
                        />
                        <Typography variant="body2" color="text.secondary">
                          &middot;
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(bookmark.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body1"
                        sx={{
                          mt: 0.5,
                          fontWeight: 400,
                          fontSize: "1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {bookmark.note}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.75} justifyContent="flex-end" sx={{ flexShrink: 0 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteBookmark(bookmark._id)}
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        sx={{
                          textTransform: "none",
                          minWidth: 0,
                          width: "fit-content",
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={handleSaveBookmark}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "flex-start" }}
              sx={{ width: "100%" }}
            >
              <TextField
                fullWidth
                size="small"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={DEFAULT_NOTE_PLACEHOLDER}
                label="Bookmark note"
                multiline
                minRows={3}
                sx={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<BookmarkAddIcon />}
                disabled={saving || requiresLogin}
                sx={{
                  minWidth: 0,
                  width: "fit-content",
                  px: 1.25,
                  alignSelf: "flex-start",
                  ml: "auto",
                  textTransform: "none",
                }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      <PromptLoginDialog
        action="save private bookmarks"
        open={promptLoginDialogShown}
        onClose={() => showPromptLogin(false)}
      />
    </>
  );
}

export default VideoBookmarks;
