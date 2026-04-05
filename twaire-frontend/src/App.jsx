import { useMemo, useState, createContext, useContext, lazy, Suspense, useEffect, useRef } from "react";
import { CssBaseline, LinearProgress, ThemeProvider, Toolbar } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import AppBar from "./components/AppBarHeader.jsx";
import QueuePanel from "./components/QueuePanel.jsx";
import { QueueContext } from "./contexts/QueueContext.jsx";

function InfinitySpinner() {
  return (
    <div style={{
      width: "100%",
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <svg className="_loading-svg" x="0px" y="0px" viewBox="0 0 55 23.1" height="23.1" width="55" preserveAspectRatio='xMidYMid meet'>
        <path className="track" fill="none" strokeWidth="4" pathLength="100"
          d="M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z" />
        <path className="car" fill="none" strokeWidth="4" pathLength="100"
          d="M26.7,12.2c3.5,3.4,7.4,7.8,12.7,7.8c5.5,0,9.6-4.4,9.6-9.5C49,5,45.1,1,39.8,1c-5.5,0-9.5,4.2-13.1,7.8l-3.4,3.3c-3.6,3.6-7.6,7.8-13.1,7.8C4.9,20,1,16,1,10.5C1,5.4,5.1,1,10.6,1c5.3,0,9.2,4.5,12.7,7.8L26.7,12.2z" />
      </svg>
    </div>
  );
}

const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Watch = lazy(() => import("./pages/Watch.jsx"));
const User = lazy(() => import("./pages/User.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Trending = lazy(() => import("./pages/Trending.jsx"));
const Subscriptions = lazy(() => import("./pages/Subscriptions.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Features = lazy(() => import("./pages/Features.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const MyAccount = lazy(() => import("./pages/MyAccount.jsx"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings.jsx"));
const Category = lazy(() => import("./pages/Category.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Playlist = lazy(() => import("./pages/Playlist.jsx"));

export const ColorModeContext = createContext({ toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);
export const NavigationProgressContext = createContext({ start: () => {} });
export const useNavigationProgress = () => useContext(NavigationProgressContext);

function NavigationProgressBridge({ progress, setProgress }) {
  const location = useLocation();
  const timerRef = useRef(null);

  useEffect(() => {
    if (progress <= 0) return undefined;

    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => setProgress(0), 180);
    }, 140);

    return () => window.clearTimeout(timerRef.current);
  }, [location.key, progress, setProgress]);

  useEffect(() => {
    const handleClick = (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      const download = anchor.getAttribute("download");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target === "_blank" ||
        download !== null ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setProgress(22);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setProgress((current) => (current > 0 ? 72 : current)), 120);
    };

    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, [setProgress]);

  return null;
}

function ScrollToTopBridge() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("theme-mode") || "light");
  const [navProgress, setNavProgress] = useState(0);
  const [queueItems, setQueueItems] = useState([]);
  const [isQueueExpanded, setIsQueueExpanded] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

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
        components: {
          MuiCssBaseline: {
            styleOverrides: (themeParam) => ({
              html: {
                backgroundColor: themeParam.palette.background.default,
              },
              body: {
                backgroundColor: themeParam.palette.background.default,
                color: themeParam.palette.text.primary,
                minHeight: "100vh",
              },
              "#root": {
                minHeight: "100vh",
                backgroundColor: themeParam.palette.background.default,
                color: themeParam.palette.text.primary,
              },
            }),
          },
          MuiSkeleton: {
            defaultProps: {
              animation: false,
            },
            styleOverrides: {
              root: ({ theme: t }) => ({
                position: "relative",
                overflow: "hidden",
                borderRadius: 8,
                backgroundColor:
                  t.palette.mode === "dark"
                    ? alpha(t.palette.common.white, 0.12)
                    : alpha(t.palette.common.black, 0.08),
                animation: "muiSkeletonEnter 140ms ease-out both",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(90deg, transparent, ${
                    t.palette.mode === "dark"
                      ? alpha(t.palette.common.white, 0.16)
                      : alpha(t.palette.common.white, 0.52)
                  }, transparent)`,
                  transform: "translateX(-100%)",
                  animation: "muiSkeletonShimmer 980ms ease-in-out infinite",
                },
                "@keyframes muiSkeletonEnter": {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
                "@keyframes muiSkeletonShimmer": {
                  from: { transform: "translateX(-100%)" },
                  to: { transform: "translateX(100%)" },
                },
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  "&::after": { animation: "none" },
                },
              }),
            },
          },
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

  const queueApi = useMemo(
    () => ({
      queueItems,
      isQueueExpanded,
      setIsQueueExpanded,
      addToQueue: (video) => {
        if (!video?._id) return;
        setIsQueueExpanded(true);
        setQueueItems((current) => {
          if (current.some((item) => item._id === video._id)) return current;
          return [
            ...current,
            {
              _id: video._id,
              title: video.title || "Untitled video",
              thumbnail: video.thumbnail || null,
            },
          ];
        });
      },
      removeFromQueue: (videoId) => {
        setQueueItems((current) => current.filter((item) => item._id !== videoId));
      },
      clearQueue: () => setQueueItems([]),
    }),
    [queueItems, isQueueExpanded],
  );

  return (
    <ColorModeContext.Provider value={{ ...colorMode, mode }}>
      <NavigationProgressContext.Provider
        value={{
          start: () => {
            setNavProgress(22);
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <NavigationProgressBridge progress={navProgress} setProgress={setNavProgress} />
            <ScrollToTopBridge />
            <LinearProgress
              variant="determinate"
              value={navProgress}
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.tooltip + 1,
                height: 3,
                opacity: navProgress > 0 ? 1 : 0,
                transition: "opacity 120ms ease",
                "& .MuiLinearProgress-bar": {
                  transition: "transform 180ms ease",
                },
              }}
            />
            <AppBar />
            <Toolbar
              sx={{
                minHeight: { xs: 56, md: 50 },
              }}
            />
            <QueueContext.Provider value={queueApi}>
              <Suspense fallback={<InfinitySpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/user/:username" element={<User />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/terms-and-conditions" element={<Terms />} />
                  <Route path="/myaccount" element={<MyAccount />} />
                  <Route path="/editprofile" element={<ProfileSettings />} />
                  <Route path="/category/:category" element={<Category />} />
                  <Route path="/playlist/:id" element={<Playlist />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <QueuePanel />
            </QueueContext.Provider>
          </BrowserRouter>
        </ThemeProvider>
      </NavigationProgressContext.Provider>
    </ColorModeContext.Provider>
  );
}

export default App;
