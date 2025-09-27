import { useEffect, useState } from 'react';
import ApiConfig from '../utils/ApiConfig.js';
import PromptLoginDialog from "../components/PromptLoginDialog.jsx";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import ContentCopy from '@mui/icons-material/ContentCopy';
import PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import Share from '@mui/icons-material/Share';
import ThumbDown from '@mui/icons-material/ThumbDown';
import ThumbDownOutlined from '@mui/icons-material/ThumbDownOutlined';
import ThumbUp from '@mui/icons-material/ThumbUp';
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined';

import Facebook from '@mui/icons-material/Facebook';
import Reddit from '@mui/icons-material/Reddit';
import Twitter from '@mui/icons-material/Twitter';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Divider } from '@mui/material';

function VideoActionBar({ videoId }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [promptLoginDialogShown, showPromptLogin] = useState(false);

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

  const handleReaction = async (type) => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/${type}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) {
        showPromptLogin(true);
        return;
      }
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
    }, 500); // Reset after dialog close animation
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`);
    setCopyButtonText('Copied!');
    setTimeout(() => {
      setCopyButtonText('Copy');
    }, 2000);
  };

  const encodedUrl = encodeURIComponent(`${window.location.origin}/watch/${videoId}`);
  const shareText = `Watch this video on Twaire:`;

  return (
    <>
      <Stack direction="row" spacing={1} py={1} mb={2}>
        <ButtonGroup variant="outlined">
          <Button
            onClick={() => handleReaction('like')}
            disabled={loading}
            variant={liked ? 'contained' : 'outlined'}
            startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
            title="Like the video"
          >
            {likes}
          </Button>
          <Button
            onClick={() => handleReaction('dislike')}
            disabled={loading}
            variant={disliked ? 'contained' : 'outlined'}
            color={disliked ? 'error' : 'primary'}
            startIcon={disliked ? <ThumbDown /> : <ThumbDownOutlined />}
            title="Dislike the video"
          >
            {dislikes}
          </Button>
        </ButtonGroup>

        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShareClick}
          title="Share the video"
        >
          Share
        </Button>

        <Button
          variant="outlined"
          startIcon={<PlaylistAdd />}
          title="Save the video to a playlist"
        >
          Save
        </Button>
      </Stack>

      <Dialog open={openShare} onClose={handleCloseShare} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Share Video</Typography>
            <IconButton onClick={handleCloseShare} aria-label="close">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          Share this video to your favourite social media platforms:
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              component="a"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="share on facebook"
              sx={{ color: '#1877F2' }}
            >
              <Facebook sx={{ fontSize: 40 }} />
            </IconButton>

            <IconButton
              component="a"
              href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="share on whatsapp"
              sx={{ color: '#25D366' }}
            >
              <WhatsApp sx={{ fontSize: 40 }} />
            </IconButton>
        
            <IconButton
              component="a"
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="share on twitter"
              sx={{ color: '#1DA1F2' }}
            >
              <Twitter sx={{ fontSize: 40 }} />
            </IconButton>

            <IconButton
              component="a"
              href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="share on reddit"
              sx={{ color: '#FF4500' }}
            >
              <Reddit sx={{ fontSize: 40 }} />
            </IconButton>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="center" alignItems="center" mb={1}>
            <Typography variant="button">OR</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography>Share this video to other platforms by copying the link below.</Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <TextField
              fullWidth
              size="small"
              value={`${window.location.origin}/watch/${videoId}`}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
            <Button
              onClick={handleCopy}
              color={copyButtonText === 'Copy' ? 'primary' : 'success'}
              variant="contained"
              disableElevation
              startIcon={copyButtonText === 'Copy' ? <ContentCopy /> : <Check />}
              sx={{ minWidth: '110px' }}
            >
              {copyButtonText}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <PromptLoginDialog action="like this video" open={promptLoginDialogShown} onClose={() => showPromptLogin(false)} />
    </>
  );
}

export default VideoActionBar;