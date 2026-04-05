import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import SortIcon from "@mui/icons-material/Sort";
import CommentIcon from "@mui/icons-material/Comment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import WebIcon from "@mui/icons-material/Web";
import DnsIcon from "@mui/icons-material/Dns";
import StorageIcon from "@mui/icons-material/Storage";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { ContentContainer } from "@/components/Containers.jsx";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer.jsx";
import ApiConfig from "../utils/ApiConfig.js";

function SectionHeader({ title, description }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}

function FeatureCards() {
  const features = [
    {
      title: "Upload videos",
      desc: "Upload your own videos with custom thumbnails.",
      icon: <CloudUploadIcon fontSize="small" />,
    },
    {
      title: "Responsive player",
      desc: "Watch videos with a clean, responsive playback experience.",
      icon: <PlayCircleIcon fontSize="small" />,
    },
    {
      title: "View tracking",
      desc: "Automatic view counting and performance visibility.",
      icon: <BarChartIcon fontSize="small" />,
    },
    {
      title: "Sorting options",
      desc: "Browse uploads by trending or recent activity.",
      icon: <SortIcon fontSize="small" />,
    },
    {
      title: "Reactions",
      desc: "Like and dislike videos to express feedback.",
      icon: <ThumbUpIcon fontSize="small" />,
    },
    {
      title: "Comments",
      desc: "Join discussions with threaded replies and interactions.",
      icon: <CommentIcon fontSize="small" />,
    },
  ];

  return (
    <Grid container spacing={2}>
      {features.map((feature) => (
        <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "action.hover",
                  color: "primary.main",
                  mb: 1.5,
                }}
              >
                {feature.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.desc}
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
          <Card elevation={2} sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent sx={{ p: 2.25 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "action.hover",
                    color: "primary.main",
                  }}
                >
                  {stack.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {stack.label}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {stack.items.map((item) => (
                  <Chip
                    key={item.name}
                    label={item.name}
                    component="a"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    sx={{ borderRadius: 1 }}
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
        {!bannerLoaded && <Skeleton variant="rectangular" width="100%" height={320} />}
        <img
          src={`${ApiConfig.serverUrl}/res/branding/TwaireBannerFront.png`}
          alt="Twaire banner"
          style={{ width: "100%", display: bannerLoaded ? "block" : "none" }}
          onLoad={() => setBannerLoaded(true)}
        />
      </Box>

      <ContentContainer>
        <Paper elevation={3} sx={{ p: { xs: 2.25, md: 3 }, borderRadius: 2.5, mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            About Twaire
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
            Twaire is a lightweight, open-source video sharing platform built with React, Node.js, Express, and
            MongoDB. Upload videos, discover content, and engage with comments in a straightforward, fast interface.
          </Typography>
        </Paper>

        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, mb: 3 }}>
          <SectionHeader
            title="Features"
            description="The core capabilities currently available in Twaire."
          />
          <FeatureCards />
        </Paper>

        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, mb: 3 }}>
          <SectionHeader
            title="Tech Stack"
            description="Main frontend, backend, and data technologies used in production."
          />
          <TechStack />
        </Paper>

        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, mb: 3 }}>
          <SectionHeader title="Author" />
          <Card elevation={0} sx={{ borderRadius: 2, bgcolor: "action.hover" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src="https://placehold.co/128" sx={{ width: 50, height: 50 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  theonlyasdk
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Twaire is primarily developed and maintained by{" "}
                  <MuiLink href="https://github.com/theonlyasdk" target="_blank" rel="noopener noreferrer" underline="hover">
                    theonlyasdk
                  </MuiLink>
                  .
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Paper>

        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, mb: 5 }}>
          <SectionHeader title="License" />
          <Divider sx={{ mb: 1.75 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Twaire</strong> is open source software licensed under the{" "}
            <MuiLink href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" underline="hover">
              MIT License
            </MuiLink>
            . The source code is available on{" "}
            <MuiLink href="https://github.com/theonlyasdk/twaire" target="_blank" rel="noopener noreferrer" underline="hover">
              GitHub
            </MuiLink>
            .
          </Typography>
        </Paper>
      </ContentContainer>

      <Footer />
    </>
  );
}

export default About;
