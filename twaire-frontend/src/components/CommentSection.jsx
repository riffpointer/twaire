import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
      if (!res.ok) throw new Error(data.error || "Failed to fetch comments");
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
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

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
      if (!res.ok) throw new Error(data.error || "Failed to react");

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
      if (!res.ok) throw new Error(data.error || "Failed to post reply");

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
        {comments.map((c) => (
          <div key={c._id} className="mb-3">
            <div className="d-flex">
              <img
                src={
                  c.user?.profilePicture
                    ? `http://localhost:5000/${c.user.profilePicture}`
                    : "https://placehold.co/40"
                }
                alt="User"
                className="rounded-circle me-2"
                width={40}
                height={40}
              />
              <div>
                <div className="d-flex align-items-center">
                  <Link to={`/user/${c.user?.username}`} className="me-1 text-decoration-none">
                    <b>{c.user?.publicName || c.user?.username || "User"}</b>
                  </Link>
                  <small className="text-muted"> commented</small>
                  {c.user?.verified && <i className="bi bi-patch-check-fill text-primary"></i>}
                </div>
                <p className="mb-1">{c.text}</p>
                <div className="d-flex align-items-center small text-muted gap-1">
                  <button
                    type="button"
                    className={`btn btn-sm ps-0 pe-0 ${likedComments.has(c._id) ? 'text-primary' : ''} d-flex align-items-center`}
                    onClick={() => toggle(c._id, "like")}
                    title="I like this comment!"
                  >
                    <i className={`bi bi-hand-thumbs-up${likedComments.has(c._id) ? '-fill' : ''} me-1`}></i>
                    {Array.isArray(c.likes) ? c.likes.length : 0}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ms-1 ps-0 pe-0 ${dislikedComments.has(c._id) ? 'text-danger' : ''} d-flex align-items-center`}
                    onClick={() => toggle(c._id, "dislike")}
                    title="I dislike this comment!"
                  >
                    <i className={`bi bi-hand-thumbs-down${dislikedComments.has(c._id) ? '-fill' : ''} me-1`}></i>
                    {Array.isArray(c.dislikes) ? c.dislikes.length : 0}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                  >
                    Reply
                  </button>
                </div>

                {replyingTo === c._id && (
                  <form onSubmit={(e) => handleReply(e, c._id)} className="mt-2 ms-4">
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

                {Array.isArray(c.replies) && c.replies.length > 0 && (
                  <div className="ms-0 mt-2" style={{ borderLeft: '2px solid #ccc', paddingLeft: '10px' }}>
                    {c.replies.map((r) => (
                      <div key={r._id} className="d-flex mb-2">
                        <img
                          src={
                            r.user?.profilePicture
                              ? `http://localhost:5000/${r.user.profilePicture}`
                              : "https://placehold.co/32"
                          }
                          alt="User"
                          className="rounded-circle me-2"
                          width={32}
                          height={32}
                        />
                        <div>
                          <Link to={`/user/${r.user?.username}`} className="me-1 text-decoration-none">
                            <b>{r.user?.publicName || r.user?.username || "User"}</b>
                          </Link>
                          <small className="text-muted"> replied</small>
                          <p className="mb-1">{r.text}</p>
                          <div className="d-flex align-items-center small text-muted gap-1">
                            <button
                              type="button"
                              className={`btn btn-sm ${likedComments.has(r._id) ? 'btn-primary' : ''} d-flex align-items-center`}
                              onClick={() => toggle(r._id, "like")}
                              title="I like this reply!"
                            >
                              <i className="bi bi-hand-thumbs-up me-1"></i>
                              {Array.isArray(r.likes) ? r.likes.length : 0}
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${dislikedComments.has(r._id) ? 'btn-danger' : ''} d-flex align-items-center`}
                              onClick={() => toggle(r._id, "dislike")}
                              title="I dislike this reply!"
                            >
                              <i className="bi bi-hand-thumbs-down me-1"></i>
                              {Array.isArray(r.dislikes) ? r.dislikes.length : 0}
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
