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
    <div className="row g-3 mt-1">
      {[...Array(6)].map((_, index) => (
        <div key={`search-skeleton-${index}`} className="col-12 col-sm-6 col-md-4">
          <div className="placeholder-glow">
            <div className="placeholder rounded-4 d-block w-100 mb-3" style={{ paddingTop: "56.25%" }} />
            <div className="placeholder rounded col-9 mb-2" style={{ height: 24 }} />
            <div className="d-flex align-items-center gap-2 mt-2 mb-2">
              <div className="placeholder rounded-circle" style={{ width: 24, height: 24 }} />
              <div className="placeholder rounded col-4" style={{ height: 16 }} />
            </div>
            <div className="placeholder rounded col-6" style={{ height: 16 }} />
          </div>
        </div>
      ))}
    </div>
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
    <div className="container">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h1 className="h5 text-center text-sm-start mb-0 text-truncate w-100">
          Search Results for: <b>{searchTerm}</b>
        </h1>
        <div className="d-flex flex-column flex-sm-row gap-2 flex-shrink-0" style={{ minWidth: 220 }}>
          <select className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="date">Upload date (Newest first)</option>
            <option value="views">Most viewed</option>
          </select>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={openFilters}>
            <i className="bi bi-funnel me-1" />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </div>

      {!loading && !error && activeFilterCount > 0 && (
        <p className="text-body-secondary mb-2">
          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
        </p>
      )}

      {loading && <SearchResultsSkeleton />}
      {error && (
        <p className="text-danger">
          Unable to fetch search results: {error}
        </p>
      )}

      {!loading && !error && videos.length === 0 && (
        <p className="text-body-secondary">
          No videos found for search term <b>"{searchTerm}"</b>.
        </p>
      )}

      {!loading && !error && videos.length > 0 && filteredVideos.length === 0 && (
        <p className="text-body-secondary">
          No videos match your current filters.
        </p>
      )}

      <VideoGrid videos={filteredVideos} />

      {filtersOpen ? (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">Search Filters</h2>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeFilters} />
              </div>
              <div className="modal-body">
                <div className="d-grid gap-3">
                  <select className="form-select form-select-sm" value={draftFilters.category} onChange={(event) => setDraftFilters((previous) => ({ ...previous, category: event.target.value }))}>
                    <option value="all">All categories</option>
                    {VIDEO_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select className="form-select form-select-sm" value={draftFilters.uploadedWithin} onChange={(event) => setDraftFilters((previous) => ({ ...previous, uploadedWithin: event.target.value }))}>
                    <option value="any">Any time</option>
                    <option value="today">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                  </select>
                  <input className="form-control form-control-sm" placeholder="Uploader public name or username" value={draftFilters.channel} onChange={(event) => setDraftFilters((previous) => ({ ...previous, channel: event.target.value }))} />
                  <div className="row g-2">
                    <div className="col-6">
                      <input className="form-control form-control-sm" placeholder="Min views" inputMode="numeric" value={draftFilters.minViews} onChange={(event) => setDraftFilters((previous) => ({ ...previous, minViews: event.target.value.replace(/[^\d]/g, "") }))} />
                    </div>
                    <div className="col-6">
                      <input className="form-control form-control-sm" placeholder="Max views" inputMode="numeric" value={draftFilters.maxViews} onChange={(event) => setDraftFilters((previous) => ({ ...previous, maxViews: event.target.value.replace(/[^\d]/g, "") }))} />
                    </div>
                  </div>
                  <input className="form-control form-control-sm" placeholder="comma,separated,tags" value={draftFilters.tags} onChange={(event) => setDraftFilters((previous) => ({ ...previous, tags: event.target.value }))} />
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={draftFilters.verifiedOnly} onChange={(event) => setDraftFilters((previous) => ({ ...previous, verifiedOnly: event.target.checked }))} id="verified-only" />
                    <label className="form-check-label" htmlFor="verified-only">Verified channels only</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={resetFilters}>Reset</button>
                <button className="btn btn-secondary" onClick={closeFilters}>Cancel</button>
                <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Search;
