import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import YouTubeIcon from "@mui/icons-material/YouTube";
import GitHubIcon from "@mui/icons-material/GitHub";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import RedditIcon from "@mui/icons-material/Reddit";
import ForumIcon from "@mui/icons-material/Forum";
import { useEffect, useState } from "react";
import ApiConfig from "../utils/ApiConfig.js";
import UserAvatar from "./UserAvatar.jsx";
import VerifiedUserBadge from "./VerifiedUserBadge.jsx";

function getLinkIcon(url) {
  try {
    const absolute = url.startsWith("http") ? url : `https://${url}`;
    const hostname = new URL(absolute).hostname;
    if (hostname.includes("youtube")) return <YouTubeIcon fontSize="inherit" />;
    if (hostname.includes("github")) return <GitHubIcon fontSize="inherit" />;
    if (hostname.includes("instagram")) return <InstagramIcon fontSize="inherit" />;
    if (hostname.includes("linkedin")) return <LinkedInIcon fontSize="inherit" />;
    if (hostname.includes("facebook")) return <FacebookIcon fontSize="inherit" />;
    if (hostname.includes("reddit")) return <RedditIcon fontSize="inherit" />;
    if (hostname.includes("discord") || hostname.includes("twitch")) return <ForumIcon fontSize="inherit" />;
    return <LanguageIcon fontSize="inherit" />;
  } catch {
    return <LanguageIcon fontSize="inherit" />;
  }
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

function UserHeader({ user, children }) {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [externalLinkDialogOpen, setExternalLinkDialogOpen] = useState(false);
  const [pendingExternalLink, setPendingExternalLink] = useState("");
  const hasBanner = Boolean(user?.banner);
  const hasBio = Boolean(user?.bio);
  const bannerUrl = hasBanner ? `${ApiConfig.serverUrl}/${user.banner}` : null;

  useEffect(() => {
    setBannerLoaded(false);
  }, [bannerUrl]);

  const handleBannerLinkClick = (event, url) => {
    event.preventDefault();
    event.stopPropagation();
    setPendingExternalLink(url);
    setExternalLinkDialogOpen(true);
  };

  const handleContinueExternalLink = () => {
    if (pendingExternalLink) {
      window.open(pendingExternalLink, "_blank", "noopener,noreferrer");
    }
    setPendingExternalLink("");
    setExternalLinkDialogOpen(false);
  };

  return (
    <Paper elevation={2} sx={{ overflow: "hidden" }}>
      {hasBanner && (
        <Box sx={{ position: "relative", width: "100%", height: 260, bgcolor: "grey.300" }}>
          {!bannerLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={260}
              sx={{ position: "absolute", inset: 0 }}
            />
          )}
          <Box
            component="img"
            src={bannerUrl}
            alt={`${user.publicName || user.username} channel banner`}
            sx={{
              width: "100%",
              height: 260,
              objectFit: "cover",
              display: "block",
              opacity: bannerLoaded ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
            onLoad={() => setBannerLoaded(true)}
            onError={() => setBannerLoaded(false)}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.14) 34%, rgba(0,0,0,0.34) 68%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexDirection: "row",
              }}
            >
              <UserAvatar
                user={user}
                size={112}
                sx={{
                  flexShrink: 0,
                  border: "4px solid",
                  borderColor: "rgba(24,24,24,0.92)",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
                  width: { xs: 80, sm: 112 },
                  height: { xs: 80, sm: 112 },
                }}
              />
              <Box sx={{ color: "common.white", minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    mb: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                  }}
                >
                  {user.publicName || user.username}
                  <VerifiedUserBadge user={user} sx={{ fontSize: 24 }} />
                </Typography>
                <Typography sx={{ mb: 0.5, color: "rgba(255,255,255,0.84)" }}>
                  @{user.username}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "rgba(255,255,255,0.84)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.35)",
                  }}
                >
                  {user.subscribers || 0} subscriber{user.subscribers == 1 || "s"} &bull;&nbsp;
                  {user.accountViews || user.views || 0} channel views
                </Typography>
                {children}
              </Box>
            </Box>
            {Array.isArray(user?.links) && user.links.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 0.75,
                  pointerEvents: "auto",
                }}
              >
                {user.links.map((link, index) => (
                  <Button
                    key={`banner-link-${index}`}
                    component="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => handleBannerLinkClick(event, link.url)}
                    variant="text"
                    size="small"
                    startIcon={
                      <Box component="span" sx={{ minWidth: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {getLinkIcon(link.url)}
                      </Box>
                    }
                    sx={{
                      color: "common.white",
                      justifyContent: "flex-end",
                      minWidth: 0,
                      px: 1,
                      py: 0.25,
                      textTransform: "none",
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.24)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.16)",
                        textDecoration: "none",
                      },
                    }}
                  >
                    {link.title}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box
        sx={{
          p: hasBio || !hasBanner ? 2 : 0,
          pt: hasBanner ? (hasBio ? 2 : 0) : 3,
        }}
      >
        {!hasBanner && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <UserAvatar user={user} size={112} sx={{ mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ mb: 0, display: "flex", alignItems: "center" }}>
                {user.publicName || user.username}
                <VerifiedUserBadge user={user} sx={{ fontSize: 24 }} />
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                @{user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.subscribers || 0} subscriber{user.subscribers == 1 || "s"} &bull;&nbsp;
                {user.accountViews || user.views || 0} channel views
              </Typography>
            </Box>
          </Box>
        )}

        {hasBio && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" component="strong">
              About this channel
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {user.bio}
            </Typography>
          </Paper>
        )}
      </Box>
      <ExternalLinkWarningDialog
        open={externalLinkDialogOpen}
        url={pendingExternalLink}
        onClose={() => {
          setExternalLinkDialogOpen(false);
          setPendingExternalLink("");
        }}
        onContinue={handleContinueExternalLink}
      />
    </Paper>
  );
}

export default UserHeader;
