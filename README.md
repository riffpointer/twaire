# Twaire

Twaire is an open source video sharing platform, where users are free to share their videos, watch other videos and post their opinions about the videos they watch.

## Tech stack
Twaire is built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) and uses [MongoDB](https://www.mongodb.com/) for storage. The frontend is powered by [React](https://reactjs.org/) and communicates with the backend via [RESTful APIs](https://restfulapi.net/).


## Features

- Upload your own videos, with custom thumbnails and tags
- Watch videos and post comments to share your opinions about the video
- More features coming soon...!

## Installation

### Prerequisites

To run a local instance of Twaire, you must have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/)
- [MongoDB Server](https://www.mongodb.com/try/download/community) (running locally or accessible remotely)

### Running
Twaire has two components: 
 - the **backend server** 
 - and a **ReactJS powered frontend**.

To start up a Twaire instance, you must start both the frontend and the backend.

The installation is quite easy, just follow the instructions below and run the commands (works on most operating systems, assuming you have Git and NodeJS installed)

#### 1. Clone the repository:
```bash
git clone https://github.com/theonlyasdk/twaire.git
cd twaire
```

#### 2. Start the backend server

```bash
cd twaire-backend
npm install
npm install -g nodemon  # (Optional: Only required if you wish to change index.js)
npm run dev
```

#### 3. Then start the frontend server
```bash
cd ..                   # If you cd-ed into twaire-backend
cd twaire-frontend
npm install
npm run dev             # Will start up Vite
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
