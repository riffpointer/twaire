import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Switch from '@mui/material/Switch';
import LoginIcon from '@mui/icons-material/Login';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Button, CircularProgress, Drawer, useTheme } from '@mui/material';
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import ApiConfig from '../utils/ApiConfig';
import UserDropdown from './UserDropdown';

export default function GlobalAppBar() {
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${ApiConfig.serverUrl}/api/users/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
          console.log("Unable to obtain logged in user information, response not ok");
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

  const handleChange = (event) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${ApiConfig.serverUrl}/api/users/logout`, {
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
    "Home": "/",
    "Trending": "/trending",
    "About": "/about",
  };
  
  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem>
          <Typography variant="h5">Twaire</Typography>
        </ListItem>
        <Divider />
        {Object.entries(navLinkPages).map(([label, path]) => (
          <ListItem key={label} disablePadding>
            <ListItemButton component={NavLink} to={path}>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box mb={4}>
      <AppBar position="fixed" variant="outlined">
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
          <Typography variant="h6" component="div" sx={{ mr: 2, flexGrow: { xs: 1, md: 0 } }}>
            Twaire
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: "start", flexGrow: 1 }}>
            {Object.entries(navLinkPages).map(([label, path]) => (
              <Button
                key={label}
                onClick={() => {
                  navigate(path);
                }}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {label}
              </Button>
            ))}
          </Box>
          <Box>
            {!user && !loading && (
              <Button
                component={NavLink}
                to="/login"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
            )}

            {user ? (
              <UserDropdown user={user} handleLogout={handleLogout} />
            ) : ((!user && loading) && 
              <CircularProgress size="20px" />
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Box>
  );
}