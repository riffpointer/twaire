import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { getRelativeTime } from "../utils/DateUtils.js";
import { parseTimestampToSeconds, seekVideoElementToTimestamp } from "../utils/videoTimestamps.js";
import EmojiPickerButton from "./EmojiPickerButton.jsx";
import VerifiedUserBadge from "./VerifiedUserBadge.jsx";
import { useEffect, useRef, useState } from 'react';

const makeBiIcon = (cls) => ({ fontSize, className = "", ...props }) => (
  <Box component="i" className={`${cls}${fontSize === "small" ? " fs-6" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />
);
const DeleteOutlineIcon = makeBiIcon("bi bi-trash");
const EditOutlinedIcon = makeBiIcon("bi bi-pencil");
const MoreVertIcon = makeBiIcon("bi bi-three-dots-vertical");
const OutlinedFlagIcon = makeBiIcon("bi bi-flag");
const PushPinIcon = makeBiIcon("bi bi-pin-angle");
const ThumbDownIcon = makeBiIcon("bi bi-hand-thumbs-down-fill");
const ThumbDownOffAltIcon = makeBiIcon("bi bi-hand-thumbs-down");
const ThumbUpIcon = makeBiIcon("bi bi-hand-thumbs-up-fill");
const ThumbUpOffAltIcon = makeBiIcon("bi bi-hand-thumbs-up");

function resolveLinkUrl(url) {
  return url.startsWith("www.") ? `https://${url}` : url;
}

function isExternalUrl(url) {
  try {
    return new URL(resolveLinkUrl(url), window.location.origin).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function SpoilerText({ children }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Box
      component="span"
      onClick={() => setRevealed((value) => !value)}
      title={revealed ? "Click to hide spoiler" : "Click to reveal spoiler"}
      sx={{
        cursor: "pointer",
        display: "inline-block",
        px: 0.5,
        borderRadius: 0.75,
        bgcolor: revealed ? "transparent" : (theme) => (
          theme.palette.mode === "dark" ? "rgba(130,130,130,0.45)" : "rgba(170,170,170,0.45)"
        ),
        border: revealed ? "none" : "1px solid",
        borderColor: revealed ? "transparent" : (theme) => (
          theme.palette.mode === "dark" ? "rgba(170,170,170,0.45)" : "rgba(120,120,120,0.45)"
        ),
        color: revealed ? "inherit" : "transparent",
        textShadow: revealed ? "none" : "0 0 6px rgba(0,0,0,0.25)",
        transition: "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
        "&:hover": {
          bgcolor: revealed ? "transparent" : (theme) => (
            theme.palette.mode === "dark" ? "rgba(150,150,150,0.55)" : "rgba(150,150,150,0.55)"
          ),
        },
      }}
    >
      {children}
    </Box>
  );
}

function CommentTextContent({ text, onExternalLinkClick, onTimestampClick }) {
  const source = String(text || "");
  const tokenPattern = /(\|\|[\s\S]+?\|\|)|(@[A-Za-z0-9_]+)|(https?:\/\/[^\s<]+|www\.[^\s<]+)|(\b\d{1,2}:[0-5]\d\b)/g;
  const trailingPunctuationPattern = /[.,!?;:)+\]]+$/;

  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`text-${lastIndex}`}>{source.slice(lastIndex, match.index)}</span>,
      );
    }

    const token = match[0];
    const isSpoiler = token.startsWith("||") && token.endsWith("||");
    const isMention = token.startsWith("@");
    const isTimestamp = !isSpoiler && !isMention && /^\d{1,2}:[0-5]\d$/.test(token);
    const rawUrl = isMention || isSpoiler || isTimestamp ? null : token;

    if (isSpoiler) {
      const spoilerText = token.slice(2, -2);
      nodes.push(
        <SpoilerText key={`${token}-${match.index}`}>
          {spoilerText}
        </SpoilerText>,
      );
      lastIndex = match.index + token.length;
      continue;
    }

    const punctuationMatch = isMention || isTimestamp ? null : rawUrl.match(trailingPunctuationPattern);
    const punctuation = punctuationMatch ? punctuationMatch[0] : "";
    const linkText = punctuation ? rawUrl.slice(0, -punctuation.length) : rawUrl;

    if (isMention) {
      const username = token.slice(1);
      nodes.push(
        <Typography
          key={`${token}-${match.index}`}
          component={Link}
          to={`/user/${username}`}
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {token}
        </Typography>,
      );
    } else if (isTimestamp) {
      const seconds = parseTimestampToSeconds(token);
      nodes.push(
        <Typography
          key={`${token}-${match.index}`}
          component="button"
          type="button"
          title={`Click to jump to ${token}`}
          onClick={() => {
            if (Number.isFinite(seconds)) {
              onTimestampClick?.(seconds);
            }
          }}
          sx={{
            border: 0,
            p: 0,
            m: 0,
            bgcolor: "transparent",
            color: "primary.main",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline",
            font: "inherit",
            lineHeight: "inherit",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {token}
        </Typography>,
      );
    } else {
      const href = resolveLinkUrl(linkText);
      nodes.push(
        <Typography
          key={`${token}-${match.index}`}
          component="a"
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(event) => onExternalLinkClick?.(event, href)}
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: 500,
            wordBreak: "break-word",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {linkText}
        </Typography>,
      );
    }

    if (punctuation) {
      nodes.push(
        <span key={`punct-${match.index}`}>{punctuation}</span>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < source.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{source.slice(lastIndex)}</span>);
  }

  return nodes;
}

