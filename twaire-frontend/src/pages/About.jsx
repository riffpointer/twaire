import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  Skeleton,
  Typography,
} from "@mui/material";
import { ContentContainer } from "@/components/Containers.jsx";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import SortIcon from "@mui/icons-material/Sort";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import WebIcon from "@mui/icons-material/Web";
import DnsIcon from "@mui/icons-material/Dns";
import StorageIcon from "@mui/icons-material/Storage";

function FeatureCards() {
  const features = [
    {
      title: "Upload videos",
      desc: "Upload your own videos with custom thumbnails",
      icon: <CloudUploadIcon fontSize="large" />,
    },
    {
      title: "Responsive Player",
      desc: "Watch videos in a responsive video player",
      icon: <PlayCircleIcon fontSize="large" />,
    },
    {
      title: "View Tracking",
      desc: "Automatic view tracking for all videos",
      icon: <BarChartIcon fontSize="large" />,
    },
    {
      title: "Sorting Options",
      desc: "Browse by trending or latest uploads",
      icon: <SortIcon fontSize="large" />,
    },
    {
      title: "Reactions",
      desc: "Like and dislike videos to share your opinion",
      icon: <ThumbUpIcon fontSize="large" />,
    },
    {
      title: "Comments",
      desc: "Post comments and join the discussion",
      icon: <CommentIcon fontSize="large" />,
    },
  ];

  return (
    <Grid container spacing={2}>
      {features.map((f, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box color="primary.main" mb={1}>
                {f.icon}
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {f.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {f.desc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function TechStack() {
  const stacks = [
    {
      label: "Frontend",
      icon: <WebIcon fontSize="small" />,
      items: [
        { name: "React (Vite)", url: "https://react.dev/" },
        { name: "MUI", url: "https://mui.com/" },
        { name: "React Router", url: "https://reactrouter.com/" },
        { name: "Bootstrap", url: "https://getbootstrap.com/" },
      ],
    },
    {
      label: "Backend",
      icon: <DnsIcon fontSize="small" />,
      items: [
        { name: "Node.js", url: "https://nodejs.org/" },
        { name: "Express", url: "https://expressjs.com/" },
        { name: "Multer", url: "https://github.com/expressjs/multer" },
      ],
    },
    {
      label: "Database",
      icon: <StorageIcon fontSize="small" />,
      items: [
        { name: "MongoDB", url: "https://www.mongodb.com/" },
        { name: "Mongoose", url: "https://mongoosejs.com/" },
      ],
    },
  ];

  return (
    <Grid container spacing={2}>
      {stacks.map((stack) => (
        <Grid key={stack.label} size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, color: "text.secondary" }}>
                {stack.icon}
                <Typography variant="subtitle2" fontWeight={700}>
                  {stack.label}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {stack.items.map((item) => (
                  <Chip
                    key={item.name}
                    label={item.name}
                    component="a"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function About() {
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    document.title = "About - Twaire";
  }, []);

  return (
    <>
      <Box sx={{ width: "100%", mb: 4, mt: -4 }}>
        {!bannerLoaded && (
          <Skeleton variant="rectangular" width="100%" height={360} />
        )}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Banner"
          style={{ width: "100%", display: bannerLoaded ? "block" : "none" }}
          onLoad={() => setBannerLoaded(true)}
        />
      </Box>

      <ContentContainer>
        <Box mb={5}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            About
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Twaire is an open-source video sharing platform built with React,
            Node.js, Express, and MongoDB. It's a lightweight alternative to
            YouTube where users can upload, watch, and explore videos.
          </Typography>
        </Box>

        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Features
          </Typography>
          <FeatureCards />
        </Box>

        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Tech Stack
          </Typography>
          <TechStack />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Author
          </Typography>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src="https://placehold.co/128"
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  theonlyasdk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Twaire is primarily developed and maintained by{" "}
                  <MuiLink
                    href="https://github.com/theonlyasdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    theonlyasdk
                  </MuiLink>
                  .
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box mb={5}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            License
          </Typography>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Twaire</strong> is open source software licensed under the{" "}
                <MuiLink
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  MIT License
                </MuiLink>
                . You can find the source code on{" "}
                <MuiLink
                  href="https://github.com/theonlyasdk/twaire"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  GitHub
                </MuiLink>
                .
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </ContentContainer>
      <Footer />
    </>
  );
}

export default About;
