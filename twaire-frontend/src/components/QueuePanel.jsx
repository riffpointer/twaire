import { Link, useLocation } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { useQueue } from "../contexts/QueueContext.jsx";

function QueuePanel() {
  const { queueItems, removeFromQueue, clearQueue, isQueueExpanded, setIsQueueExpanded } = useQueue();
  const location = useLocation();

  const isVisible = queueItems.length > 0;

  const match = location.pathname.match(/^\/watch\/([a-zA-Z0-9_-]+)/);
  const currentVideoId = match ? match[1] : null;
  const currentIndex = currentVideoId ? queueItems.findIndex((item) => item._id === currentVideoId) : -1;

  return (
    <div
      className={`card shadow-lg fixed-bottom border-0 m-3 ms-auto overflow-hidden ${isVisible ? 'translate-middle-y-0 opacity-100' : 'translate-middle-y-100 opacity-0'}`}
      style={{
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 1050,
        borderRadius: '12px',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'translateY(0)' : 'translateY(150%)',
        right: 0,
        bottom: 0,
      }}
    >
      <div 
        className="card-header bg-light border-0 d-flex align-items-center justify-content-between py-2 px-3 cursor-pointer"
        onClick={() => setIsQueueExpanded(!isQueueExpanded)}
      >
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-music-note-list text-primary"></i>
          <span className="fw-bold small">Queue</span>
          <span className="text-muted small">
            {queueItems.length} item{queueItems.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="d-flex gap-1">
          <button 
            className="btn btn-link btn-sm text-muted p-1 border-0"
            onClick={(e) => { e.stopPropagation(); clearQueue(); }}
            title="Clear queue"
          >
            <i className="bi bi-trash-fill small"></i>
          </button>
          <button 
            className="btn btn-link btn-sm text-muted p-1 border-0"
            onClick={(e) => { e.stopPropagation(); setIsQueueExpanded(!isQueueExpanded); }}
            title={isQueueExpanded ? "Collapse queue" : "Expand queue"}
          >
            <i className={`bi bi-chevron-${isQueueExpanded ? 'down' : 'up'} small`}></i>
          </button>
        </div>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ${isQueueExpanded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          maxHeight: isQueueExpanded ? '320px' : '0',
          transition: 'max-height 0.3s ease-in-out, opacity 0.2s ease-in-out'
        }}
      >
        <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '320px' }}>
          {queueItems.map((item, index) => {
            const isPast = currentIndex !== -1 && index < currentIndex;
            const isCurrent = currentIndex === index;
            
            return (
              <div
                key={item._id}
                className={`list-group-item d-flex gap-2 align-items-center py-2 px-3 border-0 border-top ${isCurrent ? 'bg-primary bg-opacity-10' : ''}`}
                style={{ opacity: isPast ? 0.5 : 1 }}
              >
                <div className="position-relative flex-shrink-0">
                  <img
                    src={item.thumbnail ? `${ApiConfig.serverUrl}/data/thumbnails/${item.thumbnail}` : 'https://placehold.co/320x180?text=No+Thumbnail'}
                    alt={item.title}
                    className="rounded"
                    style={{ width: '56px', height: '32px', objectFit: 'cover' }}
                  />
                  {isCurrent && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 rounded">
                      <i className="bi bi-play-fill text-white"></i>
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 flex-grow-1">
                  <Link 
                    to={`/watch/${item._id}`} 
                    className="d-block text-truncate fw-bold text-dark text-decoration-none small"
                  >
                    {item.title}
                  </Link>
                  <small className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                    {isCurrent ? 'Now playing' : 'Added to queue'}
                  </small>
                </div>

                <div className="d-flex gap-1">
                  <Link 
                    to={`/watch/${item._id}`}
                    className="btn btn-link btn-sm text-primary p-1 border-0"
                    title="Play Now"
                  >
                    <i className="bi bi-play-fill"></i>
                  </Link>
                  <button 
                    className="btn btn-link btn-sm text-danger p-1 border-0"
                    onClick={() => removeFromQueue(item._id)}
                    title="Remove from queue"
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cursor-pointer { cursor: pointer; }
      `}} />
    </div>
  );
}

export default QueuePanel;
