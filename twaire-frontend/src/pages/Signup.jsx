import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import { Container, Typography, TextField, Button, Alert, Box, Stack, Checkbox, FormControlLabel } from "@mui/material";
import IconButton from "@mui/material/IconButton";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up - Twaire";
  }, []);

  const validate = () => {
    let tempErrors = {};
    if (!username) tempErrors.username = "Username is required.";
    else if (!/^[A-Za-z0-9_]+$/.test(username)) tempErrors.username = "Username can only contain letters, numbers, and underscores.";
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
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="off"
            required
            error={!!errors.username}
            helperText={errors.username || "You won't be able to change this, so choose wisely!"}
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
          />
          <FormControlLabel
            control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} />}
            label="I agree to the terms and conditions"
          />
          {errors.agree && <Typography color="error" variant="caption">{errors.agree}</Typography>}

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" disableElevation>
              Sign Up
            </Button>
            <Button component={Link} to="/login" variant="text">
              Already have an account? Login
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
}

export default Signup;