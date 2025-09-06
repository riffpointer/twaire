import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Strings from "../utils/Strings";
import Comment from "./Comment";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "./Loading.jsx";
import Button from '@mui/material/Button';
import { TextField } from "@mui/material";

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
  const [currentUser, setCurrentUser] = useState(null);

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.comments)) return payload.comments;
    return [];
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/comments`);
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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPostErr(null);

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/comments`, {
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
      const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${id}/${kind}`, {
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
      const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}/replies`, {
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
        <TextField
          fullWidth multiline
          size="small"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handlePost(e);
            }
          }}
        />
        <Button
          disableElevation
          variant="contained"
          color="primary"
          size="small"
          type="submit"
          disabled={!text.trim()}
          style={{ height: 38, minWidth: 64 }}
        >
          Post
        </Button>
      </form>

      {loading && <Loading label="Loading comments..." />}
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
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
