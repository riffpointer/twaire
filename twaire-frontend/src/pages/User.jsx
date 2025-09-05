import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoCard from "../components/VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";

function User() {
  const { username } = useParams(); // URL: /user/:username
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndVideos = async () => {
      try {
        setError(null);

        // Fetch user data
        const resUser = await fetch(`${ApiConfig.serverUrl}/api/users/${username}`);
        if (!resUser.ok) {
          const errData = await resUser.json().catch(() => ({}));
          throw new Error(errData.error || "User not found");
        }
        const userData = await resUser.json();
        setUser(userData);

        // Fetch user's videos
        const resVideos = await fetch(`${ApiConfig.serverUrl}/api/videos?uploader=${userData._id}`);
        if (!resVideos.ok) {
          const errData = await resVideos.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch videos");
        }
        const videosData = await resVideos.json();
        setVideos(videosData);

        // Check subscription status
        const subRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${userData._id}/isSubscribed`,
          { credentials: "include" }
        );
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscribed(subData.subscribed);
        }

        document.title = `${userData.publicName || userData.username} - Twaire`;
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndVideos();
  }, [username]);

  const handleSubscribe = async () => {
    if (!user?._id) return;
    try {
      setSubLoading(true);
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/${user._id}/subscribe`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribed(data.subscribed);
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
          <Loading label="Loading user..." />
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <h1 className="text-danger">Ooops! Unable to load user! {error}</h1>
        </div>
      </>
    );

  if (!user)
    return (
      <>
        <Navbar />
        <div className="container mt-4">
          <h1>User not found.</h1>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <div className="card shadow-sm p-3 mb-4">
          <div className="d-flex align-items-center mb-3">
            <img
              src={
                user.profilePicture
                  ? `${ApiConfig.serverUrl}/${user.profilePicture}`
                  : "https://placehold.co/100x100?text=Profile"
              }
              alt="Profile"
              className="rounded-circle me-3"
              width={100}
              height={100}
            />
            <div>
              <h3 className="mb-0">{user.publicName || user.username}</h3>
              <p className="text-muted mb-1">@{user.username}</p>
              {user.verified && <span className="badge bg-success me-1">Verified</span>}
              {user.official && <span className="badge bg-primary">Official</span>}
              <div className="mt-2">
                <button
                  className={`btn ${subscribed ? "btn-secondary" : "btn-danger"} btn-sm`}
                  onClick={handleSubscribe}
                  disabled={subLoading}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="mb-3">
              <strong>Bio:</strong>
              <p>{user.bio}</p>
            </div>
          )}

          <div className="mb-3">
            <strong>Subscribers:</strong> {user.subscribers} <br />
            <strong>Profile views:</strong> {user.views || 0}
          </div>
        </div>

        {videos.length > 0 && (
          <div>
            <h4 className="mb-3">Uploaded Videos</h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {videos.map((video) => (
                <div key={video._id} className="col">
                  <Link
                    to={`/watch/${video._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <VideoCard
                      title={video.title}
                      channel={user.publicName || user.username}
                      views={video.views || 0}
                      thumbnail={video.thumbnail}
                      description={video.description}
                      verified={user.verified}
                      uploadedAt={video.uploadedAt}
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length === 0 && (
          <p className="text-muted">This user has not uploaded any videos yet.</p>
        )}
      </div>
    </>
  );
}

export default User;
