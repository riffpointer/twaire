import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const Features = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        gutterBottom
        color="primary"
      >
        Our Amazing Features
      </Typography>

      <Box
        sx={{
          mb: 6,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom color="secondary">
          Seamless Video Uploads
        </Typography>
        <Typography variant="body1" paragraph>
          Share your moments with the world! Our platform allows you to
          effortlessly upload your videos, whether they're short clips or longer
          productions. With support for various formats and intuitive controls,
          getting your content online has never been easier.
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemText primary="Fast and reliable upload speeds." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Support for multiple video formats (MP4, AVI, MOV, etc.)." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Progress tracking for large files." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Privacy settings to control who sees your content." />
          </ListItem>
        </List>
      </Box>

      <Box
        sx={{
          mb: 6,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom color="secondary">
          Personalized Profile Customization
        </Typography>
        <Typography variant="body1" paragraph>
          Make your profile truly yours! Express your unique style and
          personality with our extensive profile customization options. From
          choosing your avatar to designing your page layout, you have the power
          to create a space that reflects you.
        </Typography>
        <List>
          <ListItem disablePadding>
            <ListItemText primary="Choose from a wide range of avatars and cover photos." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Customize your profile theme and color scheme." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Add a personalized bio to tell your story." />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="Showcase your favorite videos and playlists." />
          </ListItem>
        </List>
      </Box>

      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom color="secondary">
          And Much More!
        </Typography>
        <Typography variant="body1" paragraph>
          These are just a couple of the exciting features we offer. We are
          constantly working to improve your experience with new tools and
          functionalities. Stay tuned for more updates!
        </Typography>
      </Box>
    </Container>
  );
};

export default Features;
