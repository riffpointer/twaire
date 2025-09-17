# Twaire - Features

This document provides a technical overview of Twaire, detailing its architecture, technologies, and key components.

## Twaire Server (`twaire-backend`)

The backend is a Node.js application built with Express.js, providing a RESTful API for communication with the Twaire frontend.

*   **Core Technologies:**
    *   **Framework:** Express.js
    *   **Database:** MongoDB (using Mongoose for ODM)
    *   **Language:** JavaScript (ES Modules)
    *   **Package Manager:** npm

*   **Architecture & Features:**
    *   **API:** RESTful API organized into routes. Foe e.g `users`, `videos`, `comments`, etc.
    *   **Authentication:** Session-based authentication managed by `express-session` with `connect-mongo` for session storage. Passwords are encrypted using `bcrypt`.
    *   **Database Schema:** Mongoose schemas define the structure for `User`, `Video`, `Comment`, and `Reply` models.
    *   **File Handling:** `multer` is used for handling multipart/form-data, primarily for video and profile picture uploads.
    *   **Static File Serving:** Express serves static assets for user-uploaded content like videos (`/uploads`), thumbnails (`/thumbnails`), and profile pictures (`/profile_pictures`).
    *   **CORS:** Configured to allow requests from the frontend development server.
    *   **Configuration:** Relies on environment variables for sensitive data like database connection strings and session secrets (see `.env.example`).

## Twaire UI/Frontend (`twaire-frontend`)

The frontend is a single-page application (SPA) built with React.

*   **Technologies used:**
    *   **Framework:** React
    *   **Build Tool:** Vite
    *   **Language:** JavaScript (JSX)
    *   **Package Manager:** npm
    *   **Styling:** A combination of Material-UI (`@mui/material`) components and Bootstrap utilities/icons.

*   **Architecture & Features:**
    *   **Component Model:** Follows a component-based architecture, with reusable components for UI elements like `VideoCard`, `CommentSection`, `Navbar`, etc.
    *   **Routing:** Client-side routing is handled by `react-router-dom`, mapping paths to different page components (e.g., `Home`, `Watch`, `ProfileSettings`).
    *   **State Management:** Uses React's built-in state management (useState, useContext) for local and shared state.
    *   **Development Environment:** Vite provides a fast development server with Hot Module Replacement (HMR).
