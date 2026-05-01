import { ContentContainer } from "@/components/Containers.jsx";
import Footer from "@/components/Footer.jsx";
import VideoCard from "@/components/VideoCard.jsx";
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
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden placeholder-glow">
            <div className="placeholder d-block w-100" style={{ height: 180 }} />
            <div className="card-body p-3">
              <div className="placeholder rounded col-10 mb-2" style={{ height: 22 }} />
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className="placeholder rounded-circle" style={{ width: 24, height: 24 }} />
                <div className="placeholder rounded col-7" style={{ height: 16 }} />
              </div>
            </div>
          </div>
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
        <h1 className="h3 fw-bold mb-1"><i className="bi bi-rss me-2" aria-hidden="true" />Subscriptions</h1>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <p className="text-body-secondary mb-0">Latest videos from channels you subscribe to.</p>
          <select className="form-select form-select-sm" style={{ minWidth: 150 }} value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recent">Recent videos</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div style={{ position: "relative", minHeight: 320 }}>
          <div style={{ opacity: showSkeletons && !requiresAuth ? 1 : 0, transition: "opacity 180ms ease-out", pointerEvents: "none", position: showSkeletons ? "relative" : "absolute", inset: 0 }}>
            <VideoGridSkeleton />
          </div>
          <div style={{ opacity: !showSkeletons && !loading ? 1 : 0, transition: "opacity 180ms ease-out" }}>
            {!loading && requiresAuth && (
              <div className="alert alert-info d-flex justify-content-between align-items-center gap-3">
                <span>Please log in to see your subscriptions feed.</span>
                <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
              </div>
            )}

            {!loading && !requiresAuth && !error && videos.length === 0 && (
              <p className="text-body-secondary">
                No videos yet from your subscriptions.
              </p>
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
          </div>
        </div>

        {error && <p className="text-danger">Error: {error}</p>}
      </div>
      <Footer />
    </ContentContainer>
  );
}

export default Subscriptions;
