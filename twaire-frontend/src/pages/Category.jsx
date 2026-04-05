import { Box, Container, FormControl, InputLabel, MenuItem, Select, Skeleton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoGrid from "@/components/VideoGrid.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import {
  getVideoCategoryLabel,
  isVideoCategory,
} from "../utils/VideoCategories.js";

function CategorySkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: 3,
        mt: 1,
      }}
    >
      {[...Array(6)].map((_, index) => (
        <Box key={`category-skeleton-${index}`}>
          <Skeleton
            variant="rounded"
            height={0}
            sx={{ pt: "56.25%", borderRadius: 2, mb: 1.25 }}
          />
          <Skeleton variant="text" width={`${70 - (index % 3) * 10}%`} height={34} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="56%" />
        </Box>
      ))}
    </Box>
  );
}

function Category() {
  const { category = "" } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState("recent");

  const categoryKey = category.trim().toLowerCase();
  const categoryLabel = getVideoCategoryLabel(categoryKey);
  const categoryValid = isVideoCategory(categoryKey);

  useEffect(() => {
    document.title = categoryValid
      ? `Category: ${categoryLabel} - Twaire`
      : "Category not found - Twaire";
  }, [categoryValid, categoryLabel]);

  useEffect(() => {
    const fetchCategoryVideos = async () => {
      if (!categoryValid) {
        setVideos([]);
        setLoading(false);
        setNotFound(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/category/${encodeURIComponent(categoryKey)}?sort=${encodeURIComponent(sort)}`,
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            setVideos([]);
            return;
          }
          throw new Error(data.error || "Failed to fetch category videos");
        }

        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryVideos();
  }, [categoryKey, categoryValid, sort]);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          mb: { xs: 4, sm: 2 },
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            textAlign: { xs: "center", sm: "left" },
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {categoryValid ? (
            <>
              <Box component="span" sx={{ fontWeight: 700 }}>
                Category
              </Box>
              : {categoryLabel}
            </>
          ) : (
            "Category not found"
          )}
        </Typography>

        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="category-sort-label">Sort by</InputLabel>
          <Select
            labelId="category-sort-label"
            id="category-sort"
            value={sort}
            label="Sort by"
            onChange={(event) => setSort(event.target.value)}
          >
            <MenuItem value="recent">Recent videos</MenuItem>
            <MenuItem value="trending">Trending videos</MenuItem>
            <MenuItem value="views">Most viewed videos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && <CategorySkeleton />}

      {!loading && error && (
        <Typography variant="body1" color="error">
          Unable to load category videos: {error}
        </Typography>
      )}

      {!loading && notFound && !error && (
        <Typography variant="body1" color="text.secondary">
          This category does not exist.
        </Typography>
      )}

      {!loading && !error && !notFound && videos.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No videos found in <b>{categoryLabel}</b>.
        </Typography>
      )}

      {!loading && !error && !notFound && <VideoGrid videos={videos} />}
    </Container>
  );
}

export default Category;
