import { Link } from "react-router-dom";
import { useEffect } from "react";

function NotFound() {
  useEffect(() => {
    document.title = "Page not found - Twaire";
  }, []);

  return (
    <div className="container mb-5">
      <div className="card border-0 shadow-sm rounded-4 mt-4 text-center">
        <div className="card-body p-4 p-sm-5">
          <div className="d-flex justify-content-center align-items-center gap-3 text-body-secondary mb-3">
            <i className="bi bi-search fs-2" aria-hidden="true" />
            <i className="bi bi-emoji-frown fs-3" aria-hidden="true" />
          </div>
          <h1 className="h3 mb-3">Page not found</h1>
          <p className="text-body-secondary mb-4">
          This page does not exist, or the URL may have been typed incorrectly.
          </p>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-house-door me-2" aria-hidden="true" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
