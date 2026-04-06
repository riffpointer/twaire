import CloseIcon from "@mui/icons-material/Close";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Avatar, Box, Collapse, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { useQueue } from "../contexts/QueueContext.jsx";

function QueuePanel() {
  const { queueItems, removeFromQueue, clearQueue, isQueueExpanded, setIsQueueExpanded } = useQueue();
  const location = useLocation();

  const isVisible = queueItems.length > 0;

  const match = location.pathname.match(/^\/watch\/([a-zA-Z0-9_-]+)/);
  const currentVideoId = match ? match[1] : null;
  const currentIndex = currentVideoId ? queueItems.findIndex((item) => item._id === currentVideoId) : -1;

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 20 },
        bottom: { xs: 12, sm: 20 },
        width: { xs: "calc(100vw - 24px)", sm: 360 },
        maxWidth: 360,
        zIndex: (theme) => theme.zIndex.modal + 1,
        overflow: "hidden",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transform: isVisible
          ? "translateY(0)"
          : "translateY(150%)",
        opacity: isVisible ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <Box onClick={() => setIsQueueExpanded(!isQueueExpanded)} sx={{ height: 48, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, bgcolor: "action.hover", cursor: "pointer" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QueueMusicIcon fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700}>
            Queue
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {queueItems.length} item{queueItems.length === 1 ? "" : "s"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Clear queue">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); clearQueue(); }} aria-label="Clear queue">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isQueueExpanded ? "Collapse queue" : "Expand queue"}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setIsQueueExpanded(!isQueueExpanded); }} aria-label="Toggle queue">
              {isQueueExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowUpIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={isQueueExpanded}>
        <Stack sx={{ maxHeight: 320, overflowY: "auto" }}>
          {queueItems.map((item, index) => {
            const isPast = currentIndex !== -1 && index < currentIndex;
            
            return (
              <Box
                key={item._id}
                sx={{
                  display: "flex",
                  gap: 1.25,
                  alignItems: "center",
                  px: 1.5,
                  py: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  opacity: isPast ? 0.5 : 1,
              }}
            >
              <Avatar
                variant="rounded"
                src={
                  item.thumbnail
                    ? `${ApiConfig.serverUrl}/data/thumbnails/${item.thumbnail}`
                    : undefined
                }
                alt={item.title}
                sx={{ width: 56, height: 32, bgcolor: "action.hover" }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  component={Link}
                  to={`/watch/${item._id}`}
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ display: "block", textDecoration: "none", color: "text.primary" }}
                >
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  Added to queue
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="Play Now">
                  <IconButton size="small" component={Link} to={`/watch/${item._id}`} aria-label={`Play ${item.title}`}>
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from queue">
                  <IconButton size="small" onClick={() => removeFromQueue(item._id)} aria-label={`Remove ${item.title} from queue`}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            );
          })}
        </Stack>
      </Collapse>
    </Paper>
  );
}

export default QueuePanel;
