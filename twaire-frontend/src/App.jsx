import { useState } from 'react'
import './App.css'
import Home from './pages/Home.jsx';
import Watch from './pages/Watch.jsx';
import Upload from './pages/Upload.jsx';
import Login from './pages/Login.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from './pages/About.jsx';
import Signup from './pages/Signup.jsx';
import User from './pages/User.jsx';
import MyAccount from './pages/MyAccount.jsx';
import Search from './pages/Search.jsx';
import Trending from './pages/Trending.jsx';
import ProfileSettings from './pages/ProfileSettings.jsx';
import { createTheme, CssBaseline, ThemeProvider, Toolbar } from '@mui/material';
import AppBar from './components/AppBarHeader.jsx';
import { extendTheme } from '@mui/material/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#6750A4',
        },
        secondary: {
          main: '#625B71',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#D0BCFF',
        },
        secondary: {
          main: '#CCC2DC',
        },
      },
    },
  },
  shape: {
    borderRadius: 7,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={theme} noSsr>
        <CssBaseline />
        <BrowserRouter>
          <AppBar />
          <Toolbar />
          <Routes>
            {/* Public links so no authentication needed */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/watch/:id" element={<Watch />} />
            {/* Private links and need authentication */}
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/myaccount" element={<MyAccount />} />
            <Route path="/editprofile" element={<ProfileSettings />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
