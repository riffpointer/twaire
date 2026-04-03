import { Box, List, Link, ListItem, Typography, Divider, ListItemButton, ListItemText, Drawer, ListItemIcon, Switch } from "@mui/material";
import { useColorMode } from "../App.jsx";
import { NavLink } from "react-router-dom";
import DarkModeIcon from "@mui/icons-material/DarkMode";

function AppDrawer({ navLinkPages, open, toggleDrawer }) {
	const { mode, toggleColorMode } = useColorMode();

	return (
		<Drawer open={open} onClose={toggleDrawer(false)}>
			<Box sx={{ width: 250, height: "100%", display: "flex", justifyContent: "space-between", flexDirection: "column" }} role="presentation" onClick={toggleDrawer(false)}>
				<List>
					<ListItem>
						<Typography variant="h5">Twaire</Typography>
					</ListItem>
					<Divider />
					{Object.entries(navLinkPages).map(([label, navLink]) => (
						<ListItem key={label} disablePadding>
							<ListItemButton component={NavLink} to={navLink.path}>
								<ListItemIcon sx={{ minWidth: 40 }}>
									{navLink.icon || null}
								</ListItemIcon>
								<ListItemText primary={label} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
				<Box>
					<Divider />
					<ListItem disablePadding>
						<ListItemButton onClick={toggleColorMode}>
							<ListItemIcon sx={{ minWidth: 40 }}>
								<DarkModeIcon />
							</ListItemIcon>
							<ListItemText primary="Dark mode" />
							<Switch checked={mode === "dark"} edge="end" disableRipple />
						</ListItemButton>
					</ListItem>
					<Typography variant="caption" color="text.secondary" p={2}>
						&copy; 2025{' '}
						<Link href="http://github.com/theonlyasdk" color="inherit" underline="hover">
							theonlyasdk
						</Link>
					</Typography>
				</Box>
			</Box>
		</Drawer>
	)
}

export default AppDrawer;