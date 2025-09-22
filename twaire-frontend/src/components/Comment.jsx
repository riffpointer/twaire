import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import {
  Avatar,
  Box,
  Button,
  Card,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.jsx";
import { getRelativeTime } from "../utils/DateUtils.jsx";
import VerifiedUserBadge from "./VerifiedUserBadge.jsx";

function Comment({ comment, likedComments, dislikedComments, onToggle, replyingTo, replyText, onReplyTextChange, onReplySubmit, onReplyCancel, setReplyingTo, currentUser }) {
  const commentAuthorUsername = comment.user?.username || "Deleted User";
  const commentAuthorPublicName = comment.user?.publicName || commentAuthorUsername;
  const commentAuthorShortName = commentAuthorPublicName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("") || commentAuthorUsername.charAt(0).toUpperCase();
  const commentAuthorProfilePicture = comment.user?.profilePicture
    ? `${ApiConfig.serverUrl}/${comment.user.profilePicture}`
    : "${ApiConfig.serverUrl}/api/helper/placeholder/40x40?text=" + encodeURIComponent(commentAuthorShortName);

  return (
    <Box key={comment._id}>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Avatar
          src={commentAuthorProfilePicture}
          alt="User"
          sx={{ width: 40, height: 40, mr: 2 }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              component={Link}
              to={`/user/${comment.user?.username}`}
              sx={{
                mr: 0.5,
                textDecoration: 'none',
                fontWeight: 'bold',
                color: 'text.primary',
              }}
            >
              {commentAuthorPublicName}
              <VerifiedUserBadge user={comment.user} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getRelativeTime(comment.createdAt)}
            </Typography>
          </Box>

          <Typography sx={{ mb: 0.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {comment.text}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.4,
              typography: 'body2',
              color: 'text.secondary',
            }}
          >
            <IconButton
              size="small"
              onClick={() => onToggle(comment._id, 'like')}
              title="I like this comment!"
              color={likedComments.has(comment._id) ? 'primary' : 'default'}
            >
              {likedComments.has(comment._id) ? (
                <ThumbUpIcon fontSize="small" />
              ) : (
                <ThumbUpOffAltIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="caption">
              {Array.isArray(comment.likes) ? comment.likes.length : 0}
            </Typography>

            <IconButton
              size="small"
              onClick={() => onToggle(comment._id, 'dislike')}
              title="I dislike this comment!"
              color={dislikedComments.has(comment._id) ? 'error' : 'default'}
            >
              {dislikedComments.has(comment._id) ? (
                <ThumbDownIcon fontSize="small" />
              ) : (
                <ThumbDownOffAltIcon fontSize="small" />
              )}
            </IconButton>
            <Typography variant="caption">
              {Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}
            </Typography>

            <Button
              size="small"
              variant="text"
              onClick={() =>
                setReplyingTo(replyingTo === comment._id ? null : comment._id)
              }
            >
              Reply
            </Button>
          </Box>

          {/* Reply input box */}
          {replyingTo === comment._id && (
            <Card
              variant="outlined"
              component="form"
              onSubmit={(e) => onReplySubmit(e, comment._id)}
              sx={{ p: 1.5, mt: 1, display: 'flex', width: '100%' }}>
              <Avatar
                src={
                  currentUser?.profilePicture
                    ? `${ApiConfig.serverUrl}/${currentUser.profilePicture}`
                    : `${ApiConfig.serverUrl}/api/helper/placeholder/32x32?text=${currentUser?.username?.charAt(0)}`
                }
                alt="User"
                sx={{ width: 32, height: 32, mr: 2, mt: 1 }}
                title={`Commenting as ${currentUser.publicName}`}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <TextField
                  size="small"
                  label="Write a reply..."
                  value={replyText}
                  onChange={onReplyTextChange}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex' }}>
                  <Button
                    disableElevation
                    variant="contained"
                    sx={{ mr: 2 }}
                    type="submit"
                  >
                    Post Reply
                  </Button>
                  <Button variant="text" onClick={onReplyCancel}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Card>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
              {comment.replies.map((reply) => (
                <Box key={reply._id} sx={{ display: 'flex', mb: 2 }}>
                  <Avatar
                    src={
                      reply.user?.profilePicture
                        ? `${ApiConfig.serverUrl}/${reply.user.profilePicture}`
                        : `${ApiConfig.serverUrl}/api/helper/placeholder/32x32?text=${reply.user?.username?.charAt(0)}`
                    }
                    alt="User"
                    sx={{ width: 32, height: 32, mr: 2 }}
                  />
                  <Box>
                    <Box sx={{ display: "flex", alignItems: 'center', gap: 0.4 }}>
                      <Typography
                        component={Link}
                        to={`/user/${reply.user?.username}`}
                        sx={{
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          color: 'text.primary',
                        }}
                      >
                        {reply.user?.publicName ||
                          reply.user?.username ||
                          'Deleted User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getRelativeTime(reply.createdAt)}
                      </Typography>
                    </Box>
                    <Typography sx={{ mb: 0 }}>{reply.text}</Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.4,
                        typography: 'body2',
                        color: 'text.secondary',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => onToggle(reply._id, 'like')}
                        color={likedComments.has(reply._id) ? 'primary' : 'default'}
                      >
                        {likedComments.has(reply._id) ? (
                          <ThumbUpIcon fontSize="small" />
                        ) : (
                          <ThumbUpOffAltIcon fontSize="small" />
                        )}
                      </IconButton>
                      <Typography variant="caption">
                        {Array.isArray(reply.likes) ? reply.likes.length : 0}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() => onToggle(reply._id, 'dislike')}
                        color={dislikedComments.has(reply._id) ? 'error' : 'default'}
                      >
                        {dislikedComments.has(reply._id) ? (
                          <ThumbDownIcon fontSize="small" />
                        ) : (
                          <ThumbDownOffAltIcon fontSize="small" />
                        )}
                      </IconButton>
                      <Typography variant="caption">
                        {Array.isArray(reply.dislikes) ? reply.dislikes.length : 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Comment;