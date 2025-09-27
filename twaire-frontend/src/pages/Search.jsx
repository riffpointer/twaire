import { Box, Container, MenuItem, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import VideoGrid from "../components/VideoGrid.jsx";
import ApiConfig from "../utils/ApiConfig.js";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Search() {
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevance");

  const theme = useTheme();
  const displaySizeMd = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    document.title = `${searchTerm} - Search - Twaire`;
    const fetchSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/search?q=${encodeURIComponent(
            searchTerm
          )}&sort=${sort}`
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch search results");
        }
        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm.trim()) fetchSearch();
  }, [searchTerm, sort]);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          mb: { xs: 4, sm: 2 }
        }}
      >
        <Typography variant="h5" sx={{ mb: { xs: 2, sm: 0 }, textAlign: { xs: "center", sm: "left" }, width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Search Results for: <b>{searchTerm}</b>
        </Typography>

        <TextField
          select
          label="Sort by"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          variant="outlined"
          sx={{ minWidth: { xs: "100%", sm: 200 }, mt: 2 }}
          size="small"
        >
          <MenuItem value="relevance">Relevance</MenuItem>
          <MenuItem value="date">Upload date (Newest first)</MenuItem>
          <MenuItem value="views">Most viewed</MenuItem>
        </TextField>
      </Box>

      {loading && <Loading label="Loading search results..." />}
      {error && (
        <Typography variant="body1" color="error">
          Unable to fetch search results: {error}
        </Typography>
      )}

      {!loading && !error && videos.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No videos found for search term <b>"{searchTerm}"</b>.
        </Typography>
      )}

      <VideoGrid videos={videos} />
    </Container>
  );
}

export default Search;
