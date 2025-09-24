import { Avatar, Box, Card, CardContent, CardMedia, Container, Divider, Typography } from "@mui/material";
import { useEffect } from "react";
import Footer from "../components/Footer.jsx";

function FeatureCards() {
  const features = [
    {
      title: "Upload videos",
      desc: "Upload videos with custom thumbnails",
      img: "https://placehold.co/150?text=Upload",
    },
    {
      title: "Responsive Player",
      desc: "Watch videos in a responsive player",
      img: "https://placehold.co/150?text=Player",
    },
    {
      title: "View Tracking",
      desc: "Automatic view tracking",
      img: "https://placehold.co/150?text=Tracking",
    },
    {
      title: "Sorting Options",
      desc: "Trending vs. latest sorting on the home page",
      img: "https://placehold.co/150?text=Sorting",
    },
    {
      title: "Sorting Options",
      desc: "Trending vs. latest sorting on the home page",
      img: "https://placehold.co/150?text=Sorting",
    },
    {
      title: "Sorting Options",
      desc: "Trending vs. latest sorting on the home page",
      img: "https://placehold.co/150?text=Sorting",
    },
  ];

  return (
    <Box sx={{
      display: "flex",
      gap: 2,
      overflowX: "auto",
      flexWrap: "nowrap",
      pb: 1,
    }}>
      {features.map((f, idx) => (
        <Card key={idx} sx={{ minWidth: 270, width: 270, borderRadius: 2, boxShadow: 3 }}>
          <CardMedia
            component="img"
            height="140"
            image={f.img}
            alt={f.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {f.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {f.desc}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}


function About() {
  useEffect(() => {
    document.title = "About - Twaire";
  }, []);

  return (
    <>
      <Container sx={{ mt: 2 }}>
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            About Twaire
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Twaire is an open-source video sharing platform built with React,
            Node.js, Express, and MongoDB. It’s a lightweight alternative to
            YouTube where users can upload, watch, and explore videos.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Features
          </Typography>
          <FeatureCards />
        </Box>

        <Typography variant="h4" gutterBottom>Tech Stack</Typography>
        <Box mb={4}>
          <strong>Frontend:</strong>{" "}
          <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React (Vite)</a>,{" "}
          <a href="https://getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap</a>,{" "}
          <a href="https://reactrouter.com/" target="_blank" rel="noopener noreferrer">React Router</a>
          <br />
          <strong>Backend:</strong>{" "}
          <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js</a>,{" "}
          <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">Express</a>,{" "}
          <a href="https://github.com/expressjs/multer" target="_blank" rel="noopener noreferrer">Multer</a>
          <br />
          <strong>Database:</strong>{" "}
          <a href="https://www.mongodb.com/" target="_blank" rel="noopener noreferrer">MongoDB</a> (
          <a href="https://mongoosejs.com/" target="_blank" rel="noopener noreferrer">Mongoose</a>)
        </Box>

        <Typography variant="h4" gutterBottom>Author</Typography>
        <Card sx={{ mb: 4, p: 2, borderRadius: 2, display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>        
          <Avatar src="https://placehold.co/128" sx={{ width: 64, height: 64 }} />
          <Box>
            <Typography variant="h5">theonlyasdk</Typography>
            <Typography variant="subtitle1">
              Twaire is primarily developed and maintained by <a href="https://github.com/theonlyasdk" target="_blank" rel="noopener noreferrer">theonlyasdk</a>.
            </Typography>            
          </Box>
        </Card>

        {/* Add license info and link to https://github.com/theonlyasdk/twaire */}
        <Typography variant="h4" gutterBottom>License</Typography>
        <p>
          Twaire is open source software licensed under the{" "}
          <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License</a>.
          You can find the source code on{" "}
          <a href="https://github.com/theonlyasdk/twaire" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </Container>
      <Footer />
    </>
  );
}

export default About;
