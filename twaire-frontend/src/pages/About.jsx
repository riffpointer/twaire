import { useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function About() {
  useEffect(() => {
    document.title = "About - Twaire";
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-4 mb-4">
        <h1 className="display-4">About Twaire</h1>
        <p className="lead">
          Twaire is an open source video sharing platform built with React, Node.js,
          Express, and MongoDB. It’s designed as a lightweight YouTube-style
          video platform where users can upload, watch, and explore videos.
        </p>

        <hr />

        <h3>Features</h3>
        <ul>
          <li>Upload videos with custom thumbnails</li>
          <li>Watch videos in a responsive player</li>
          <li>Automatic view tracking</li>
          <li>Trending vs. latest sorting on the home page</li>
        </ul>
        <h3 className="mt-4">Tech Stack</h3>
        <p>
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
        </p>

        <h3 className="mt-4">Author</h3>
        <p>
          Twaire is primarily developed and maintained by <a href="https://github.com/theonlyasdk" target="_blank" rel="noopener noreferrer">theonlyasdk</a>.
        </p>
      </div>
      <Footer />
    </>
  );
}

export default About;
