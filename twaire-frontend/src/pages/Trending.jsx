import { ContentContainer } from "@/components/Containers.jsx";
import Footer from "@/components/Footer.jsx";
import VideoCard from "@/components/VideoCard.jsx";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";

const MIN_SKELETON_MS = 250;

function VideoGridSkeleton({ count = 8 }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="col">
          <div className="card h-100 border-0 shadow-sm overflow-hidden">
            <div className="bg-light-subtle skeleton-shimmer" style={{ height: '180px' }}></div>
            <div className="card-body p-2 px-1">
              <div className="bg-light-subtle skeleton-shimmer mb-2 rounded" style={{ height: '20px', width: '82%' }}></div>
              <div className="d-flex align-items-center gap-2 mt-1">
                <div className="bg-light-subtle skeleton-shimmer rounded-circle" style={{ width: '24px', height: '24px' }}></div>
                <div className="bg-light-subtle skeleton-shimmer rounded" style={{ height: '16px', width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trending - Twaire";
    const fetchTrending = async () => {
      const requestStartedAt = Date.now();
      try {
        setError(null);
        setLoading(true);
        setShowSkeletons(true);

        const res = await fetch(`${ApiConfig.serverUrl}/api/videos/`);
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
        const elapsed = Date.now() - requestStartedAt;
        const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
        window.setTimeout(() => setShowSkeletons(false), remaining);
      }
    };

    fetchTrending();
  }, []);

  return (
    <>
      <ContentContainer>
        <div className="d-flex align-items-center gap-3 mb-3">
          <i className="bi bi-fire text-danger" style={{ fontSize: '2.5rem' }}></i>
          <div>
            <h1 className="h3 fw-bold mb-0">Trending Videos</h1>
            <p className="text-muted mb-0">
              These videos are going viral, take a look at them!
            </p>
          </div>
        </div>

        <div className="position-relative" style={{ minHeight: '320px' }}>
          <div 
            className={`position-absolute w-100 transition-opacity duration-200 ${showSkeletons ? 'opacity-100' : 'opacity-0'}`}
            style={{ zIndex: showSkeletons ? 1 : -1, pointerEvents: 'none' }}
          >
            <VideoGridSkeleton />
          </div>
          
          <div className={`transition-opacity duration-200 ${!showSkeletons && !loading ? 'opacity-100' : 'opacity-0'}`}>
            {!loading && !error && videos.length === 0 && (
              <p className="text-muted">No trending videos found.</p>
            )}

            {!loading && !error && videos.length > 0 && (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
                {videos.map((video) => (
                  <div key={video._id} className="col">
                    <Link to={`/watch/${video._id}`} className="text-decoration-none text-reset">
                      <VideoCard video={video} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-danger mt-4">Error: {error}</p>}
      </ContentContainer>
      <Footer />
      
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
        .transition-opacity { transition: opacity 0.2s ease-in-out; }
        .duration-200 { transition-duration: 200ms; }
      `}} />
    </>
  );
}

export default Trending;
