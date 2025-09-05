import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VideoCard from "./VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
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
        <select
          className="form-select form-select-sm w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="trending">Trending</option>
        </select>
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
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <VideoCard
                title={video.title}
                channel={video.channel || "Deleted User"}
                views={video.views ?? 0}
                thumbnail={video.thumbnail}
                description={video.description}
                uploadedAt={video.uploadedAt}
                verified={video.verified}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicVideosList;
