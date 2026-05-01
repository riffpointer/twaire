import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { saveAccount } from "../utils/accountSwitcher.js";
import Strings from "../utils/Strings.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const redirectTimeout = 0;

  useEffect(() => {
    document.title = "Login - Twaire";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setAlert({ type: "danger", message: "Please enter both email and password." });
      return;
    }

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for session cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: "danger", message: data.error || "Login failed." });
        return;
      }

      // Successful login
      saveAccount({
        userId: data.user._id,
        username: data.user.username,
        publicName: data.user.publicName,
        profilePicture: data.user.profilePicture,
        verified: data.user.verified,
        switchToken: data.switchToken,
      });
      setAlert({ type: "success", message: "Login successful! Redirecting..." });

      // Redirect after short delay
      setTimeout(() => window.location.href = "/myaccount", redirectTimeout);

    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: `Server seems to be down, try again later. What Happened: ${err}` });
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-2">Login to Twaire</h1>
          <p className="text-body-secondary mb-4">
            {Strings.branding.description} To upload videos and share your opinions and reactions, please login.
          </p>

          {alert ? (
            <div className={`alert alert-${alert.type === "danger" ? "danger" : alert.type} d-flex justify-content-between align-items-start gap-3`}>
              <span>{alert.message}</span>
              <button type="button" className="btn btn-sm btn-link text-reset p-0" onClick={() => setAlert(null)} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>
          ) : null}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Login</button>
              <Link to="/signup" className="btn btn-link text-decoration-none px-0">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
