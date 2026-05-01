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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

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
          console.log("Unable to obtain logged in user information, response not ok");
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setDropdownOpen(false);
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAutocompleteSelection = (term) => {
    setSearchTerm(term);
    setDropdownOpen(false);
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const navLinkPages = {
    Home: {
      path: "/",
      icon: <i className="bi bi-house-door-fill"></i>,
    },
    Trending: {
      path: "/trending",
      icon: <i className="bi bi-fire"></i>,
    },
    Subscriptions: {
      path: "/subscriptions",
      icon: <i className="bi bi-collection-play-fill"></i>,
    },
    About: {
      path: "/about",
      icon: <i className="bi bi-info-circle-fill"></i>,
    },
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary fixed-top shadow-sm py-1">
      <div className="container-fluid px-2">
        <button 
          className="btn btn-link text-white p-2 me-2" 
          onClick={toggleDrawer(true)}
          aria-label="Menu"
        >
          <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
        </button>

        <Link className="navbar-brand fw-bold d-none d-sm-block me-4" to="/">
          Twaire
        </Link>

        <div className="collapse navbar-collapse d-none d-md-block">
          <ul className="navbar-nav me-auto">
            {Object.entries(navLinkPages).map(([label, navLink]) => (
              <li key={label} className="nav-item">
                <NavLink className="nav-link px-3" to={navLink.path}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-grow-1 mx-2 mx-md-4 position-relative" style={{ maxWidth: "500px" }} ref={autocompleteRef}>
          <form onSubmit={handleSearch} className="input-group input-group-sm bg-white rounded-pill overflow-hidden border-0">
            <input
              type="text"
              className="form-control border-0 px-3 shadow-none"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              ref={searchInputRef}
            />
            <button className="btn btn-light border-0 px-3" type="submit">
              {autocompleteLoading ? (
                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
              ) : (
                <i className="bi bi-search text-primary"></i>
              )}
            </button>
          </form>

          {dropdownOpen && autocompleteOptions.length > 0 && (
            <div className="dropdown-menu show w-100 shadow-lg border-0 mt-1 rounded-3 py-2">
              {autocompleteOptions.map((option, index) => (
                <button
                  key={index}
                  className="dropdown-item py-2 px-3"
                  onClick={() => handleAutocompleteSelection(option)}
                >
                  <i className="bi bi-search me-3 text-muted small"></i>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex align-items-center">
          {!user && !loading && (
            <Link to="/login" className="btn btn-light rounded-pill btn-sm px-3 fw-bold d-flex align-items-center">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Link>
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
            !user && loading && (
              <div className="spinner-border spinner-border-sm text-white" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )
          )}
        </div>
      </div>

      <AppDrawer
        navLinkPages={navLinkPages}
        open={drawerOpen}
        toggleDrawer={toggleDrawer}
      />
    </nav>
  );
}
