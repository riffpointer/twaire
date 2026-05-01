import { useEffect, useState } from "react";
import ApiConfig from "../utils/ApiConfig.js";

const VISIBILITY_OPTIONS = [
  { value: 0, label: "Public", icon: <i className="bi bi-globe small"></i> },
  { value: 1, label: "Unlisted", icon: <i className="bi bi-link-45deg small"></i> },
  { value: 2, label: "Private", icon: <i className="bi bi-lock-fill small"></i> },
];

function SaveToPlaylistDialog({ open, onClose, videoId, currentUser }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // playlistId being saved
  const [savedIds, setSavedIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVisibility, setNewVisibility] = useState(2);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !currentUser) return;
    setLoading(true);
    fetch(`${ApiConfig.serverUrl}/api/playlists/user/${currentUser.username}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlaylists(data);
          const alreadyIn = new Set(
            data
              .filter((pl) =>
                (pl.videos || []).some(
                  (v) => (v._id || v) === videoId
                )
              )
              .map((pl) => pl._id)
          );
          setSavedIds(alreadyIn);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, currentUser, videoId]);

  const handleToggle = async (playlist) => {
    const alreadySaved = savedIds.has(playlist._id);
    setSaving(playlist._id);
    try {
      if (alreadySaved) {
        await fetch(
          `${ApiConfig.serverUrl}/api/playlists/${playlist._id}/videos/${videoId}`,
          { method: "DELETE", credentials: "include" }
        );
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(playlist._id);
          return next;
        });
      } else {
        await fetch(`${ApiConfig.serverUrl}/api/playlists/${playlist._id}/videos`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        setSavedIds((prev) => new Set([...prev, playlist._id]));
      }
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/playlists`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), visibility: newVisibility }),
      });
      if (res.ok) {
        const pl = await res.json();
        setPlaylists((prev) => [pl, ...prev]);
        setNewName("");
        setNewVisibility(2);
        setShowCreate(false);
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header border-bottom-0 pb-0">
              <h6 className="modal-title fw-bold d-flex align-items-center">
                <i className="bi bi-plus-square me-2 text-primary"></i>
                Save to playlist
              </h6>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body p-0 mt-3">
              {!currentUser ? (
                <div className="p-4 text-center">
                  <p className="text-muted small mb-0">Sign in to save videos to playlists.</p>
                </div>
              ) : loading ? (
                <div className="d-flex justify-content-center p-4">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              ) : (
                <div className="overflow-auto" style={{ maxHeight: '280px' }}>
                  {playlists.map((pl) => {
                    const isSaved = savedIds.has(pl._id);
                    const isSaving = saving === pl._id;
                    const visibilityOpt = VISIBILITY_OPTIONS.find(o => o.value === pl.visibility);
                    
                    return (
                      <div 
                        key={pl._id}
                        className="d-flex align-items-center px-3 py-2 border-0 bg-transparent w-100 text-start"
                        style={{ cursor: isSaving ? 'default' : 'pointer' }}
                        onClick={() => !isSaving && handleToggle(pl)}
                      >
                        <div className="me-3">
                          {isSaving ? (
                            <div className="spinner-border spinner-border-sm text-primary" style={{ width: '1.1rem', height: '1.1rem' }}></div>
                          ) : (
                            <div className={`border rounded d-flex align-items-center justify-content-center ${isSaved ? 'bg-primary border-primary' : 'bg-white'}`} style={{ width: '1.1rem', height: '1.1rem' }}>
                              {isSaved && <i className="bi bi-check text-white" style={{ fontSize: '0.9rem' }}></i>}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-bold text-truncate small">{pl.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {visibilityOpt?.icon} <span className="ms-1">{visibilityOpt?.label}</span> · {pl.videos?.length || 0} videos
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {playlists.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-muted small mb-0">No playlists yet. Create one below.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer border-top-0 flex-column align-items-stretch px-3 pb-3">
              {showCreate && (
                <div className="mb-3 border-top pt-3">
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Playlist name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <select 
                    className="form-select form-select-sm mb-3"
                    value={newVisibility}
                    onChange={(e) => setNewVisibility(parseInt(e.target.value))}
                  >
                    {VISIBILITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <div className="d-flex justify-content-end">
                    <button 
                      className="btn btn-primary btn-sm rounded-pill px-3"
                      onClick={handleCreate}
                      disabled={!newName.trim() || creating}
                    >
                      {creating ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                      Create
                    </button>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between mt-2">
                <button 
                  className="btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center"
                  onClick={() => setShowCreate(!showCreate)}
                >
                  <i className={`bi bi-${showCreate ? 'dash' : 'plus'}-circle me-2`}></i>
                  New playlist
                </button>
                <button className="btn btn-light btn-sm rounded-pill px-3" onClick={onClose}>Done</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SaveToPlaylistDialog;
