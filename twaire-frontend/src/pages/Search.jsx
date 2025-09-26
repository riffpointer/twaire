import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, MenuItem, TextField, Typography, Grid, Container } from "@mui/material";
import Loading from "../components/Loading.jsx";
import VideoCard from "../components/VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";

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
          mb: 3,
        }}
      >
        <Typography variant="h5">
          Search Results for: <b>{searchTerm}</b>
        </Typography>
        <TextField
          select
          label="Sort by"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          variant="outlined"
          sx={{ minWidth: 200 }}
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

      <Grid container spacing={3} mt={1}>
        {videos.map((video) => (
          <Grid item xs={12} md={6} lg={3} key={video._id}>
            <Link
              to={`/watch/${video._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <VideoCard video={video} />
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Search;
