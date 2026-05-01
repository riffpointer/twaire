import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "@/components/Loading.jsx";
import UserHeader from "@/components/UserHeader.jsx";
import UserTabs from "@/components/UserTabs.jsx";
import ApiConfig from "../utils/ApiConfig.js";

function MyAccount() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [videoVisibility, setVideoVisibility] = useState("all");
  const [playlists, setPlaylists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Account - Twaire";

    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);

        const params = new URLSearchParams();
        if (videoVisibility !== "all") {
          params.set("visibility", videoVisibility);
        }
        const vidRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${data._id}/videos${params.toString() ? `?${params.toString()}` : ""}`,
        );
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          setVideos(vidData);
        }

        const subscriptionsRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/${data._id}/subscriptions`,
        );
        if (subscriptionsRes.ok) {
          const subscriptionsData = await subscriptionsRes.json();
          setSubscriptions(subscriptionsData);
        }

        const playlistsRes = await fetch(
          `${ApiConfig.serverUrl}/api/playlists/user/${data.username}`,
          { credentials: "include" },
        );
        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
        }

        const bookmarksRes = await fetch(
          `${ApiConfig.serverUrl}/api/users/me/bookmarks`,
          { credentials: "include" },
        );
        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json();
          setBookmarkedVideos(Array.isArray(bookmarksData) ? bookmarksData : []);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, videoVisibility]);

  const handleLogout = async () => {
    try {
      await fetch(`${ApiConfig.serverUrl}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading)
    return (
      <div className="container mb-4">
        <div className="card border-0 shadow-sm rounded-4 mb-3">
          <div className="card-body p-4 placeholder-glow">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="placeholder rounded-circle" style={{ width: 112, height: 112 }} />
              <div className="flex-grow-1">
                <div className="placeholder rounded col-5 mb-2" style={{ height: 34 }} />
                <div className="placeholder rounded col-3 mb-2" style={{ height: 20 }} />
                <div className="placeholder rounded col-4 mb-3" style={{ height: 18 }} />
                <div className="d-flex gap-2">
                  <div className="placeholder rounded" style={{ width: 100, height: 32 }} />
                  <div className="placeholder rounded" style={{ width: 80, height: 32 }} />
                </div>
              </div>
            </div>
            <div className="placeholder rounded d-block" style={{ height: 80 }} />
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 pt-3 placeholder-glow">
            <div className="d-flex gap-3 mb-3 border-bottom pb-2">
              <div className="placeholder rounded col-1" style={{ height: 20 }} />
              <div className="placeholder rounded col-1" style={{ height: 20 }} />
            </div>
            <div className="placeholder rounded mb-3" style={{ width: 160, height: 40 }} />
            <div className="row g-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <div className="placeholder rounded d-block mb-2" style={{ height: 120 }} />
                  <div className="placeholder rounded col-9 mb-1" style={{ height: 18 }} />
                  <div className="placeholder rounded col-6" style={{ height: 14 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <div className="container mb-4">
        {user && (
          <UserHeader user={user}>
            <div className="d-flex gap-2">
              <Link
                to="/editprofile"
                className={`btn btn-sm ${user.banner ? "btn-light" : "btn-outline-primary"}`}
                style={
                  user.banner
                    ? { backgroundColor: "rgba(255,255,255,0.16)", color: "white", backdropFilter: "blur(8px)" }
                    : undefined
                }
              >
                Edit Profile
              </Link>
              <button
                type="button"
                className={`btn btn-sm ${user.banner ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setShowLogoutModal(true)}
                style={user.banner ? { backgroundColor: "rgba(211, 47, 47, 0.82)", color: "white" } : undefined}
              >
                Logout
              </button>
            </div>
          </UserHeader>
        )}
        <UserTabs
          user={user}
          videos={videos}
          subscriptions={subscriptions}
          playlists={playlists}
          showBookmarksTab={true}
          bookmarkedVideos={bookmarkedVideos}
          videoVisibility={videoVisibility}
          onVideoVisibilityChange={setVideoVisibility}
          currentUser={user}
          onPlaylistCreated={(newPl) => setPlaylists((prev) => [newPl, ...prev])}
          onPlaylistDeleted={(id) => setPlaylists((prev) => prev.filter((p) => p._id !== id))}
        />
      </div>

      {showLogoutModal ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">Logout</h2>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowLogoutModal(false)} />
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to log out? This action will redirect you to the login page.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowLogoutModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MyAccount;
