import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
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
    <>
      <Container maxWidth="sm">
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h4" gutterBottom>
              Login to Twaire
            </Typography>
            <Typography variant="body1" gutterBottom>
              {Strings.branding.description} To upload videos and share your opinions and reactions, please login.
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
                    <i className="bi bi-close"></i>
                  </IconButton>
                }
                sx={{ mt: 2 }}
              >
                {alert.message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                required
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" disableElevation>
                  Login
                </Button>

                <Button component={Link} to="/signup" variant="text" disableElevation>
                  Don't have an account? Sign up
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default Login;
