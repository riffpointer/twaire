import { MenuItem, TextField, Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.jsx";
import VideoCard from "./VideoCard.jsx";
import Loading from "./Loading.jsx";

function PublicVideosList({ defaultSort = "trending", limit }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(defaultSort);

  useEffect(() => {
    fetchVideos(sort);
  }, [sort]);

  const fetchVideos = async (sortOption) => {
    try {
      setLoading(true);
      let url = `${ApiConfig.serverUrl}/api/videos?sort=${sortOption}`;
      if (limit) url += `&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load videos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {sort === "latest" ? "Latest uploads" : "Trending now"}
        </Typography>
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
      </Box>

      {loading ? (
        <Loading label="Loading videos..." />
      ) : videos.length === 0 ? (
        <Typography>No videos available.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }) }}
              style={{ textDecoration: "none", color: "inherit", userSelect: "none" }}
            >
              <VideoCard video={video} />
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default PublicVideosList;
