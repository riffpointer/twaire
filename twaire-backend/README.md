# Twaire - Backend Server

The backend provides RESTful APIs and core business logic for Twaire. It handles data storage, authentication, and communication with other services. You must have MongoDB running (as a service or in the background) before you start this server.

### Prerequisites & Setup

Copy `.env.example` to `.env` and update environment variables as needed.

### Running the Server

```bash
npm run dev
```

Or you can run `start.bat` to manually start both the MongoDB server and NodeJS server. Not required if you already have MongoDB running as a service.

## Config Guide
The server configuration is stored in the `.env` file. It also contains some secrets, thus to prevent accidental leakage of those secrets, we have excluded `.env` files from our Git repo through the `.gitignore` file, so you must duplicate `.env.example` and rename it to `.env` to apply the custom settings. Below are some brief descriptions of the settings in `.env`:

* `SESSION_SECRETS`: Secret key for signing and verifying session cookies or tokens.
* `MONGO_SERVER`: MongoDB connection string, including protocol, host, port, and database name.
* `CLIENT_URL`: Origin URL of the frontend client allowed to interact with the backend (used in CORS).
* `SERVER_PORT`: Port number on which the backend server listens for requests.
* `LAN_SERVER`: Boolean flag. If true, server binds to `0.0.0.0` (accessible from LAN/public). If false, binds to `127.0.0.1` (localhost only).
