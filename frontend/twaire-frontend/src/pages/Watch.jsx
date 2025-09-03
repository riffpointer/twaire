import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import PublicVideosList from "../components/PublicVideosList.jsx";
import { getRelativeTime } from "../utils/DateUtils.jsx";
import CommentSection from "../components/CommentSection.jsx";

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [uploaderSubs, setUploaderSubs] = useState(0);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/videos/${id}/view`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch video");
        const data = await res.json();
        setVideo(data);
        document.title = `${data.title} - Twaire`;

        if (data.uploaderId) {
          // check subscription status
          const subRes = await fetch(
            `http://localhost:5000/api/users/${data.uploaderId}/isSubscribed`,
            { credentials: "include" }
          );
          if (subRes.ok) {
            const subData = await subRes.json();
            setSubscribed(subData.subscribed);
          }

          // fetch uploader subscribers count
          const uploaderRes = await fetch(
            `http://localhost:5000/api/users/${data.channel}`
          );
          if (uploaderRes.ok) {
            const uploaderData = await uploaderRes.json();
            setUploaderSubs(uploaderData.subscribers);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleSubscribe = async () => {
    if (!video?.uploaderId) return;

    try {
      setSubLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/users/${video.uploaderId}/subscribe`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unknown server error");
      }

      setSubscribed(data.subscribed);
      setUploaderSubs((prev) =>
        data.subscribed ? prev + 1 : Math.max(prev - 1, 0)
      );
    } catch (err) {
      console.error(err);
      alert("Subscription action failed: " + err.message);
    } finally {
      setSubLoading(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <h1>Loading video...</h1>
        </div>
      </>
    );

  if (!video)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <h1>Video not found.</h1>
        </div>
      </>
    );

  const uploadedAgo = getRelativeTime(video.uploadedAt);

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <div className="row">
          {/* Left column: video player and details */}
          <div className="col-lg-8 mb-4">
            <div className="card-body">
              {/* Video player */}
              <div className="ratio ratio-16x9 mb-3">
                <video
                  controls
                  src={`http://localhost:5000/uploads/${video.filename}`}
                  className="w-100"
                />
              </div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mb-1">
                  {video.tags.map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="mb-1">
                <strong>{video.title}</strong>
              </h2>
              <div className="text-muted small mb-3">
                {video.views} views • Uploaded {uploadedAgo}
              </div>

              {/* Uploader + subscribe */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <img
                    src={
                      video.uploaderProfilePicture
                        ? `http://localhost:5000/${video.uploaderProfilePicture}`
                        : "https://placehold.co/48x48?text=User"
                    }
                    alt="Uploader profile"
                    className="rounded-circle me-2"
                    width={48}
                    height={48}
                  />
                  <div>
                    <Link
                      to={`/user/${video.username || video.channel}`}
                      className="fw-bold text-dark text-decoration-none"
                    >
                      {video.channel || video.username}
                    </Link>
                    {video.verified && (
                      <i
                        className="bi bi-patch-check-fill text-primary ms-1"
                        title="Verified channel"
                      ></i>
                    )}
                    <div className="text-muted small">
                      {uploaderSubs} subscribers
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    className={`btn ${subscribed ? "btn-secondary" : "btn-danger"
                      } btn-sm`}
                    onClick={handleSubscribe}
                    disabled={subLoading}
                  >
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="card p-3 mb-3">
                <p className="mb-1 fw-bold">Description</p>
                {video.description ? (
                  <p className="mb-0">{video.description}</p>
                ) : (
                  <i>No description provided.</i>
                )}
              </div>
              <hr/>
              <CommentSection videoId={video._id} />
            </div>
          </div>

          {/* Right column: suggested videos */}
          <div className="col-lg-4">
            <PublicVideosList limit={10} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Watch;
