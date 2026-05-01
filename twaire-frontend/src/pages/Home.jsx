import Footer from "@/components/Footer.jsx";
import VideoCard from "@/components/VideoCard.jsx";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { ContentContainer } from "@/components/Containers.jsx";

const MIN_SKELETON_MS = 250;

function VideoGridSkeleton({ count = 8 }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-2">
      {[...Array(count)].map((_, index) => (
        <div className="col mt-0 mb-4" key={index}>
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
      <div className="w-100 mb-5 mt-n4">
        {!bannerLoaded && (
          <div className="w-100 bg-light-subtle skeleton-shimmer" style={{ height: '360px' }}></div>
        )}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Banner"
          className="w-100 d-block"
          style={{ display: bannerLoaded ? "block" : "none", maxHeight: '400px', objectFit: 'cover' }}
          onLoad={() => setBannerLoaded(true)}
        />
      </div>

      <ContentContainer>
        <h1 className="display-4 fw-bold mb-2">Welcome to Twaire!</h1>
        <p className="lead text-muted mb-4">
          Twaire is an open platform where you can share your vlogs, videos and much more!
        </p>
        <hr className="my-4 opacity-25" />

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0 fw-bold">
            {sort === "latest" ? "Latest uploads" : "Trending now"}
          </h2>
          <select 
            className="form-select form-select-sm w-auto" 
            style={{ minWidth: '120px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div className="mb-5 position-relative" style={{ minHeight: '320px' }}>
          <div
            className={`transition-opacity duration-200 ${showSkeletons ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              pointerEvents: 'none',
              position: showSkeletons ? 'relative' : 'absolute',
              inset: 0,
              zIndex: showSkeletons ? 1 : -1
            }}
          >
            <VideoGridSkeleton />
          </div>

          <div
            className={`transition-opacity duration-200 ${!showSkeletons && !loading ? 'opacity-100' : 'opacity-0'}`}
          >
            {!loading && videos.length === 0 ? (
              <p className="text-muted">No videos uploaded yet.</p>
            ) : (
              !loading && (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-2">
                  {videos.map((video) => (
                    <div className="col mt-0 mb-4" key={video._id}>
                      <Link
                        to={`/watch/${video._id}`}
                        className="text-decoration-none text-reset"
                      >
                        <VideoCard video={video} />
                      </Link>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </ContentContainer>

      <Footer />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .mt-n4 { margin-top: -1.5rem !important; }
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

export default Home;
