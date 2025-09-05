import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoCard from "../components/VideoCard.jsx";

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trending - Twaire";
    const fetchTrending = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch("http://localhost:5000/api/videos/");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch trending videos");
        }
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <h2><i class="bi bi-fire"></i> Trending Videos</h2>
        <p className="mb-1">Have a look at the latest trending videos!</p>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">Error: {error}</p>}

        {!loading && !error && videos.length === 0 && (
          <p className="text-muted">No trending videos found.</p>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
          {videos.map((video) => (
            <div key={video._id} className="col">
              <Link
                to={`/watch/${video._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <VideoCard
                  title={video.title}
                  channel={video.channel}
                  views={video.views || 0}
                  thumbnail={video.thumbnail}
                  description={video.description}
                  verified={video.verified}
                  uploadedAt={video.uploadedAt}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Trending;
