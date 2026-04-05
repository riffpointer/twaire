import Footer from "@/components/Footer.jsx";
import Strings from "../utils/Strings.js";
import VideoCard from "@/components/VideoCard.jsx";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import {
  Box,
  Container,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { ContentContainer } from "@/components/Containers.jsx";

const MIN_SKELETON_MS = 250;

function VideoGridSkeleton({ count = 8 }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-2">
      {[...Array(count)].map((_, index) => (
        <div className="col mt-0 mb-4" key={index}>
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

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [sort, setSort] = useState("latest");
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    document.title = "Home - Twaire";
    fetchVideos(sort);
  }, [sort]);

  const fetchVideos = async (sortOption) => {
    const requestStartedAt = Date.now();
    try {
      setLoading(true);
      setShowSkeletons(true);
      const res = await fetch(
        `${ApiConfig.serverUrl}/api/videos?sort=${sortOption}`,
      );
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      const elapsed = Date.now() - requestStartedAt;
      const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
      window.setTimeout(() => setShowSkeletons(false), remaining);
    }
  };

  return (
    <>
      {/* Banner*/}
      <Box sx={{ width: "100%", mb: 4, mt: -4 }}>
        {!bannerLoaded && (
          <Skeleton variant="rectangular" width="100%" height={360} />
        )}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Banner"
          style={{ width: "100%", display: bannerLoaded ? "block" : "none" }}
          onLoad={() => setBannerLoaded(true)}
        />
      </Box>

      <ContentContainer>
        <Typography variant="h2" sx={{ mb: 1, fontWeight: "bold" }}>
          Welcome to Twaire!
        </Typography>
        <Typography variant="subtitle1">
          Twaire is an open platform where you can share your vlogs, videos and
          much more!
        </Typography>
        <Divider sx={{ my: 2 }} />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">
            {sort === "latest" ? "Latest uploads" : "Trending now"}
          </h3>
          <TextField
            select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            variant="outlined"
            sx={{ width: "auto", minWidth: 120 }}
          >
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="trending">Trending</MenuItem>
          </TextField>
        </div>

        <Box sx={{ mb: 3, position: "relative", minHeight: 320 }}>
          <Box
            sx={{
              opacity: showSkeletons ? 1 : 0,
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
            {!loading && videos.length === 0 ? (
              <p>No videos uploaded yet.</p>
            ) : (
              !loading && (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-2">
                  {videos.map((video) => (
                    <div className="col mt-0 mb-4" key={video._id}>
                      <Link
                        to={`/watch/${video._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <VideoCard video={video} />
                      </Link>
                    </div>
                  ))}
                </div>
              )
            )}
          </Box>
        </Box>
      </ContentContainer>

      <Footer />
    </>
  );
}

export default Home;
