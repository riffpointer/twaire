import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import VideoCard from "./VideoCard.jsx";

function PublicVideosListSkeleton({ count = 5 }) {
  return (
    <div className="d-flex flex-column gap-3">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="card h-100 border-0 shadow-sm overflow-hidden">
          <div className="bg-light-subtle skeleton-shimmer" style={{ paddingTop: '56.25%' }}></div>
          <div className="card-body p-2 px-1">
            <div className="bg-light-subtle skeleton-shimmer mb-2 rounded" style={{ height: '24px', width: '88%' }}></div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <div className="bg-light-subtle skeleton-shimmer rounded-circle" style={{ width: '24px', height: '24px' }}></div>
              <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '16px', width: '42%' }}></div>
              <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '16px', width: '22%' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">
          {sort === "latest" ? "Latest uploads" : "Trending now"}
        </h6>
        <select 
          className="form-select form-select-sm w-auto shadow-none" 
          style={{ minWidth: '110px' }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="trending">Trending</option>
        </select>
      </div>

      {loading ? (
        <PublicVideosListSkeleton count={limit ?? 5} />
      ) : videos.length === 0 ? (
        <p className="text-muted small">No videos available.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }) }}
              className="text-decoration-none text-reset"
            >
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  );
}

export default PublicVideosList;
