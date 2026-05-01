import { getRelativeTime } from "../utils/DateUtils.js";
import ApiConfig from "../utils/ApiConfig.js";
import React, { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar.jsx";
import { useQueue } from "../contexts/QueueContext.jsx";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog.jsx";

function VideoCard({ video, className = "" }) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSuccessOpen, setReportSuccessOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const thumbnailRef = useRef(null);
  const menuRef = useRef(null);
  const { addToQueue } = useQueue();

  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title)}`;

  useEffect(() => {
    setThumbnailLoaded(false);
  }, [safeThumbnail]);

  useEffect(() => {
    if (thumbnailRef.current?.complete) {
      setThumbnailLoaded(true);
    }
  }, [safeThumbnail]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, { credentials: "include" });
        if (res.ok) setCurrentUser(await res.json());
      } catch { /* not logged in */ }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const uploadedAtFormatted = getRelativeTime(video.uploadedAt);

  const handleOpenMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleAddToQueue = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToQueue(video);
    setMenuOpen(false);
  };

  const handleReport = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setReportDialogOpen(true);
    setMenuOpen(false);
  };

  const handleSaveToPlaylist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSaveDialogOpen(true);
    setMenuOpen(false);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setReportReason("spam");
    setReportDetails("");
  };

  return (
    <div className={`card h-100 border-0 shadow-sm video-card position-relative ${className}`} style={{ minWidth: '200px' }}>
      <div className="ratio ratio-16x9 position-relative overflow-hidden rounded-3 cursor-pointer">
        {!thumbnailLoaded && (
          <div className="position-absolute inset-0 w-100 h-100 bg-light-subtle skeleton-shimmer"></div>
        )}
        <img
          ref={thumbnailRef}
          src={safeThumbnail}
          alt={video.title}
          loading="lazy"
          onLoad={() => setThumbnailLoaded(true)}
          onError={() => setThumbnailLoaded(true)}
          className={`position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition-opacity duration-200 ${thumbnailLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <div className="card-body p-2 px-1">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
          <h6 className="card-title mb-0 text-truncate fw-bold flex-grow-1" title={video.title}>
            {video.title}
          </h6>
          <div className="dropdown" ref={menuRef}>
            <button
              className="btn btn-link btn-sm text-muted p-0 border-0 shadow-none"
              onClick={handleOpenMenu}
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <div className={`dropdown-menu dropdown-menu-end shadow border-0 ${menuOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0, top: '100%' }}>
              <button className="dropdown-item d-flex align-items-center py-2" onClick={handleAddToQueue}>
                <i className="bi bi-plus-square me-2"></i> Add to queue
              </button>
              <button className="dropdown-item d-flex align-items-center py-2" onClick={handleSaveToPlaylist}>
                <i className="bi bi-plus-circle me-2"></i> Save to playlist
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item d-flex align-items-center py-2 text-warning" onClick={handleReport}>
                <i className="bi bi-flag me-2"></i> Report
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 text-muted small overflow-hidden">
          <UserAvatar user={video.uploader} size={24} />
          <div className="text-truncate d-flex align-items-center">
            <span className="text-truncate">{video.uploader.publicName}</span>
            {video.uploader.verified && (
              <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: '0.75rem' }}></i>
            )}
          </div>
          <span className="flex-shrink-0">• {video.views} views</span>
          {uploadedAtFormatted && (
            <span className="flex-shrink-0">• {uploadedAtFormatted}</span>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      {reportDialogOpen && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCloseReportDialog}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">Report video</h5>
                  <button type="button" className="btn-close" onClick={handleCloseReportDialog}></button>
                </div>
                <div className="modal-body">
                  <p className="text-muted small mb-3">Tell us why you are reporting this video.</p>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Reason</label>
                    <select 
                      className="form-select" 
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                    >
                      <option value="spam">Spam or misleading</option>
                      <option value="harassment">Harassment or bullying</option>
                      <option value="hate">Hateful or abusive</option>
                      <option value="sexual">Sexual or inappropriate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-0">
                    <label className="form-label small fw-bold">Additional details</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Optional context"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button className="btn btn-light rounded-pill px-3" onClick={handleCloseReportDialog}>Cancel</button>
                  <button className="btn btn-warning rounded-pill px-3" onClick={() => {
                    handleCloseReportDialog();
                    setReportSuccessOpen(true);
                    setTimeout(() => setReportSuccessOpen(false), 2200);
                  }}>Submit report</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Success Toast */}
      {reportSuccessOpen && (
        <div className="position-fixed bottom-0 start-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-white bg-warning border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">
                Report submitted.
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setReportSuccessOpen(false)}></button>
            </div>
          </div>
        </div>
      )}

      <SaveToPlaylistDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        videoId={video._id}
        currentUser={currentUser}
      />
      
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
        .cursor-pointer { cursor: pointer; }
        .transition-opacity { transition: opacity 0.2s ease-in-out; }
      `}} />
    </div>
  );
}

export default VideoCard;
