import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import React from 'react';
import AccountSwitcherDialog from './AccountSwitcherDialog.jsx';
import UserAvatar from './UserAvatar.jsx';

const UserDropdown = ({
  user,
  handleLogout,
  savedAccounts = [],
  switchingUserId = null,
  handleSwitchAccount,
  handleAddAccount,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [switcherDialogOpen, setSwitcherDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleOpenSwitcher = () => {
    handleClose();
    setSwitcherDialogOpen(true);
  };

  const handleCloseSwitcher = () => {
    setSwitcherDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    handleLogout();
  };

  const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 1 };
  const menuIconProps = { fontSize: 'small', sx: { flexShrink: 0 } };
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
          <AccountBoxIcon {...menuIconProps} />
          My Profile
        </MenuItem>
        <MenuItem component={NavLink} to="/editprofile" onClick={handleClose} sx={menuItemStyle}>
          <ManageAccountsIcon {...menuIconProps} />
          Edit Profile
        </MenuItem>
        <MenuItem component={NavLink} to="/dashboard" onClick={handleClose} sx={menuItemStyle}>
          <DashboardIcon {...menuIconProps} />
          Dashboard
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleOpenSwitcher} sx={menuItemStyle}>
          <SwitchAccountIcon {...menuIconProps} />
          Switch accounts
        </MenuItem>
        <MenuItem
          onClick={handleLogoutClick}
          sx={{ ...menuItemStyle, color: (theme) => theme.palette.error.main }} >
          <LogoutIcon {...menuIconProps} />
          Logout
        </MenuItem>
      </Menu>
      <AccountSwitcherDialog
        open={switcherDialogOpen}
        onClose={handleCloseSwitcher}
        accounts={savedAccounts}
        currentUserId={user?._id}
        switchingUserId={switchingUserId}
        onSwitchAccount={async (account) => {
          await handleSwitchAccount(account);
          setSwitcherDialogOpen(false);
        }}
        onAddAccount={() => {
          setSwitcherDialogOpen(false);
          handleAddAccount();
        }}
      />
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out? This action will redirect you to
            the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDropdown;
