import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";
import ApiConfig from "../utils/ApiConfig.js";
import VideoCard from "./VideoCard.jsx";

function VideoPickerDialog({ open, onClose, onSelect, userId, currentTrailerId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      const fetchVideos = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${ApiConfig.serverUrl}/api/users/${userId}/videos`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            setVideos(data);
          }
        } catch (err) {
          console.error("Failed to fetch videos for picking trailer", err);
        } finally {
          setLoading(false);
        }
      };
      fetchVideos();
    }
  }, [open, userId]);

  const isCurrent = (video) => {
    const id = typeof currentTrailerId === 'object' ? currentTrailerId?._id : currentTrailerId;
    return video._id === id;
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Select Channel Trailer</DialogTitle>
      <DialogContent dividers sx={{ bgcolor: 'background.default', pb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a video to feature as your channel trailer. This video will autoplay for new visitors to your channel home page.
        </Typography>
        
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2, mb: 1 }} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : videos.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No videos found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You need to upload at least one video before you can select a trailer.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {videos.map((video) => {
              const selected = isCurrent(video);
              return (
                <Grid item xs={12} sm={6} md={4} key={video._id}>
                  <Box
                    onClick={() => onSelect(video)}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        '& .video-card-select-overlay': {
                          opacity: 1
                        }
                      },
                      border: selected ? '3px solid' : '3px solid transparent',
                      borderColor: 'primary.main',
                      boxShadow: selected ? 8 : 0,
                      overflow: 'hidden'
                    }}
                  >
                    <VideoCard 
                      video={video} 
                      sx={{ 
                        height: '100%',
                        bgcolor: selected ? 'action.selected' : 'background.paper'
                      }} 
                    />
                    
                    {selected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(25, 118, 210, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                          zIndex: 2
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            boxShadow: 2
                          }}
                        >
                          SELECTED
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button onClick={() => onClose()} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VideoPickerDialog;
