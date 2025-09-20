import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ApiConfig from '../utils/ApiConfig';

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

    return (
        <Box>
            <Button
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className={textWhite ? "text-white" : ""}
                disableElevation={hasOutline}
                sx={{ textTransform: 'none' }}
                title="Account menu"
                variant={hasOutline ? "contained" : ""}
            >
                <i className="bi bi-person-fill me-2 mb-0" style={{ lineHeight: 0 }}></i>
                <Typography variant="body1" component="span">
                    {user.publicName || user.username}
                </Typography>
            </Button>
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
                        <img
                            src={user.profilePicture ? `${ApiConfig.serverUrl}/${user.profilePicture}` : `${ApiConfig.serverUrl}/api/helper/placeholder/48x48?text=${shortName}`}
                            alt={user.publicName || user.username}
                            className="rounded-circle me-2"
                            width={48}
                            height={48}
                        />
                        {user.publicName || user.username}
                    </Typography>
                </MenuItem>
                <Divider />
                <MenuItem component={NavLink} to="/myaccount" onClick={handleClose}>
                    <i className="bi bi-person-fill me-2"></i> My Profile
                </MenuItem>
                <MenuItem component={NavLink} to="/editprofile" onClick={handleClose}>
                    <i className="bi bi-gear-fill me-2"></i> Profile Settings
                </MenuItem>
                <MenuItem component={NavLink} to="/upload" onClick={handleClose}>
                    <i className="bi bi-arrow-bar-up me-2"></i> Upload a video
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