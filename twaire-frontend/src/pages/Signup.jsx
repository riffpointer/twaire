import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [usernameAvailability, setUsernameAvailability] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const navigate = useNavigate();
  const redirectTimeout = 0;

  useEffect(() => {
    document.title = "Sign Up - Twaire";
  }, []);

  useEffect(() => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setUsernameAvailability({ checking: false, available: null, message: "" });
      return;
    }

    if (!/^[A-Za-z0-9_]+$/.test(trimmedUsername)) {
      setUsernameAvailability({
        checking: false,
        available: false,
        message: "Username can only contain letters, numbers, and underscores.",
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setUsernameAvailability((previous) => ({
          ...previous,
          checking: true,
          message: "",
        }));

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/users/check-username?username=${encodeURIComponent(trimmedUsername)}`,
          { signal: controller.signal },
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Unable to check username availability");
        }

        setUsernameAvailability({
          checking: false,
          available: Boolean(data.available),
          message: data.available ? "Username is available." : "That username is already taken.",
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setUsernameAvailability({
          checking: false,
          available: null,
          message: err.message || "Unable to check username availability",
        });
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [username]);

  const validate = () => {
    let tempErrors = {};
    if (!username) tempErrors.username = "Username is required.";
    else if (!/^[A-Za-z0-9_]+$/.test(username)) tempErrors.username = "Username can only contain letters, numbers, and underscores.";
    else if (usernameAvailability.available === false) tempErrors.username = "That username is already taken.";
    if (!email) tempErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Email is not valid.";
    if (!password) tempErrors.password = "Password is required.";
    else if (password.length < 6) tempErrors.password = "Password must be at least 6 characters.";
    if (!agree) tempErrors.agree = "You must agree to the terms.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameAvailability.checking) return;
    if (!validate()) return;

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

      setAlert({ type: "success", message: "Signup successful! Redirecting to login..." });
      setTimeout(() => navigate("/login"), redirectTimeout);

    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 560 }}>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-3">Create an Account</h1>
          {alert ? (
            <div className={`alert alert-${alert.type === "danger" ? "danger" : alert.type} d-flex justify-content-between align-items-start gap-3`}>
              <span>{alert.message}</span>
              <button type="button" className="btn btn-sm btn-link text-reset p-0" onClick={() => setAlert(null)} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>
          ) : null}
          <div className="alert alert-info">
            By signing up, <b>you agree to our terms and conditions</b>. Currently there are no terms and conditions as this is alpha software, so feel free to test out the software. No guarantee is provided and responsibilities taken for any damages or data loss caused by the use of this pre-release software.
            <hr />
            <i>Have fun!</i>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-body-secondary">
              Please fill out the following fields. Note that the username you choose is permanent and you will not be able to change it later.
            </p>
            <div className="mb-3">
              <label className="form-label" htmlFor="signup-username">Username</label>
              <div className="input-group">
                <input
                  id="signup-username"
                  className={`form-control ${errors.username ? "is-invalid" : ""}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
                <span className="input-group-text">
                  {usernameAvailability.checking ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  ) : usernameAvailability.available === true ? (
                    <i className="bi bi-check-circle text-success" />
                  ) : usernameAvailability.available === false ? (
                    <i className="bi bi-x-circle text-danger" />
                  ) : (
                    <i className="bi bi-person-badge text-body-secondary" />
                  )}
                </span>
                {errors.username ? <div className="invalid-feedback d-block">{errors.username}</div> : null}
              </div>
              <div className="form-text">{usernameAvailability.message || "You won't be able to change this, so choose wisely!"}</div>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email ? <div className="invalid-feedback d-block">{errors.email}</div> : null}
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password ? <div className="invalid-feedback d-block">{errors.password}</div> : null}
            </div>
            <div className="form-check mb-2">
              <input
                id="signup-agree"
                className={`form-check-input ${errors.agree ? "is-invalid" : ""}`}
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="signup-agree">
                I have read and agreed to the{" "}
                <Link to="/terms-and-conditions" className="fw-semibold text-decoration-underline">
                  terms and conditions
                </Link>
                .
              </label>
              {errors.agree ? <div className="invalid-feedback d-block">{errors.agree}</div> : null}
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
              <button type="submit" className="btn btn-primary">Sign Up</button>
              <Link to="/login" className="btn btn-link text-decoration-none px-0">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
