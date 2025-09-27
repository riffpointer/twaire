import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ApiConfig from '../utils/ApiConfig.js';
import { Avatar, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import React from 'react';
import UserAvatar from './UserAvatar.jsx';

// Assume user and handleLogout are passed as props
const UserDropdown = ({ user, handleLogout, textWhite = true, hasOutline = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const shortName = user.publicName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("") || user.username.charAt(0).toUpperCase();

  const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 1 };
  return (
    <Box>
      <IconButton
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        title="Account menu"
        sx={{ mr: -1, ml: -1 }}
      >
        <UserAvatar user={user} />
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        <MenuItem component={NavLink} sx={{ pointerEvents: 'none' }}>
          <Typography variant="h6" component="span" className="d-flex align-items-center">
            <UserAvatar user={user} size={48} sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h5">{user.publicName}</Typography>   
              <Typography fontSize={14}>@{user.username}</Typography>                            
            </Box>
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem component={NavLink} to="/myaccount" onClick={handleClose} sx={menuItemStyle}>
          <AccountBoxIcon fontSize="small" /> 
          My Profile
        </MenuItem>
        <MenuItem component={NavLink} to="/editprofile" onClick={handleClose} sx={menuItemStyle}>
          <ManageAccountsIcon fontSize="small" /> 
          Edit Profile
        </MenuItem>
        <MenuItem component={NavLink} to="/dashboard" onClick={handleClose} sx={menuItemStyle}>
          <DashboardIcon fontSize="small" /> 
          Dashboard
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => { 
            handleLogout(); 
            handleClose(); 
          }}
          sx={{ color: (theme) => theme.palette.error.main }} >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserDropdown;