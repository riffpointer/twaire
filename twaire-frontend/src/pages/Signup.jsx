import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check terms agreement
    if (!agree) {
      setAlert({ type: "danger", message: "You must agree to the terms." });
      return;
    }

    // Validate username format
    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      setAlert({
        type: "danger",
        message: "Username can only contain letters, numbers, and underscores.",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setAlert({
        type: "danger",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    try {
      const res = await fetch(`${ApiConfig.serverUrl}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // Show countdown before redirect
      let countdown = 2;
      setAlert({
        type: "success",
        message: `Signup successful! Redirecting to login page in ${countdown}...`,
      });

      const timer = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
          setAlert({
            type: "success",
            message: `Signup successful! Redirecting to login page in ${countdown}...`,
          });
        } else {
          clearInterval(timer);
          navigate("/login");
        }
      }, 1000);
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1 className="mb-3">Sign Up</h1>

        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a unique username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter a strong password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              id="termsCheck"
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the terms and conditions
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
}

export default Signup;
