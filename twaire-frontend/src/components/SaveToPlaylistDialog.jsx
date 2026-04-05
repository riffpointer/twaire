import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ApiConfig from "../utils/ApiConfig.js";

const VISIBILITY_OPTIONS = [
  { value: 0, label: "Public", icon: <PublicIcon fontSize="small" /> },
  { value: 1, label: "Unlisted", icon: <LinkIcon fontSize="small" /> },
  { value: 2, label: "Private", icon: <LockIcon fontSize="small" /> },
];

function SaveToPlaylistDialog({ open, onClose, videoId, currentUser }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // playlistId being saved
  const [savedIds, setSavedIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState(2);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !currentUser) return;
    setLoading(true);
    fetch(`${ApiConfig.serverUrl}/api/playlists/user/${currentUser.username}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlaylists(data);
          // Pre-check which playlists already contain this video
          const alreadyIn = new Set(
            data
              .filter((pl) =>
                (pl.videos || []).some(
                  (v) => (v._id || v) === videoId
                )
              )
              .map((pl) => pl._id)
          );
          setSavedIds(alreadyIn);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, currentUser, videoId]);

  const handleToggle = async (playlist) => {
    const alreadySaved = savedIds.has(playlist._id);
    setSaving(playlist._id);
    try {
      if (alreadySaved) {
        await fetch(
          `${ApiConfig.serverUrl}/api/playlists/${playlist._id}/videos/${videoId}`,
          { method: "DELETE", credentials: "include" }
        );
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(playlist._id);
          return next;
        });
      } else {
        await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}/videos`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        setSavedIds((prev) => new Set([...prev, playlist._id]));
      }
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), visibility: newVisibility }),
      });
      if (res.ok) {
        const pl = await res.json();
        setPlaylists((prev) => [pl, ...prev]);
        setNewName("");
        setNewVisibility(2);
        setShowCreate(false);
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PlaylistAddIcon />
          <Typography variant="h6" component="span">Save to playlist</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {!currentUser ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              Sign in to save videos to playlists.
            </Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
              {playlists.map((pl) => {
                const isSaved = savedIds.has(pl._id);
                const isSaving = saving === pl._id;
                const visIcon = VISIBILITY_OPTIONS.find((o) => o.value === pl.visibility)?.icon;
                return (
                  <Box
                    key={pl._id}
                    onClick={() => !isSaving && handleToggle(pl)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 0.5,
                        border: "2px solid",
                        borderColor: isSaved ? "primary.main" : "divider",
                        bgcolor: isSaved ? "primary.main" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {isSaving ? (
                        <CircularProgress size={12} sx={{ color: isSaved ? "primary.contrastText" : "text.secondary" }} />
                      ) : isSaved ? (
                        <CheckIcon sx={{ fontSize: 14, color: "primary.contrastText" }} />
                      ) : null}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={600} noWrap sx={{ pb: "4px" }}>
                        {pl.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                        {visIcon && <Box sx={{ fontSize: 12, display: "flex" }}>{visIcon}</Box>}
                        <Typography variant="caption">
                          {VISIBILITY_OPTIONS.find((o) => o.value === pl.visibility)?.label} · {pl.videos?.length || 0} video{pl.videos?.length === 1 ? "" : "s"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              {playlists.length === 0 && (
                <Box sx={{ px: 2, py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No playlists yet. Create one below.
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1, flexDirection: "column", alignItems: "stretch", gap: 0.5 }}>
        <Collapse in={showCreate} sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 1.5 }}>
            <TextField
              autoFocus
              size="small"
              label="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              fullWidth
            />
            <Select
              size="small"
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value)}
              fullWidth
              renderValue={(v) => {
                const opt = VISIBILITY_OPTIONS.find((o) => o.value === v);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {opt?.icon}
                    {opt?.label}
                  </Box>
                );
              }}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {opt.icon}
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              size="small"
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              startIcon={creating ? <CircularProgress size={14} /> : null}
              sx={{ alignSelf: "flex-end", textTransform: "none" }}
            >
              Create
            </Button>
          </Box>
          <Divider sx={{ mb: 1 }} />
        </Collapse>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setShowCreate((p) => !p)}
            sx={{ textTransform: "none" }}
          >
            New playlist
          </Button>
          <Button onClick={onClose} size="small">Done</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default SaveToPlaylistDialog;
