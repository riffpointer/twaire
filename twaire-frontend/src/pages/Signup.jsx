import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { Alert, Box, Button, Card, CardContent, Checkbox, Container, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
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

  const usernameAdornment = (
    <InputAdornment position="end">
      {usernameAvailability.checking ? (
        <CircularProgress size={18} />
      ) : (
        <Tooltip
          title={
            usernameAvailability.available === true
              ? "Username available"
              : usernameAvailability.available === false
                ? "Username unavailable"
                : "Username availability"
          }
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              transformOrigin: "center",
              color:
                usernameAvailability.available === true
                  ? "success.main"
                  : usernameAvailability.available === false
                    ? "error.main"
                    : "text.disabled",
              animation:
                usernameAvailability.available === true || usernameAvailability.available === false
                  ? "usernameStatusPop 180ms ease-out"
                  : "none",
              "@keyframes usernameStatusPop": {
                "0%": {
                  transform: "scale(0.85)",
                  opacity: 0.55,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          >
            {usernameAvailability.available === true ? (
              <CheckCircleIcon fontSize="small" />
            ) : usernameAvailability.available === false ? (
              <CancelIcon fontSize="small" />
            ) : null}
          </Box>
        </Tooltip>
      )}
    </InputAdornment>
  );

  return (
    <>
      <Container maxWidth="sm" sx={{ mb: 4 }}>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h4" gutterBottom>
              Create an Account
            </Typography>

            {alert && (
              <Alert
                severity={alert.type === "danger" ? "error" : alert.type}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setAlert(null)}
                  >
                    <i className="bi bi-x"></i>
                  </IconButton>
                }
                sx={{ mt: 2, mb: 2 }}
              >
                {alert.message}
              </Alert>
            )}
            <Alert severity="info">
              By signing up, <b>you agree to our terms and conditions</b>. Currently there are no terms and conditions as this is alpha software, so feel free to test out the software. No guarantee is provided and responsibilities taken for any damages or data loss caused by the use of this pre-release software. 
              <hr />
              <i>Have fun!</i>
            </Alert>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography sx={{mt:2}}>
                Please fill out the following fields. Note that the username you choose is permanent and you will not be able to change it later.
              </Typography>
              <TextField
                label="Username"
                name="username"
                id="signup-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="username"
                required
                error={!!errors.username}
                helperText={errors.username || usernameAvailability.message || "You won't be able to change this, so choose wisely!"}
                InputProps={{ endAdornment: usernameAdornment }}
              />
              <TextField
                label="Email"
                type="email"
                name="email"
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="email"
                required
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="new-password"
                required
                error={!!errors.password}
                helperText={errors.password}
              />
              <FormControlLabel
                control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
                label={
                  <>
                    I have read and agreed to the{" "}
                    <Box
                      component={Link}
                      to="/terms-and-conditions"
                      sx={{ fontWeight: 600, textDecoration: "underline" }}
                    >
                      terms and conditions
                    </Box>
                    .
                  </>
                }
              />
              <Box sx={{ mt: -1, mb: 1 }}>
                {errors.agree && <Typography color="error" variant="caption">{errors.agree}</Typography>}
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" disableElevation>
                  Sign Up
                </Button>
                <Button component={Link} to="/login" variant="text">
                  Already have an account? Login
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default Signup;
