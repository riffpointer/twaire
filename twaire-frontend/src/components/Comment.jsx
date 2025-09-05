import { Link } from "react-router-dom";

function Comment({ comment, likedComments, dislikedComments, onToggle, replyingTo, replyText, onReplyTextChange, onReplySubmit, onReplyCancel, setReplyingTo }) {
  return (
    <div key={comment._id} className="mb-3">
      <div className="d-flex">
        <img
          src={
            comment.user?.profilePicture
              ? `http://localhost:5000/${comment.user.profilePicture}`
              : "https://placehold.co/40"
          }
          alt="User"
          className="rounded-circle me-2"
          width={40}
          height={40}
        />
        <div>
          <div className="d-flex align-items-center">
            <Link to={`/user/${comment.user?.username}`} className="me-1 text-decoration-none">
              <b>{comment.user?.publicName || comment.user?.username || "User"}</b>
            </Link>
            <small className="text-muted"> commented</small>
            {comment.user?.verified && <i className="bi bi-patch-check-fill text-primary"></i>}
          </div>
          <p className="mb-1">{comment.text}</p>
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
            <form onSubmit={(e) => onReplySubmit(e, comment._id)} className="mt-2 ms-4">
              <textarea
                className="form-control mb-2 w-100"
                rows="1"
                placeholder="Write a reply..."
                value={replyText}
                onChange={onReplyTextChange}
              />
              <button className="btn btn-primary btn-sm me-2" type="submit">
                Post Reply
              </button>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={onReplyCancel}
              >
                Cancel
              </button>
            </form>
          )}

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <div className="ms-0 mt-2" style={{ borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
              {comment.replies.map((reply) => (
                <div key={reply._id} className="d-flex mb-2">
                  <img
                    src={
                      reply.user?.profilePicture
                        ? `http://localhost:5000/${reply.user.profilePicture}`
                        : "https://placehold.co/32"
                    }
                    alt="User"
                    className="rounded-circle me-2"
                    width={32}
                    height={32}
                  />
                  <div>
                    <Link to={`/user/${reply.user?.username}`} className="me-1 text-decoration-none">
                      <b>{reply.user?.publicName || reply.user?.username || "User"}</b>
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
                        <i className={`bi bi-hand-thumbs-up-${likedComments.has(reply._id) ? 'fill' : ''} me-1`}></i>
                        {Array.isArray(reply.likes) ? reply.likes.length : 0}
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${dislikedComments.has(reply._id) ? 'text-danger' : ''} d-flex align-items-center`}
                        onClick={() => onToggle(reply._id, "dislike")}
                        title="I dislike this reply!"
                      >
                        <i className={`bi bi-hand-thumbs-down-${dislikedComments.has(reply._id) ? 'fill' : ''} me-1`}></i>
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
