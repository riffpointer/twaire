import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Strings from "../utils/Strings";
import Comment from "./Comment";

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
          <Comment
            key={comment._id}
            comment={comment}
            likedComments={likedComments}
            dislikedComments={dislikedComments}
            onToggle={toggle}
            replyingTo={replyingTo}
            replyText={replyText}
            onReplyTextChange={(e) => setReplyText(e.target.value)}
            onReplySubmit={handleReply}
            onReplyCancel={() => setReplyingTo(null)}
            setReplyingTo={setReplyingTo}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
