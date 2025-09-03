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

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/user/:username" element={<User />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
