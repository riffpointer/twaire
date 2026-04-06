import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useCallback, useEffect, useState, useRef } from "react";
import ApiConfig from "../utils/ApiConfig.js";
import Strings from "../utils/Strings.js";
import Comment from "./Comment";
import EmojiPickerButton from "./EmojiPickerButton.jsx";
import Loading from "./Loading.jsx";

function CommentSection({ videoId, videoUploaderId, pinnedCommentId: initialPinnedCommentId = null }) {
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
  const [actionErr, setActionErr] = useState(null);
  const [pinnedCommentId, setPinnedCommentId] = useState(initialPinnedCommentId);
  const [pinWarningOpen, setPinWarningOpen] = useState(false);
  const [pendingPinCommentId, setPendingPinCommentId] = useState(null);
  const textRef = useRef(text);
  const commentInputRef = useRef(null);

  const patchReactionCounts = (items, id, updater) =>
    items.map((item) =>
      item._id === id
        ? updater(item)
        : {
            ...item,
            replies: Array.isArray(item.replies)
              ? item.replies.map((reply) => (reply._id === id ? updater(reply) : reply))
              : item.replies,
          }
    );

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    setPinnedCommentId(initialPinnedCommentId || null);
  }, [initialPinnedCommentId]);

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.comments)) return payload.comments;
    return [];
  };

  const canPinComments = Boolean(currentUser && videoUploaderId && currentUser._id === videoUploaderId);

  const orderedComments = [...comments].sort((a, b) => {
    const aPinned = a._id === pinnedCommentId;
    const bPinned = b._id === pinnedCommentId;
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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

  useEffect(() => {
    if (!currentUser || !comments || comments.length === 0) return;

    let changed = false;
    const initialLiked = new Set(likedComments);
    const initialDisliked = new Set(dislikedComments);

    comments.forEach((comment) => {
      if (Array.isArray(comment.likes) && comment.likes.includes(currentUser._id)) {
        if (!initialLiked.has(comment._id)) {
          initialLiked.add(comment._id);
          changed = true;
        }
      }
      if (Array.isArray(comment.dislikes) && comment.dislikes.includes(currentUser._id)) {
        if (!initialDisliked.has(comment._id)) {
          initialDisliked.add(comment._id);
          changed = true;
        }
      }

      if (Array.isArray(comment.replies)) {
        comment.replies.forEach((reply) => {
          if (Array.isArray(reply.likes) && reply.likes.includes(currentUser._id)) {
            if (!initialLiked.has(reply._id)) {
              initialLiked.add(reply._id);
              changed = true;
            }
          }
          if (Array.isArray(reply.dislikes) && reply.dislikes.includes(currentUser._id)) {
            if (!initialDisliked.has(reply._id)) {
              initialDisliked.add(reply._id);
              changed = true;
            }
          }
        });
      }
    });

    if (changed) {
      setLikedComments(initialLiked);
      setDislikedComments(initialDisliked);
    }
  }, [comments, currentUser]);

  const handlePost = useCallback(async (e) => {
    e.preventDefault();
    const currentText = textRef.current;
    if (!currentText.trim()) return;
    setPostErr(null);

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos/${videoId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to post comment! ${Strings.help.report_active_issue}`);

      const newComment = data.comment ?? data;
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (e) {
      setPostErr(e.message);
    }
  }, [videoId]);

  const toggle = async (id, kind) => {
    setReactErr(null);
    const prevLiked = new Set(likedComments);
    const prevDisliked = new Set(dislikedComments);
    const wasLiked = prevLiked.has(id);
    const wasDisliked = prevDisliked.has(id);

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

    setComments((prev) =>
      patchReactionCounts(prev, id, (item) => {
        const likes = Array.isArray(item.likes) ? item.likes.length : 0;
        const dislikes = Array.isArray(item.dislikes) ? item.dislikes.length : 0;

        if (kind === "like") {
          return {
            ...item,
            likes: Array(Math.max(likes + (wasLiked ? -1 : 1), 0)).fill(0),
            dislikes: Array(Math.max(dislikes + (wasDisliked ? -1 : 0), 0)).fill(0),
          };
        }

        return {
          ...item,
          likes: Array(Math.max(likes + (wasLiked ? -1 : 0), 0)).fill(0),
          dislikes: Array(Math.max(dislikes + (wasDisliked ? -1 : 1), 0)).fill(0),
        };
      })
    );

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${id}/${kind}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to add reaction! ${Strings.help.report_active_issue}`);

      setComments((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, likes: Array(data.likes).fill(0), dislikes: Array(data.dislikes).fill(0) }
            : {
                ...c,
                replies: Array.isArray(c.replies)
                  ? c.replies.map((reply) =>
                      reply._id === id
                        ? {
                            ...reply,
                            likes: Array(data.likes).fill(0),
                            dislikes: Array(data.dislikes).fill(0),
                          }
                        : reply
                    )
                  : c.replies,
              }
        )
      );
    } catch (e) {
      setLikedComments(prevLiked);
      setDislikedComments(prevDisliked);
      setComments((prev) =>
        patchReactionCounts(prev, id, (item) => {
          const likes = Array.isArray(item.likes) ? item.likes.length : 0;
          const dislikes = Array.isArray(item.dislikes) ? item.dislikes.length : 0;

          if (kind === "like") {
            return {
              ...item,
              likes: Array(Math.max(likes + (wasLiked ? 1 : -1), 0)).fill(0),
              dislikes: Array(Math.max(dislikes + (wasDisliked ? 1 : 0), 0)).fill(0),
            };
          }

          return {
            ...item,
            likes: Array(Math.max(likes + (wasLiked ? 1 : 0), 0)).fill(0),
            dislikes: Array(Math.max(dislikes + (wasDisliked ? -1 : 1), 0)).fill(0),
          };
        })
      );
      setReactErr(e.message);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    const currentReplyText = replyText.trim();
    if (!currentReplyText) return;
    const optimisticReplyId = `temp-reply-${Date.now()}`;
    const optimisticReply = {
      _id: optimisticReplyId,
      user: currentUser || {
        _id: "temp-user",
        username: "you",
        publicName: "You",
      },
      text: currentReplyText,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString(),
      _pending: true,
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              replies: [...(Array.isArray(comment.replies) ? comment.replies : []), optimisticReply],
            }
          : comment
      )
    );
    setReplyingTo(null);
    setReplyText("");

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}/replies`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: currentReplyText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to post reply! ${Strings.help.report_active_issue}`);
      fetchComments();
    } catch (e) {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                replies: (comment.replies || []).filter((reply) => reply._id !== optimisticReplyId),
              }
            : comment
        )
      );
      setReplyingTo(commentId);
      setReplyText(currentReplyText);
      setReactErr(e.message);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to edit comment");
    setComments((prev) => prev.map((comment) => (comment._id === commentId ? data : comment)));
  };

  const handleDeleteComment = async (commentId) => {
    const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to delete comment");
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    if (pinnedCommentId === commentId) {
      setPinnedCommentId(null);
    }
  };

  const executePinComment = async (commentId) => {
    const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}/pin`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to pin comment");
    setPinnedCommentId(data.pinnedCommentId || commentId);
  };

  const handlePinComment = async (commentId) => {
    setActionErr(null);
    if (pinnedCommentId && pinnedCommentId !== commentId) {
      setPendingPinCommentId(commentId);
      setPinWarningOpen(true);
      return;
    }

    try {
      await executePinComment(commentId);
    } catch (e) {
      setActionErr(e.message);
    }
  };

  const handleConfirmPinReplace = async () => {
    if (!pendingPinCommentId) {
      setPinWarningOpen(false);
      return;
    }

    try {
      await executePinComment(pendingPinCommentId);
    } catch (e) {
      setActionErr(e.message);
    } finally {
      setPinWarningOpen(false);
      setPendingPinCommentId(null);
    }
  };

  const handleEditReply = async (commentId, replyId, newText) => {
    const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}/replies/${replyId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to edit reply");
    setComments((prev) => prev.map((comment) => (comment._id === commentId ? data : comment)));
  };

  const handleDeleteReply = async (commentId, replyId) => {
    const res = await fetch(`${ApiConfig.serverUrl}/api/comments/${commentId}/replies/${replyId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to delete reply");
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, replies: comment.replies.filter((reply) => reply._id !== replyId) }
          : comment
      )
    );
  };

  const insertEmojiAtCursor = (emoji) => {
    const input = commentInputRef.current;
    const currentValue = textRef.current || "";
    if (!input || typeof input.selectionStart !== "number") {
      setText(`${currentValue}${emoji}`);
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const nextValue = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
    setText(nextValue);

    window.requestAnimationFrame(() => {
      input.focus();
      const nextCursor = start + emoji.length;
      input.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <Box sx={{ mt: 2, overflowX: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>

      {postErr && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {postErr}
        </Alert>
      )}
      {reactErr && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {reactErr}
        </Alert>
      )}
      {actionErr && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionErr}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handlePost}
        sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}
      >
        <Tooltip
          title={`Posting comment as ${currentUser?.publicName || currentUser?.username || "Guest"}`}
        >
          <Avatar
            src={currentUser?.profilePicture ? `${ApiConfig.serverUrl}/${currentUser.profilePicture}` : undefined}
            sx={{ width: 40, height: 40 }}
          >
            {currentUser?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Tooltip>
        <TextField
          fullWidth
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
          multiline
          minRows={1}
          maxRows={4}
          inputRef={commentInputRef}
          sx={{
            "& .MuiInputBase-root": {
              minHeight: 40,
              alignItems: "center",
              py: 0.25,
            },
            "& .MuiInputBase-inputMultiline": {
              overflow: "auto !important",
              lineHeight: 1.5,
            },
          }}
        />
        <EmojiPickerButton onSelect={insertEmojiAtCursor} buttonSx={{ height: 40 }} />
        <Button
          disableElevation
          variant="contained"
          color="primary"
          size="small"
          type="submit"
          disabled={!text.trim()}
          sx={{ height: 40, whiteSpace: 'nowrap' }}
        >
          Post
        </Button>
      </Box>

      {err && (
        <Typography color="error">
          Unable to load comments: {err}
        </Typography>
      )}

      <Card
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          boxShadow: (theme) => (theme.palette.mode === "light" ? 3 : 0),
        }}
      >
        {loading && <Loading label="Loading comments..." />}
        
        {!loading && !err && comments.length === 0 && (
          <Typography color="text.secondary">No comments yet, it's empty here...</Typography>
        )}

        {orderedComments.map((comment) => (
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
            setReplyText={setReplyText}
            onEditComment={async (...args) => {
              setActionErr(null);
              try {
                await handleEditComment(...args);
              } catch (e) {
                setActionErr(e.message);
              }
            }}
            onDeleteComment={async (...args) => {
              setActionErr(null);
              try {
                await handleDeleteComment(...args);
              } catch (e) {
                setActionErr(e.message);
              }
            }}
            onEditReply={async (...args) => {
              setActionErr(null);
              try {
                await handleEditReply(...args);
              } catch (e) {
                setActionErr(e.message);
              }
            }}
            onDeleteReply={async (...args) => {
              setActionErr(null);
              try {
                await handleDeleteReply(...args);
              } catch (e) {
                setActionErr(e.message);
              }
            }}
            canPinComments={canPinComments}
            pinnedCommentId={pinnedCommentId}
            onPinComment={handlePinComment}
          />
        ))}
      </Card>
      <Dialog
        open={pinWarningOpen}
        onClose={() => {
          setPinWarningOpen(false);
          setPendingPinCommentId(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Replace pinned comment?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            A pinned comment already exists. Pinning this comment will replace the current pinned comment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPinWarningOpen(false);
              setPendingPinCommentId(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={handleConfirmPinReplace}>
            Replace pin
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CommentSection;
