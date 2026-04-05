import {
  Button,
  Box,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import VideoGrid from "@/components/VideoGrid.jsx";
import ApiConfig from "../utils/ApiConfig.js";
import { VIDEO_CATEGORY_OPTIONS } from "../utils/VideoCategories.js";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsSkeleton() {
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
        <Box key={`search-skeleton-${index}`}>
          <Skeleton
            variant="rounded"
            height={0}
            sx={{
              pt: "56.25%",
              borderRadius: 2,
              mb: 1.25,
            }}
          />
          <Skeleton variant="text" width={`${72 - (index % 3) * 8}%`} height={34} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="34%" />
          </Box>
          <Skeleton variant="text" width="52%" />
        </Box>
      ))}
    </Box>
  );
}

function Search() {
  const defaultFilters = {
    category: "all",
    uploadedWithin: "any",
    channel: "",
    minViews: "",
    maxViews: "",
    tags: "",
    verifiedOnly: false,
  };
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  useEffect(() => {
    document.title = `${searchTerm} - Search - Twaire`;

    if (!searchTerm.trim()) {
      setVideos([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/search?q=${encodeURIComponent(
            searchTerm,
          )}&sort=${sort}`,
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

    fetchSearch();
  }, [searchTerm, sort]);

  const filteredVideos = useMemo(() => {
    const normalizedChannel = appliedFilters.channel.trim().toLowerCase();
    const minViews = appliedFilters.minViews.trim() === "" ? null : Number.parseInt(appliedFilters.minViews, 10);
    const maxViews = appliedFilters.maxViews.trim() === "" ? null : Number.parseInt(appliedFilters.maxViews, 10);
    const tagTerms = appliedFilters.tags
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);
    const now = Date.now();

    return videos.filter((video) => {
      if (appliedFilters.category !== "all" && video.category !== appliedFilters.category) return false;

      if (normalizedChannel) {
        const uploaderName = `${video.uploader?.publicName || ""} ${video.uploader?.username || ""}`.toLowerCase();
        if (!uploaderName.includes(normalizedChannel)) return false;
      }

      if (Number.isFinite(minViews) && (video.views || 0) < minViews) return false;
      if (Number.isFinite(maxViews) && (video.views || 0) > maxViews) return false;

      if (appliedFilters.uploadedWithin !== "any") {
        const uploadedAt = video.uploadedAt ? new Date(video.uploadedAt).getTime() : null;
        if (!uploadedAt) return false;
        const ageMs = now - uploadedAt;
        const dayMs = 24 * 60 * 60 * 1000;
        if (appliedFilters.uploadedWithin === "today" && ageMs > dayMs) return false;
        if (appliedFilters.uploadedWithin === "week" && ageMs > 7 * dayMs) return false;
        if (appliedFilters.uploadedWithin === "month" && ageMs > 30 * dayMs) return false;
        if (appliedFilters.uploadedWithin === "year" && ageMs > 365 * dayMs) return false;
      }

      if (appliedFilters.verifiedOnly && !video.uploader?.verified) return false;

      if (tagTerms.length > 0) {
        const videoTags = Array.isArray(video.tags) ? video.tags.map((tag) => String(tag).toLowerCase()) : [];
        const hasAllTags = tagTerms.every((term) => videoTags.some((videoTag) => videoTag.includes(term)));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [videos, appliedFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(appliedFilters).reduce((count, [key, value]) => {
      if (typeof value === "boolean") return value ? count + 1 : count;
      if (typeof value === "string") {
        const defaultValue = defaultFilters[key];
        return value !== defaultValue ? count + 1 : count;
      }
      return count;
    }, 0);
  }, [appliedFilters]);

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const closeFilters = () => {
    setFiltersOpen(false);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

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
          mb: { xs: 4, sm: 2 },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: { xs: 2, sm: 0 },
            textAlign: { xs: "center", sm: "left" },
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Search Results for: <b>{searchTerm}</b>
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ width: { xs: "100%", sm: "auto" }, mt: 2 }}
        >
          <TextField
            select
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            variant="outlined"
            sx={{ minWidth: { xs: "100%", sm: 200 } }}
            size="small"
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="date">Upload date (Newest first)</MenuItem>
            <MenuItem value="views">Most viewed</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={openFilters} startIcon={<FilterAltIcon />}>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        </Stack>
      </Box>

      {!loading && !error && activeFilterCount > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
        </Typography>
      )}

      {loading && <SearchResultsSkeleton />}
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

      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
        <Typography variant="body1" color="text.secondary">
          No videos match your current filters.
        </Typography>
      )}

      <VideoGrid videos={filteredVideos} />

      <Dialog open={filtersOpen} onClose={closeFilters} fullWidth maxWidth="sm">
        <DialogTitle>Search Filters</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Category"
              value={draftFilters.category}
              onChange={(event) =>
                setDraftFilters((previous) => ({ ...previous, category: event.target.value }))
              }
              size="small"
            >
              <MenuItem value="all">All categories</MenuItem>
              {VIDEO_CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Upload date"
              value={draftFilters.uploadedWithin}
              onChange={(event) =>
                setDraftFilters((previous) => ({ ...previous, uploadedWithin: event.target.value }))
              }
              size="small"
            >
              <MenuItem value="any">Any time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This week</MenuItem>
              <MenuItem value="month">This month</MenuItem>
              <MenuItem value="year">This year</MenuItem>
            </TextField>

            <TextField
              label="Channel name"
              value={draftFilters.channel}
              onChange={(event) =>
                setDraftFilters((previous) => ({ ...previous, channel: event.target.value }))
              }
              size="small"
              placeholder="Uploader public name or username"
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Min views"
                value={draftFilters.minViews}
                onChange={(event) =>
                  setDraftFilters((previous) => ({ ...previous, minViews: event.target.value.replace(/[^\d]/g, "") }))
                }
                size="small"
                inputMode="numeric"
                fullWidth
              />
              <TextField
                label="Max views"
                value={draftFilters.maxViews}
                onChange={(event) =>
                  setDraftFilters((previous) => ({ ...previous, maxViews: event.target.value.replace(/[^\d]/g, "") }))
                }
                size="small"
                inputMode="numeric"
                fullWidth
              />
            </Stack>

            <TextField
              label="Tags"
              value={draftFilters.tags}
              onChange={(event) =>
                setDraftFilters((previous) => ({ ...previous, tags: event.target.value }))
              }
              size="small"
              placeholder="comma,separated,tags"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={draftFilters.verifiedOnly}
                  onChange={(event) =>
                    setDraftFilters((previous) => ({ ...previous, verifiedOnly: event.target.checked }))
                  }
                />
              }
              label="Verified channels only"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters}>Reset</Button>
          <Button onClick={closeFilters}>Cancel</Button>
          <Button variant="contained" onClick={applyFilters}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Search;