function ExpandableCommentText({ text, onExternalLinkClick, onTimestampClick }) {
  const [expanded, setExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const contentRef = useRef(null);

  const measureOverflow = () => {
    const element = contentRef.current;
    if (!element) return;

    const hasOverflow = element.scrollHeight > element.clientHeight + 1;
    setShowReadMore(hasOverflow);
  };

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useEffect(() => {
    if (expanded) {
      setShowReadMore(false);
      return undefined;
    }

    measureOverflow();
    const element = contentRef.current;
    if (!element) return undefined;

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => measureOverflow());

    resizeObserver?.observe(element);

    const onWindowResize = () => measureOverflow();
    window.addEventListener("resize", onWindowResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, [expanded, text]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        ref={contentRef}
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
        }}
      >
        <CommentTextContent
          text={text}
          onExternalLinkClick={onExternalLinkClick}
          onTimestampClick={onTimestampClick}
        />
      </Box>
      {!expanded && showReadMore && (
        <Button
          variant="text"
          size="small"
          onClick={() => setExpanded(true)}
          sx={{
            mt: 0.25,
            minWidth: 0,
            p: 0,
            color: "primary.main",
            fontWeight: 600,
            textTransform: "none",
            alignSelf: "flex-start",
            "&:hover": {
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          Read more
        </Button>
      )}
    </Box>
  );
}

function ExternalLinkWarningDialog({ open, url, onClose, onContinue }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Leave Twaire?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This link opens an external website:
        </DialogContentText>
        <DialogContentText sx={{ mt: 1, wordBreak: "break-word" }}>
          {url}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onContinue}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReportDialog({ open, onClose, onSubmit, targetLabel }) {
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("spam");
      setDetails("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Report {targetLabel}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Tell us why you are reporting this {targetLabel}. This currently opens a local reporting flow only.
        </DialogContentText>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="report-reason-label">Reason</InputLabel>
          <Select
            labelId="report-reason-label"
            label="Reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          >
            <MenuItem value="spam">Spam or misleading</MenuItem>
            <MenuItem value="harassment">Harassment or bullying</MenuItem>
            <MenuItem value="hate">Hateful or abusive</MenuItem>
            <MenuItem value="sexual">Sexual or inappropriate</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          label="Additional details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Optional context"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={() => onSubmit({ reason, details })}>
          Submit report
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CommentActionsMenu({ ownedByCurrentUser, canPin, isPinned, onEdit, onDelete, onReport, onPin }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {ownedByCurrentUser ? (
          [
            <MenuItem
              key="edit"
              onClick={() => {
                handleClose();
                onEdit();
              }}
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                handleClose();
                onDelete();
              }}
            >
              <ListItemIcon>
                <DeleteOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
              </MenuItem>,
            canPin ? (
              <MenuItem
                key="pin"
                onClick={() => {
                  handleClose();
                  onPin();
                }}
                disabled={isPinned}
              >
                <ListItemIcon>
                  <PushPinIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{isPinned ? "Pinned comment" : "Pin comment"}</ListItemText>
              </MenuItem>
            ) : null,
          ]
        ) : (
          [
            canPin ? (
              <MenuItem
                key="pin"
                onClick={() => {
                  handleClose();
                  onPin();
                }}
                disabled={isPinned}
              >
                <ListItemIcon>
                  <PushPinIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{isPinned ? "Pinned comment" : "Pin comment"}</ListItemText>
              </MenuItem>
            ) : null,
            <MenuItem
              key="report"
              onClick={() => {
                handleClose();
                onReport();
              }}
              sx={{
                color: (theme) => theme.palette.mode === "dark" ? "#ffd54f" : "#9a6b00",
              }}
            >
              <ListItemIcon>
                <OutlinedFlagIcon
                  fontSize="small"
                  sx={{
                    color: (theme) => theme.palette.mode === "dark" ? "#ffd54f" : "#9a6b00",
                  }}
                />
              </ListItemIcon>
              <ListItemText>Report</ListItemText>
            </MenuItem>,
          ]
        )}
      </Menu>
    </>
  );
}

function EditableTextBlock({ initialText, onSave, onCancel, label, submitting }) {
  const [value, setValue] = useState(initialText);

  return (
    <Card
      variant="outlined"
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
      sx={{ p: 1.5, mt: 1, width: "100%" }}
    >
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        size="small"
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitting}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button type="submit" variant="contained" size="small" disabled={submitting || !value.trim()}>
          Save
        </Button>
        <Button type="button" variant="text" size="small" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </Box>
    </Card>
  );
}

function ReplyComposer({
  currentUser,
  replyText,
  onReplyTextChange,
  onReplyCancel,
  onSubmit,
  submitting,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }, [replyText]);

  const handleInsertEmoji = (emoji) => {
    const textarea = inputRef.current;
    const currentValue = replyText || "";
    if (!textarea || typeof textarea.selectionStart !== "number") {
      onReplyTextChange({ target: { value: `${currentValue}${emoji}` } });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
    onReplyTextChange({ target: { value: nextValue } });

    window.requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + emoji.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <Card
      variant="outlined"
      component="form"
      onSubmit={onSubmit}
      sx={{ p: 1.5, mt: 1, display: "flex", width: "100%" }}
    >
      <Avatar
        src={currentUser?.profilePicture && `${ApiConfig.serverUrl}/${currentUser.profilePicture}`}
        alt="User"
        sx={{ width: 32, height: 32, mr: 2, mt: 1 }}
        title={`Commenting as ${currentUser?.publicName || currentUser?.username || "User"}`}
      />
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <TextField
          size="small"
          label="Write a reply..."
          value={replyText}
          onChange={onReplyTextChange}
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          sx={{
            mb: 1,
            "& .MuiInputBase-root": {
              alignItems: "center",
              py: 0.5,
            },
            "& .MuiInputBase-inputMultiline": {
              overflow: "auto !important",
              lineHeight: 1.5,
              paddingLeft: 0,
              paddingRight: 0,
            },
          }}
          inputRef={inputRef}
          disabled={submitting}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Button disableElevation variant="contained" size="small" type="submit" disabled={submitting}>
            Post Reply
          </Button>
          <Button variant="text" size="small" onClick={onReplyCancel} disabled={submitting}>
            Cancel
          </Button>
          <Box sx={{ ml: "auto" }}>
            <EmojiPickerButton onSelect={handleInsertEmoji} disabled={submitting} buttonSx={{ height: 32 }} />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function Comment({ 
  comment, 
  likedComments, 
  dislikedComments, 
  onToggle, 
  replyingTo, 
  replyText, 
  onReplyTextChange, 
  onReplySubmit, 
  onReplyCancel, 
  setReplyingTo, 
  setReplyText,
  currentUser,
  onEditComment,
  onDeleteComment,
  onEditReply,
  onDeleteReply,
  canPinComments = false,
  pinnedCommentId = null,
  onPinComment,
}) {
  const commentAuthorUsername = comment.user.username || "Deleted User";
  const commentAuthorPublicName = comment.user.publicName || commentAuthorUsername;
  const commentAuthorProfilePicture = comment.user.profilePicture && `${ApiConfig.serverUrl}/${comment.user.profilePicture}`;
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTargetLabel, setReportTargetLabel] = useState("comment");
  const [reportSuccessOpen, setReportSuccessOpen] = useState(false);
  const [externalLinkDialogOpen, setExternalLinkDialogOpen] = useState(false);
  const [pendingExternalLink, setPendingExternalLink] = useState("");
  const isPinned = pinnedCommentId === comment._id;

  const isCommentOwner = currentUser?._id === comment.user?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onReplySubmit(e, comment._id);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExternalLinkClick = (event, href) => {
    if (!isExternalUrl(href)) return;

    event.preventDefault();
    event.stopPropagation();
    setPendingExternalLink(href);
    setExternalLinkDialogOpen(true);
  };

  const handleContinueExternalLink = () => {
    if (pendingExternalLink) {
      window.open(pendingExternalLink, "_blank", "noopener,noreferrer");
    }
    setPendingExternalLink("");
    setExternalLinkDialogOpen(false);
  };

  const handlePinComment = () => {
    onPinComment?.(comment._id);
  };

  const handleTimestampClick = (seconds) => {
    seekVideoElementToTimestamp("main-video-player", seconds);
  };

  const commentMeta = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Typography
              component={Link}
              to={`/user/${comment.user?.username}`}
          sx={{
            mr: 0.5,
            textDecoration: 'none',
            fontWeight: 'bold',
            color: 'text.primary',
            display: "flex",
            alignItems: "center"
          }}
        >
          {commentAuthorPublicName}
          <VerifiedUserBadge user={comment.user} />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getRelativeTime(comment.createdAt)}
          {comment.isEdited && ' (edited)'}
        </Typography>
        {isPinned && (
          <Box
            sx={{
              ml: 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "warning.main",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <PushPinIcon sx={{ fontSize: 14 }} />
            Pinned
          </Box>
        )}
      </Box>
      {currentUser && (
        <CommentActionsMenu
          ownedByCurrentUser={isCommentOwner}
          canPin={canPinComments}
          isPinned={isPinned}
          onEdit={() => setEditingComment(true)}
          onDelete={() => onDeleteComment(comment._id)}
          onPin={handlePinComment}
          onReport={() => {
            setReportTargetLabel("comment");
            setReportDialogOpen(true);
          }}
        />
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
        <Avatar
          src={commentAuthorProfilePicture}
          alt={comment.user.publicName}
          sx={{ width: 40, height: 40, mr: 1.25, mt: 0.25 }}
        />
        <Box sx={{ flex: 1 }}>
          {commentMeta}

          {editingComment ? (
            <EditableTextBlock
              initialText={comment.text}
              label="Edit comment"
              submitting={submitting}
              onCancel={() => setEditingComment(false)}
              onSave={async (value) => {
                setSubmitting(true);
                try {
                  await onEditComment(comment._id, value);
                  setEditingComment(false);
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          ) : (
            <Box sx={{ mb: 0.4 }}>
              <ExpandableCommentText
                text={comment.text}
                onExternalLinkClick={handleExternalLinkClick}
                onTimestampClick={handleTimestampClick}
              />
            </Box>
          )}

          {!editingComment && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                typography: 'body2',
                color: 'text.secondary',
                ml: -1
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
          )}

          <Collapse in={replyingTo === comment._id} timeout={180} unmountOnExit>
            <ReplyComposer
              currentUser={currentUser}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onReplyCancel={onReplyCancel}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </Collapse>

          {Array.isArray(comment.replies) && comment.replies.length > 0 && (
            <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
              {comment.replies.map((reply) => {
                const isReplyOwner = currentUser?._id === reply.user?._id;
                const replyProfilePicture =
                  reply.user.profilePicture && `${ApiConfig.serverUrl}/${reply.user.profilePicture}`;

                return (
                  <Box key={reply._id} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                    <Avatar
                      src={replyProfilePicture}
                      alt={reply.user.publicName}
                      sx={{ width: 32, height: 32, mr: 1.25, mt: 0.25 }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        opacity: reply._pending ? 0.72 : 1,
                        animation: reply._pending ? "commentReplyPulse 0.9s ease-in-out infinite alternate" : "none",
                        "@keyframes commentReplyPulse": {
                          from: { opacity: 0.52 },
                          to: { opacity: 0.92 },
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: 'center', justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: 'center', gap: 0.4 }}>
                          <Typography
                            component={Link}
                            to={`/user/${reply.user?.username}`}
                            sx={{
                              textDecoration: 'none',
                              fontWeight: 'bold',
                              color: 'text.primary',
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            {reply.user?.publicName || reply.user?.username || 'Deleted User'}
                            <VerifiedUserBadge user={reply.user} />
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getRelativeTime(reply.createdAt)}
                            {reply.isEdited && ' (edited)'}
                          </Typography>
                        </Box>
                        {currentUser && !reply._pending && (
                          <CommentActionsMenu
                            ownedByCurrentUser={isReplyOwner}
                            onEdit={() => setEditingReplyId(reply._id)}
                            onDelete={() => onDeleteReply(comment._id, reply._id)}
                            onReport={() => {
                              setReportTargetLabel("reply");
                              setReportDialogOpen(true);
                            }}
                          />
                        )}
                      </Box>

                      {editingReplyId === reply._id ? (
                        <EditableTextBlock
                          initialText={reply.text}
                          label="Edit reply"
                          submitting={submitting}
                          onCancel={() => setEditingReplyId(null)}
                          onSave={async (value) => {
                            setSubmitting(true);
                            try {
                              await onEditReply(comment._id, reply._id, value);
                              setEditingReplyId(null);
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                        />
                      ) : (
                        <Box sx={{ mb: 0.5 }}>
                          <ExpandableCommentText
                            text={reply.text}
                            onExternalLinkClick={handleExternalLinkClick}
                            onTimestampClick={handleTimestampClick}
                          />
                        </Box>
                      )}

                      {editingReplyId !== reply._id && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.4,
                            typography: 'body2',
                            color: 'text.secondary',
                            ml: -1
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => onToggle(reply._id, 'like')}
                            color={likedComments.has(reply._id) ? 'primary' : 'default'}
                            disabled={reply._pending}
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
                            disabled={reply._pending}
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
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setReplyingTo(replyingTo === reply._id ? null : reply._id);
                              setReplyText(`@${reply.user.username} `);
                            }}
                            disabled={reply._pending}
                          >
                            Reply
                          </Button>
                        </Box>
                      )}

                      <Collapse in={replyingTo === reply._id} timeout={180} unmountOnExit>
                        <ReplyComposer
                          currentUser={currentUser}
                          replyText={replyText}
                          onReplyTextChange={onReplyTextChange}
                          onReplyCancel={onReplyCancel}
                          onSubmit={handleSubmit}
                          submitting={submitting}
                        />
                      </Collapse>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetLabel={reportTargetLabel}
        onSubmit={() => {
          setReportDialogOpen(false);
          setReportSuccessOpen(true);
        }}
      />
      <ExternalLinkWarningDialog
        open={externalLinkDialogOpen}
        url={pendingExternalLink}
        onClose={() => {
          setExternalLinkDialogOpen(false);
          setPendingExternalLink("");
        }}
        onContinue={handleContinueExternalLink}
      />
      <Snackbar
        open={reportSuccessOpen}
        autoHideDuration={3200}
        onClose={() => setReportSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setReportSuccessOpen(false)} severity="warning" variant="filled">
          Report submitted.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Comment;
