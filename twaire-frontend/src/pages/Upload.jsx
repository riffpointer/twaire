import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Upload video - Twaire";

    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown === 0 && alert?.videoId) {
      navigate(`/watch/${alert.videoId}`);
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, alert, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!file) newErrors.file = "Please select a video file.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    let sanitizedTags = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    sanitizedTags = [...new Set(sanitizedTags)];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    if (sanitizedTags.length > 0) formData.append("tags", JSON.stringify(sanitizedTags));

    try {
      const res = await fetch("http://localhost:5000/api/videos", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "Upload failed";
        setAlert({ type: "danger", message: errMsg });
        return;
      }

      setAlert({
        type: "success",
        message: `Video uploaded successfully! Redirecting in`,
        videoId: data._id,
      });
      setRedirectCountdown(5);
      setDisabled(true);

      setTitle("");
      setDescription("");
      setTags("");
      setFile(null);
      setThumbnail(null);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: err.message || "Error uploading video." });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <h1>Upload your video!</h1>
        <p className="mb-4">
          Make sure the title, description, and tags are correct, because you
          might not be able to edit them later!
        </p>
        <form onSubmit={handleSubmit} className="card shadow-sm">
          <div className="card-body">
            {alert && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {redirectCountdown === null ? alert.message : <i>{alert.message}</i>}
                {alert.type === "success" && redirectCountdown !== null && (
                  <i><b> ({redirectCountdown})...</b></i>
                )}
                <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="Enter video title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={disabled}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Give the video a nice description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={disabled}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., tutorial, react, node"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={disabled}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Video file</label>
              <input
                type="file"
                className={`form-control ${errors.file ? "is-invalid" : ""}`}
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={disabled}
              />
              {errors.file && <div className="invalid-feedback">{errors.file}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Custom thumbnail (optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                disabled={disabled}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={disabled} title="Click to upload!">
              Upload
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Upload;
