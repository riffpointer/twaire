# Twaire

Twaire is an open source video sharing platform, where users can share their videos, watch other videos and post their opinions about the videos they watch.

### Tech stack
Twaire is built with [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/) and uses [MongoDB](https://www.mongodb.com/) for storage. The frontend is powered by [React](https://reactjs.org/) and communicates with the backend via [RESTful APIs](https://restfulapi.net/).

## Features

- Watch, search and discover videos
- Add your reactions in form of likes and dislikes
- Post your opinions and clarifications to the uploader through comments
- Customize your account with bio and a custom profile picture
- Upload your own videos with custom thumbnails
- More features coming soon...!

## Installation

### Prerequisites

To run a local instance of Twaire, you must have the following installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/)
- [MongoDB Server](https://www.mongodb.com/try/download/community) (Make sure `mongod` is in your path after installing it)
- [pnpm](https://pnpm.io) can be installed with `npm install -g pnpm`
- [nodemon]() can be installed with `pnpm install -g nodemon`

### Running
Twaire has two components: 
 - the **backend server** 
 - and a **Vite/ReactJS powered frontend**.

Running the project is quite easy, just follow the instructions below and run the commands (works on most operating systems, assuming you have Git and NodeJS installed)

#### 1. Clone the repository:
```bash
git clone https://github.com/theonlyasdk/twaire.git
cd twaire
```

#### 2. Start the backend server

```bash
cd twaire-backend
pnpm install
pnpm approve-builds  # Select all packages hit enter
pnpm run dev
```

#### 3. Then start the frontend server
```bash
cd twaire-frontend
pnpm install
pnpm run dev # Will start up Vite
```

> Note: If you're on Windows, you can start the MongoDB server, the frontend and backend server at the same time by running `start.bat`.

## Contributing

Contributions are welcome! You can submit new features by forking the repository and creating a pull request. If you find any minor or major bug or glitch, feel free to open an issue!

## License

This project is licensed under the [MIT License](LICENSE).
