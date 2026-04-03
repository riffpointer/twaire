import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { Button, InputAdornment, TextField } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ApiConfig, { fromServer } from "../utils/ApiConfig.js";
import AppDrawer from "./AppDrawer";
import Loading from "./Loading";
import UserDropdown from "./UserDropdown";

export default function AppBarHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(fromServer("/api/users/me"), {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
          console.log(
            "Unable to obtain logged in user information, response not ok",
          );
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        setUser(null);
        console.log("Unable to obtain logged in user information: " + e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Sync search box with URL ?q= when on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchTerm(q);
  }, [location.search]);

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch(fromServer("/api/users/logout"), {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const navLinkPages = {
    Home: {
      path: "/",
      icon: <HomeIcon />,
    },
    Trending: {
      path: "/trending",
      icon: <WhatshotIcon />,
    },
    About: {
      path: "/about",
      icon: <InfoIcon />,
    },
  };

  const searchFieldEndAdornment = (
    <InputAdornment position="end">
      <IconButton type="submit" edge="end" aria-label="search">
        <SearchIcon />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box mb={4}>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            color="textPrimary"
            to="/"
            sx={{
              display: { xs: "none", sm: "block" },
              textDecoration: "none",
              mr: 2,
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            Twaire
          </Typography>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "start",
              flexGrow: 1,
            }}
          >
            {Object.entries(navLinkPages).map(([label, navLink]) => (
              <Button
                key={label}
                onClick={() => {
                  navigate(navLink.path);
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {label}
              </Button>
            ))}
          </Box>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              marginRight: 2,
              width: "100%",
              maxWidth: { xs: "100%", sm: 300, md: 400 },
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search videos..."
              value={searchTerm}
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ endAdornment: searchFieldEndAdornment }}
            />
          </Box>
          <Box>
            {!user && !loading && (
              <Button
                component={NavLink}
                to="/login"
                variant="contained"
                color="primary"
                size="small"
                sx={{ height: 40 }}
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
            )}

            {user ? (
              <UserDropdown user={user} handleLogout={handleLogout} />
            ) : (
              !user && loading && <Loading />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* App drawer */}
      <AppDrawer
        navLinkPages={navLinkPages}
        open={drawerOpen}
        toggleDrawer={toggleDrawer}
      />
    </Box>
  );
}
