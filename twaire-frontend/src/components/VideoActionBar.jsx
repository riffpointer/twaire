import { useEffect, useState } from "react";
import ApiConfig from "../utils/ApiConfig.js";
import PromptLoginDialog from "@/components/PromptLoginDialog.jsx";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog.jsx";

function VideoActionBar({ videoId, onOpenBookmarks }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [promptLoginDialogShown, showPromptLogin] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!videoId) return;
    const fetchReactions = async () => {
      try {
        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/${videoId}/reactions`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setLikes(data.likes);
          setDislikes(data.dislikes);
          setLiked(data.liked);
          setDisliked(data.disliked);
        } else {
          setLiked(false);
          setDisliked(false);
        }
      } catch {
        setLiked(false);
        setDisliked(false);
      }
    };
    fetchReactions();
  }, [videoId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, { credentials: "include" });
        if (res.ok) setCurrentUser(await res.json());
      } catch { /* not logged in */ }
    };
    fetchCurrentUser();
  }, []);

  const handleReaction = async (type) => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${ApiConfig.serverUrl}/api/videos/${videoId}/${type}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (res.status === 401) {
        showPromptLogin(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setDislikes(data.dislikes);
        setDisliked(data.disliked);
        setLiked(data.liked);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
    setTimeout(() => {
      setCopyButtonText("Copy");
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`);
    setCopyButtonText("Copied!");
    setTimeout(() => {
      setCopyButtonText("Copy");
    }, 2000);
  };

  const encodedUrl = encodeURIComponent(
    `${window.location.origin}/watch/${videoId}`,
  );
  const shareText = `Watch this video on Twaire:`;

  return (
    <>
      <div className="d-flex flex-wrap gap-2 py-2 mb-3">
        <div className="btn-group shadow-sm rounded-pill overflow-hidden">
          <button
            className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${liked ? 'btn-primary' : 'btn-light border-end'}`}
            onClick={() => handleReaction("like")}
            disabled={loading}
            title="Like the video"
          >
            <i className={`bi bi-hand-thumbs-up${liked ? '-fill' : ''}`}></i>
            <span className="fw-bold">{likes}</span>
          </button>
          <button
            className={`btn btn-sm px-3 d-flex align-items-center gap-2 ${disliked ? 'btn-danger' : 'btn-light'}`}
            onClick={() => handleReaction("dislike")}
            disabled={loading}
            title="Dislike the video"
          >
            <i className={`bi bi-hand-thumbs-down${disliked ? '-fill' : ''}`}></i>
            <span className="fw-bold">{dislikes}</span>
          </button>
        </div>

        <button
          className="btn btn-light btn-sm rounded-pill px-3 shadow-sm border d-flex align-items-center gap-2 fw-medium"
          onClick={handleShareClick}
          title="Share the video"
        >
          <i className="bi bi-share-fill small"></i>
          Share
        </button>

        <button
          className="btn btn-light btn-sm rounded-pill px-3 shadow-sm border d-flex align-items-center gap-2 fw-medium"
          onClick={onOpenBookmarks}
          title="Open your private bookmarks"
        >
          <i className="bi bi-bookmarks-fill small"></i>
          Bookmarks
        </button>

        <button
          className="btn btn-light btn-sm rounded-pill px-3 shadow-sm border d-flex align-items-center gap-2 fw-medium"
          onClick={() => setSaveDialogOpen(true)}
          title="Save to playlist"
        >
          <i className="bi bi-plus-square-fill small"></i>
          Save
        </button>
      </div>

      {openShare && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCloseShare}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Share Video</h5>
                  <button type="button" className="btn-close" onClick={handleCloseShare}></button>
                </div>
                <div className="modal-body pt-2">
                  <p className="text-muted small mb-4">Share this video to your favourite social media platforms:</p>
                  
                  <div className="d-flex justify-content-center gap-4 mb-4">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none d-flex flex-column align-items-center"
                      style={{ color: "#1877F2" }}
                    >
                      <i className="bi bi-facebook" style={{ fontSize: '2.5rem' }}></i>
                    </a>

                    <a 
                      href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none d-flex flex-column align-items-center"
                      style={{ color: "#25D366" }}
                    >
                      <i className="bi bi-whatsapp" style={{ fontSize: '2.5rem' }}></i>
                    </a>

                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none d-flex flex-column align-items-center"
                      style={{ color: "#1DA1F2" }}
                    >
                      <i className="bi bi-twitter-x" style={{ fontSize: '2.5rem' }}></i>
                    </a>

                    <a 
                      href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${shareText}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none d-flex flex-column align-items-center"
                      style={{ color: "#FF4500" }}
                    >
                      <i className="bi bi-reddit" style={{ fontSize: '2.5rem' }}></i>
                    </a>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <hr className="flex-grow-1 opacity-25" />
                    <span className="mx-3 text-muted small fw-bold">OR</span>
                    <hr className="flex-grow-1 opacity-25" />
                  </div>

                  <p className="text-muted small mb-2">Share this video by copying the link below.</p>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control bg-light border-0 px-3" 
                      value={`${window.location.origin}/watch/${videoId}`} 
                      readOnly 
                    />
                    <button 
                      className={`btn ${copyButtonText === "Copy" ? "btn-primary" : "btn-success"} px-4 fw-bold`}
                      onClick={handleCopy}
                    >
                      {copyButtonText === "Copy" ? (
                        <><i className="bi bi-copy me-2"></i>Copy</>
                      ) : (
                        <><i className="bi bi-check2 me-2"></i>Copied</>
                      )}
                    </button>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-light rounded-pill px-4" onClick={handleCloseShare}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SaveToPlaylistDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        videoId={videoId}
        currentUser={currentUser}
      />
      <PromptLoginDialog
        action="like this video"
        open={promptLoginDialogShown}
        onClose={() => showPromptLogin(false)}
      />
    </>
  );
}

export default VideoActionBar;
