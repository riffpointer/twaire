import { ContentContainer } from "@/components/Containers.jsx";
import Footer from "@/components/Footer.jsx";
import VideoCard from "@/components/VideoCard.jsx";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import { Alert, Box, Button, MenuItem, Skeleton, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { NoLinkStyling } from "@/styles/LinkStyles.jsx";

const MIN_SKELETON_MS = 250;

function VideoGridSkeleton({ count = 8 }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="col">
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Skeleton variant="rectangular" height={180} />
            <Box sx={{ p: 1.5 }}>
              <Skeleton variant="text" width="82%" height={34} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="62%" height={22} />
              </Box>
            </Box>
          </Box>
        </div>
      ))}
    </div>
  );
}

function Subscriptions() {
  const [videos, setVideos] = useState([]);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [error, setError] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    document.title = "Subscriptions - Twaire";
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      const requestStartedAt = Date.now();
      try {
        setLoading(true);
        setShowSkeletons(true);
        setError(null);
        setRequiresAuth(false);

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/subscriptions/feed?sort=${sort}`,
          { credentials: "include" },
        );

        if (res.status === 401) {
          setRequiresAuth(true);
          setVideos([]);
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch subscriptions feed");
        }

        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch subscriptions feed");
      } finally {
        setLoading(false);
        const elapsed = Date.now() - requestStartedAt;
        const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
        window.setTimeout(() => setShowSkeletons(false), remaining);
      }
    };

    fetchFeed();
  }, [sort]);

  return (
    <ContentContainer>
      <div>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          <SubscriptionsIcon sx={{ mb: 2, fontSize: 46 }} /> Subscriptions
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 0 }}>
            Latest videos from channels you subscribe to.
          </Typography>
          <TextField
            select
            size="small"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="recent">Recent videos</MenuItem>
            <MenuItem value="trending">Trending</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ position: "relative", minHeight: 320 }}>
          <Box
            sx={{
              opacity: showSkeletons && !requiresAuth ? 1 : 0,
              transition: "opacity 180ms ease-out",
              pointerEvents: "none",
              position: showSkeletons ? "relative" : "absolute",
              inset: 0,
            }}
          >
            <VideoGridSkeleton />
          </Box>
          <Box
            sx={{
              opacity: !showSkeletons && !loading ? 1 : 0,
              transition: "opacity 180ms ease-out",
            }}
          >
            {!loading && requiresAuth && (
              <Alert
                severity="info"
                action={
                  <Button component={Link} to="/login" color="inherit" size="small">
                    Login
                  </Button>
                }
              >
                Please log in to see your subscriptions feed.
              </Alert>
            )}

            {!loading && !requiresAuth && !error && videos.length === 0 && (
              <Typography color="text.secondary">
                No videos yet from your subscriptions.
              </Typography>
            )}

            {!loading && !requiresAuth && !error && videos.length > 0 && (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
                {videos.map((video) => (
                  <div key={video._id} className="col">
                    <Link to={`/watch/${video._id}`} style={NoLinkStyling}>
                      <VideoCard video={video} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Box>
        </Box>

        {error && <Typography color="error">Error: {error}</Typography>}
      </div>
      <Footer />
    </ContentContainer>
  );
}

export default Subscriptions;
