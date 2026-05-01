import { useNavigate } from "react-router-dom";

function PromptLoginDialog({ open, onClose, action="perform this action" }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold">Login Required</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body py-3">
              <p className="mb-0">
                You must be logged in to {action}. Please log in or create a new account!
              </p>
            </div>
            <div className="modal-footer border-top-0 pt-0">
              <button className="btn btn-light rounded-pill px-4 fw-medium" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handleLogin}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PromptLoginDialog;
