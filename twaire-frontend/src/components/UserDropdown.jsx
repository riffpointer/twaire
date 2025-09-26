import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ApiConfig from '../utils/ApiConfig';
import { Avatar, IconButton } from '@mui/material';

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
            <IconButton
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                disableElevation={hasOutline}
                title="Account menu"
                sx={{mr:-1,ml:-1}}
            >
                <Avatar
                    src={user.profilePicture && `${ApiConfig.serverUrl}/api/helper/placeholder/48x48?text=${shortName}`}
                    alt={user.publicName || user.username}
                    sx={{ width: 38, height: 38}}
                />
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
                        <Avatar
                            src={user.profilePicture && `${ApiConfig.serverUrl}/api/helper/placeholder/48x48?text=${shortName}`}
                            alt={user.publicName}
                            sx={{ width: 48, height: 48, mr: 1 }}
                        />
                        <Box>
                            <Typography variant="h5">{user.publicName}</Typography>   
                            <Typography fontSize={14}>@{user.username}</Typography>                            
                        </Box>
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