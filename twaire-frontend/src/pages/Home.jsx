import Footer from '../components/Footer.jsx';
import Strings from '../utils/Strings.js';
import VideoCard from '../components/VideoCard.jsx';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import Loading from '../components/Loading.jsx';
import { Box, Container, Divider, MenuItem, Skeleton, TextField, Typography } from '@mui/material';


function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    document.title = "Home - Twaire";
    fetchVideos(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const fetchVideos = async (sortOption) => {
    try {
      setLoading(true);
      const res = await fetch(`${ApiConfig.serverUrl}/api/videos?sort=${sortOption}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner*/}
      <Box sx={{ width: "100%", mb: 4, mt: -4 }}>
        {!bannerLoaded && <Skeleton variant="rectangular" width="100%" height={360} />}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Banner"
          style={{ width: "100%", display: bannerLoaded ? "block" : "none" }}
          onLoad={() => setBannerLoaded(true)}
        />
      </Box>

      <Box sx={{px:{xs:2,md:6}}}>
        <Typography variant="h2" sx={{mb: 1, fontWeight: 'bold'}}>
          Welcome to Twaire!
        </Typography>
        <Typography variant="subtitle1">
          Twaire is an open platform where you can share your vlogs, videos and much more!
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
            sx={{ width: 'auto', minWidth: 120 }}
          >
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="trending">Trending</MenuItem>
          </TextField>
        </div>

        <div className="mb-3">
          {loading ? (
            <Loading label="Loading videos" />
          ) : videos.length === 0 ? (
            <p>No videos uploaded yet.</p>
          ) : (
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
          )}
        </div>
      </Box>
      <Footer />
    </>
  );
}

export default Home;
