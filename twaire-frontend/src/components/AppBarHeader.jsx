import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import { Autocomplete, Button, CircularProgress, InputAdornment, Slide, TextField } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { fromServer } from "../utils/ApiConfig.js";
import { getSavedAccounts, removeAccount, saveAccount } from "../utils/accountSwitcher.js";
import AppDrawer from "./AppDrawer";
import Loading from "./Loading";
import UserDropdown from "./UserDropdown";

export default function AppBarHeader() {
  const [user, setUser] = useState(null);
  const [savedAccounts, setSavedAccounts] = useState(() => getSavedAccounts());
  const [loading, setLoading] = useState(true);
  const [switchingUserId, setSwitchingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchInputRef = useRef(null);

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
          const storedAccount = getSavedAccounts().find((account) => account.userId === data._id);

          if (storedAccount) {
            const updatedAccounts = saveAccount({
              userId: data._id,
              username: data.username,
              publicName: data.publicName,
              profilePicture: data.profilePicture,
              verified: data.verified,
              switchToken: storedAccount.switchToken,
            });
            setSavedAccounts(updatedAccounts);
            setUser({ ...data, switchToken: storedAccount.switchToken });
          } else {
            const tokenRes = await fetch(fromServer("/api/users/me/account-switch-token"), {
              method: "POST",
              credentials: "include",
            });

            if (tokenRes.ok) {
              const tokenData = await tokenRes.json();
              const updatedAccounts = saveAccount({
                userId: tokenData.user._id,
                username: tokenData.user.username,
                publicName: tokenData.user.publicName,
                profilePicture: tokenData.user.profilePicture,
                verified: tokenData.user.verified,
                switchToken: tokenData.switchToken,
              });
              setSavedAccounts(updatedAccounts);
              setUser({ ...data, switchToken: tokenData.switchToken });
            } else {
              setUser(data);
            }
          }
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

  useEffect(() => {
    const handleStorage = () => {
      setSavedAccounts(getSavedAccounts());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Sync search box with URL ?q= when on search page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearchTerm(q);
  }, [location.search]);

  useEffect(() => {
    const normalizedQuery = String(searchTerm || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

    if (!normalizedQuery) {
      setAutocompleteOptions([]);
      setAutocompleteLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setAutocompleteLoading(true);
        const res = await fetch(
          fromServer(`/api/videos/search/autocomplete?q=${encodeURIComponent(normalizedQuery)}`),
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("Failed to fetch autocomplete");
        const data = await res.json();
        setAutocompleteOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setAutocompleteOptions([]);
        }
      } finally {
        setAutocompleteLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm]);

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch(fromServer("/api/users/logout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ switchToken: user?.switchToken || null }),
      });
      if (user?._id) {
        setSavedAccounts(removeAccount(user._id));
      }
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSwitchAccount = async (account) => {
    try {
      setSwitchingUserId(account.userId);
      const res = await fetch(fromServer("/api/users/switch-account"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: account.userId,
          switchToken: account.switchToken,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (account.userId) {
          setSavedAccounts(removeAccount(account.userId));
        }
        throw new Error(data.error || "Failed to switch account");
      }

      const updatedAccounts = saveAccount({
        userId: data.user._id,
        username: data.user.username,
        publicName: data.user.publicName,
        profilePicture: data.user.profilePicture,
        verified: data.user.verified,
        switchToken: account.switchToken,
      });
      setSavedAccounts(updatedAccounts);
      setUser({ ...data.user, switchToken: account.switchToken });
      navigate("/myaccount");
    } catch (err) {
      console.error("Account switch failed", err);
    } finally {
      setSwitchingUserId(null);
    }
  };

  const handleAddAccount = () => {
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAutocompleteSelection = (_, value) => {
    const term = typeof value === "string" ? value : "";
    setSearchTerm(term);
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
    requestAnimationFrame(() => {
      searchInputRef.current?.blur();
    });
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
    Subscriptions: {
      path: "/subscriptions",
      icon: <SubscriptionsIcon />,
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
      <Slide in direction="down" timeout={220}>
        <AppBar position="fixed">
          <Toolbar
            variant="dense"
            sx={{
              minHeight: { xs: 56, md: 50 },
              px: { xs: 1, sm: 2 },
            }}
          >
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: { xs: 1.25, md: 1.5 } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              color="inherit"
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
                  sx={{
                    my: 0.5,
                    color: "inherit",
                    display: "block",
                  }}
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
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                options={autocompleteOptions}
                open={autocompleteOptions.length > 0}
                loading={autocompleteLoading}
                loadingText=""
                filterOptions={(options) => options}
                inputValue={searchTerm}
                onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
                onChange={handleAutocompleteSelection}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Search videos..."
                    inputRef={searchInputRef}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {autocompleteLoading ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                          {searchFieldEndAdornment}
                        </>
                      ),
                    }}
                  />
                )}
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
                  sx={{ height: { xs: 36, md: 34 } }}
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
              )}

              {user ? (
                <UserDropdown
                  user={user}
                  handleLogout={handleLogout}
                  savedAccounts={savedAccounts}
                  switchingUserId={switchingUserId}
                  handleSwitchAccount={handleSwitchAccount}
                  handleAddAccount={handleAddAccount}
                />
              ) : (
                !user && loading && <Loading />
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* App drawer */}
      <AppDrawer
        navLinkPages={navLinkPages}
        open={drawerOpen}
        toggleDrawer={toggleDrawer}
      />
    </Box>
  );
}
