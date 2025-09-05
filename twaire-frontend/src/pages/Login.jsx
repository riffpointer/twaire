import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar.jsx';
import Strings from "../utils/Strings.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

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
      const res = await fetch("http://localhost:5000/api/users/login", {
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
      setAlert({ type: "success", message: "Login successful! Redirecting..." });

      // Redirect after short delay
      setTimeout(() => navigate("/myaccount"), 1500);

    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: `Server seems to be down, try again later. What Happened: ${err}` });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1>Login to Twaire</h1>
        <p>{Strings.branding.description} To share your videos, please login to continue.</p>

        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-dark">Login</button>

          <p className="mt-3">
            Or <Link to="/signup">sign up</Link> instead
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;
