import { useMemo, useState, createContext, useContext } from "react";
import { CssBaseline, ThemeProvider, Toolbar } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AppBar from "./components/AppBarHeader.jsx";
import About from "./pages/About.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import MyAccount from "./pages/MyAccount.jsx";
import ProfileSettings from "./pages/ProfileSettings.jsx";
import Search from "./pages/Search.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Trending from "./pages/Trending.jsx";
import User from "./pages/User.jsx";
import Watch from "./pages/Watch.jsx";
import Features from "@/pages/Features.jsx";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("theme-mode") || "light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("theme-mode", next);
          return next;
        });
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                primary: { main: "#D0BCFF" },
                secondary: { main: "#CCC2DC" },
              }
            : {
                primary: { main: "#6750A4" },
                secondary: { main: "#625B71" },
              }),
        },
        shape: {
          borderRadius: 7,
        },
        typography: {
          fontFamily: "Inter, Roboto, Arial, sans-serif",
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={{ ...colorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppBar />
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/features" element={<Features />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/myaccount" element={<MyAccount />} />
            <Route path="/editprofile" element={<ProfileSettings />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
