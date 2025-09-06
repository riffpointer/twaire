import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.jsx";
import { Box, Button, TextField } from "@mui/material";

function Comment({ comment, likedComments, dislikedComments, onToggle, replyingTo, replyText, onReplyTextChange, onReplySubmit, onReplyCancel, setReplyingTo, currentUser }) {
  const commentAuthorUsername = comment.user?.username || "Deleted User";
  const commentAuthorPublicName = comment.user?.publicName || commentAuthorUsername;
  const commentAuthorShortName = commentAuthorPublicName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("") || commentAuthorUsername.charAt(0).toUpperCase();
  const commentAuthorProfilePicture = comment.user?.profilePicture
    ? `${ApiConfig.serverUrl}/${comment.user.profilePicture}`
    : "https://placehold.co/40?text=" + encodeURIComponent(commentAuthorShortName);

  return (
    <div key={comment._id} className="mb-3">
      <div className="d-flex w-100">
        <img
          src={commentAuthorProfilePicture}
          alt="User"
          className="rounded-circle me-2"
          width={40}
          height={40}
        />
        <div className="w-100">
          <div className="d-flex align-items-center">
            <Link to={`/user/${comment.user?.username}`} className="me-1 text-decoration-none">
              <b>{commentAuthorPublicName}</b>
            </Link>
            <small className="text-muted"> commented</small>
            {comment.user?.verified && <i className="bi bi-patch-check-fill text-primary"></i>}
          </div>
          <p className="mb-1 text-wrap text-break">{comment.text}</p>
          <div className="d-flex align-items-center small text-muted gap-1">
            <button
              type="button"
              className={`btn btn-sm ps-0 pe-0 ${likedComments.has(comment._id) ? 'text-primary' : ''} d-flex align-items-center`}
              onClick={() => onToggle(comment._id, "like")}
              title="I like this comment!"
            >
              <i className={`bi bi-hand-thumbs-up${likedComments.has(comment._id) ? '-fill' : ''} me-1`}></i>
              {Array.isArray(comment.likes) ? comment.likes.length : 0}
            </button>
            <button
              type="button"
              className={`btn btn-sm ms-1 ps-0 pe-0 ${dislikedComments.has(comment._id) ? 'text-danger' : ''} d-flex align-items-center`}
              onClick={() => onToggle(comment._id, "dislike")}
              title="I dislike this comment!"
            >
              <i className={`bi bi-hand-thumbs-down${dislikedComments.has(comment._id) ? '-fill' : ''} me-1`}></i>
              {Array.isArray(comment.dislikes) ? comment.dislikes.length : 0}
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
            >
              Reply
            </button>
          </div>

          {replyingTo === comment._id && (
            <form onSubmit={(e) => onReplySubmit(e, comment._id)} className="p-2 mt-2 ms-0 d-flex flex-row w-100">
              <img
                src={currentUser?.profilePicture ? `${ApiConfig.serverUrl}/${currentUser.profilePicture}` : `https://placehold.co/32?text=${currentUser?.username?.charAt(0)}`}
                alt="User"
                className="rounded-circle me-2 mt-1"
                width={32}
                height={32}
              />
              <Box className="d-flex align-items-center mb-2 flex-column w-100">
                <TextField
                  size="small"
                  className="w-100 mb-2"
                  label="Write a reply..."
                  value={replyText}
                  onChange={onReplyTextChange}
                />
                <Box className="d-flex w-100">
                  <Button
                    disableElevation
                    variant="contained"
                    className="me-2"
                    type="submit">
                    Post Reply
                  </Button>
                  <Button
                    variant="text"
                    type="button"
                    onClick={onReplyCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="ms-0 mt-2" style={{ borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              {comment.replies.map((reply) => (
                <div key={reply._id} className="d-flex mb-2">
                  <img
                    src={
                      reply.user?.profilePicture
                        ? `${ApiConfig.serverUrl}/${reply.user.profilePicture}`
                        : `https://placehold.co/32?text=${reply.user?.username?.charAt(0)}`
                    }
                    alt="User"
                    className="rounded-circle me-2"
                    width={32}
                    height={32}
                  />
                  <div>
                    <Link to={`/user/${reply.user?.username}`} className="me-1 text-decoration-none">
                      <b>{reply.user?.publicName || reply.user?.username || "Deleted User"}</b>
                    </Link>
                    <small className="text-muted"> replied</small>
                    <p className="mb-1">{reply.text}</p>
                    <div className="d-flex align-items-center small text-muted gap-1">
                      <button
                        type="button"
                        className={`btn btn-sm ${likedComments.has(reply._id) ? 'text-primary' : ''} d-flex align-items-center`}
                        onClick={() => onToggle(reply._id, "like")}
                        title="I like this reply!"
                      >
                        <i className={`bi bi-hand-thumbs-up${likedComments.has(reply._id) ? '-fill' : ''} me-1`}></i>
                        {Array.isArray(reply.likes) ? reply.likes.length : 0}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${dislikedComments.has(reply._id) ? 'text-danger' : ''} d-flex align-items-center`}
                        onClick={() => onToggle(reply._id, "dislike")}
                        title="I dislike this reply!"
                      >
                        <i className={`bi bi-hand-thumbs-down${dislikedComments.has(reply._id) ? '-fill' : ''} me-1`}></i>
                        {Array.isArray(reply.dislikes) ? reply.dislikes.length : 0}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Comment;
