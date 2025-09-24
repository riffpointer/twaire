import { Box, List, ListItem, Typography, Divider, ListItemButton, ListItemText, Drawer, ListItemIcon } from "@mui/material";
import { NavLink } from "react-router-dom";

function AppDrawer({ navLinkPages, open, toggleDrawer }) {
	return (
		<Drawer open={open} onClose={toggleDrawer(false)}>
			<Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
				<List>
					<ListItem>
						<Typography variant="h5">Twaire</Typography>
					</ListItem>
					<Divider />
					{Object.entries(navLinkPages).map(([label, navLink]) => (
						<ListItem key={label} disablePadding>
							<ListItemButton component={NavLink} to={navLink.path}>
								<ListItemIcon sx={{minWidth:40}}>
									{navLink.icon || null}
								</ListItemIcon>
								<ListItemText primary={label} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>
		</Drawer>
	)
}

export default AppDrawer;