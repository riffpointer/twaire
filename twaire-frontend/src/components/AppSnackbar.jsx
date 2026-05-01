import { useEffect } from "react";

function AppSnackbar({ open, onClose, message, severity }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const getBgClass = (severity) => {
    switch (severity) {
      case "error": return "bg-danger";
      case "success": return "bg-success";
      case "warning": return "bg-warning text-dark";
      case "info": return "bg-info text-dark";
      default: return "bg-primary";
    }
  };

  const getIcon = (severity) => {
    switch (severity) {
      case "error": return "bi-exclamation-circle-fill";
      case "success": return "bi-check-circle-fill";
      case "warning": return "bi-exclamation-triangle-fill";
      case "info": return "bi-info-circle-fill";
      default: return "bi-bell-fill";
    }
  };

  return (
    <div className="position-fixed bottom-0 start-0 p-3" style={{ zIndex: 3000 }}>
      <div 
        className={`toast show align-items-center text-white border-0 shadow-lg ${getBgClass(severity)}`} 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div className="d-flex p-2">
          <div className="toast-body d-flex align-items-center gap-3 py-1">
            <i className={`bi ${getIcon(severity)} fs-5`}></i>
            <span className="fw-medium">{message}</span>
          </div>
          <button 
            type="button" 
            className={`btn-close btn-close-white me-2 m-auto ${severity === 'warning' || severity === 'info' ? 'btn-close-dark' : ''}`} 
            onClick={onClose} 
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}

export default AppSnackbar;
