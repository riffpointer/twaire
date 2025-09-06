import React, { useState, useEffect } from 'react';
import ApiConfig from '../utils/ApiConfig.jsx';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function VideoActionBar({ videoId }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  useEffect(() => {
    if (!videoId) return;
    const fetchReactions = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/reactions`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLikes(data.likes);
          setDislikes(data.dislikes);
          setLiked(data.liked);
          setDisliked(data.disliked);
        } else {
          setLiked(false);
          setDisliked(false);
        }
      } catch {
        setLiked(false);
        setDisliked(false);
      }
    };
    fetchReactions();
  }, [videoId]);

  const handleLike = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setDisliked(data.disliked);
        setLiked(data.liked);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/dislike`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setDisliked(data.disliked);
        setLiked(data.liked);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
    setTimeout(() => {
        setCopyButtonText('Copy');
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${ApiConfig.serverUrl}/watch/${videoId}`);
    setCopyButtonText('Copied!');
    setTimeout(() => {
        setCopyButtonText('Copy');
    }, 2000);
  };

  const btnStyle = {
    minHeight: '32px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem'
  };

  return (
    <div className="w-100 d-flex justify-content-start py-1 mb-3">
      <div className="d-inline-flex align-items-center" style={{ gap: '0.5rem' }}>
        <div className="btn-group" role="group" aria-label="like-dislike">
          <button
            type="button"
            className={`btn ${liked ? 'btn-primary' : 'btn-light'} d-flex align-items-center border border-1`}
            onClick={handleLike}
            style={btnStyle}
            title="Like the video"
            disabled={loading}
          >
            <i className={`bi bi-hand-thumbs-up${liked ? '-fill' : ''} me-2`} />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            className={`btn ${disliked ? 'btn-danger' : 'btn-light'} d-flex align-items-center border border-1`}
            onClick={handleDislike}
            style={btnStyle}
            title="Dislike the video"
            disabled={loading}
          >
            <i className={`bi bi-hand-thumbs-down${disliked ? '-fill' : ''} me-2`} />
            <span>{dislikes}</span>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-light d-flex align-items-center border border-1"
          style={btnStyle}
          title="Share the video"
          onClick={handleShareClick}
        >
          <i className="bi bi-share me-2" />
          <span>Share</span>
        </button>

        <button
          type="button"
          className="btn btn-light d-flex align-items-center border border-1"
          style={btnStyle}
          title="Save the video to a playlist"
        >
          <i className="bi bi-plus-circle-fill me-2" />
          <span>Save</span>
        </button>
      </div>

      <Dialog open={openShare} onClose={handleCloseShare} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Share Video</Typography>
            <IconButton onClick={handleCloseShare}>
              <i className="bi bi-x-lg" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={`${ApiConfig.serverUrl}/watch/${videoId}`}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <Button 
                onClick={handleCopy} 
                color={copyButtonText === 'Copy' ? 'primary' : 'success'}
                variant="contained" 
                disableElevation
                sx={{minWidth: '110px'}}
            >
              <i className={`bi ${copyButtonText === 'Copy' ? 'bi-clipboard' : 'bi-check-lg'} me-2`} />
              {copyButtonText}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VideoActionBar;