import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Strings from "../utils/Strings";

function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [postErr, setPostErr] = useState(null);
  const [reactErr, setReactErr] = useState(null);
  const [likedComments, setLikedComments] = useState(new Set());
  const [dislikedComments, setDislikedComments] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.comments)) return payload.comments;
    return [];
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to load comments, try reloading the page!`);
      setComments(toArray(data));
    } catch (e) {
      console.error(e);
      setErr(e.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPostErr(null);
    setErr(null);

    if (videoId) fetchComments();
  }, [videoId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPostErr(null);

    try {
      const res = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to post comment! ${Strings.help.report_active_issue}`);

      const newComment = data.comment ?? data;
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (e) {
      setPostErr(e.message);
    }
  };

  const toggle = async (id, kind) => {
    setReactErr(null);

    if (kind === 'like') {
      if (likedComments.has(id)) {
        likedComments.delete(id);
      } else {
        likedComments.add(id);
        dislikedComments.delete(id);
      }
      setLikedComments(new Set(likedComments));
      setDislikedComments(new Set(dislikedComments));
    } else if (kind === 'dislike') {
      if (dislikedComments.has(id)) {
        dislikedComments.delete(id);
      } else {
        dislikedComments.add(id);
        likedComments.delete(id);
      }
      setLikedComments(new Set(likedComments));
      setDislikedComments(new Set(dislikedComments));
    }

    try {
      const res = await fetch(`http://localhost:5000/api/comments/${id}/${kind}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to add reaction! ${Strings.help.report_active_issue}`);

      setComments((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, likes: Array(data.likes).fill(0), dislikes: Array(data.dislikes).fill(0) } : c
        )
      );
    } catch (e) {
      setReactErr(e.message);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/replies`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to post reply! ${Strings.help.report_active_issue}`);

      setReplyingTo(null);
      setReplyText("");
      fetchComments(); // Refresh all comments to get the new reply
    } catch (e) {
      setReactErr(e.message);
    }
  };

  return (
    <div className="mt-4">
      <h5>Comments</h5>

      {postErr && <div className="alert alert-danger" role="alert">{postErr}</div>}
      {reactErr && <div className="alert alert-danger" role="alert">{reactErr}</div>}

      <form onSubmit={handlePost} className="mb-3 d-flex gap-3 align-items-center">
        <textarea
          className="form-control"
          rows="1"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" type="submit" style={{ height: 38 }}>
          Post
        </button>
      </form>

      {loading && <p>Loading comments…</p>}
      {err && <p className="text-danger">Unable to load comments: {err}</p>}
      {!loading && !err && comments.length === 0 && <p className="text-muted">No comments yet.</p>}

      <div>
        {comments.map((comment) => (
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
                    onClick={() => toggle(comment._id, "like")}
                    title="I like this comment!"
                  >
                    <i className={`bi bi-hand-thumbs-up${likedComments.has(comment._id) ? '-fill' : ''} me-1`}></i>
                    {Array.isArray(comment.likes) ? comment.likes.length : 0}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ms-1 ps-0 pe-0 ${dislikedComments.has(comment._id) ? 'text-danger' : ''} d-flex align-items-center`}
                    onClick={() => toggle(comment._id, "dislike")}
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
                  <form onSubmit={(e) => handleReply(e, comment._id)} className="mt-2 ms-4">
                    <textarea
                      className="form-control mb-2 w-100"
                      rows="1"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm me-2" type="submit">
                      Post Reply
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => setReplyingTo(null)}
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
                              onClick={() => toggle(reply._id, "like")}
                              title="I like this reply!"
                            >
                              <i className={`bi bi-hand-thumbs-up-${likedComments.has(reply._id) ? 'fill' : ''} me-1`}></i>
                              {Array.isArray(reply.likes) ? reply.likes.length : 0}
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${dislikedComments.has(reply._id) ? 'text-danger' : ''} d-flex align-items-center`}
                              onClick={() => toggle(reply._id, "dislike")}
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
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
