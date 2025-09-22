import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "./Loading.jsx";
import VideoCard from "./VideoCard.jsx";

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
    <div className="public-videos-list">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">{sort === "latest" ? "Latest uploads" : "Trending now"}</h5>
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

      {loading ? (
        <Loading label="Loading videos..." />
      ) : videos.length === 0 ? (
        <p>No videos available.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              style={{ textDecoration: "none", color: "inherit", userSelect: "none" }}
            >
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicVideosList;
