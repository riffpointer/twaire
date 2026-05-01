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
    <div className="row g-3 mt-1">
      {[...Array(6)].map((_, index) => (
        <div key={`category-skeleton-${index}`} className="col-12 col-sm-6 col-md-4">
          <div className="placeholder-glow">
            <div className="placeholder rounded-4 d-block w-100 mb-3" style={{ paddingTop: "56.25%" }} />
            <div className="placeholder rounded col-8 mb-2" style={{ height: 24 }} />
            <div className="placeholder rounded col-4 mb-2" style={{ height: 16 }} />
            <div className="placeholder rounded col-6" style={{ height: 16 }} />
          </div>
        </div>
      ))}
    </div>
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
    <div className="container">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <h1 className="h5 text-center text-sm-start mb-0 text-truncate w-100">
          {categoryValid ? (
            <>
              <span className="fw-bold">
                Category
              </span>
              : {categoryLabel}
            </>
          ) : (
            "Category not found"
          )}
        </h1>

        <div className="flex-shrink-0" style={{ minWidth: 220 }}>
          <select
            className="form-select form-select-sm"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort by"
          >
            <option value="recent">Recent videos</option>
            <option value="trending">Trending videos</option>
            <option value="views">Most viewed videos</option>
          </select>
        </div>
      </div>

      {loading && <CategorySkeleton />}

      {!loading && error && (
        <p className="text-danger">
          Unable to load category videos: {error}
        </p>
      )}

      {!loading && notFound && !error && (
        <p className="text-body-secondary">
          This category does not exist.
        </p>
      )}

      {!loading && !error && !notFound && videos.length === 0 && (
        <p className="text-body-secondary">
          No videos found in <b>{categoryLabel}</b>.
        </p>
      )}

      {!loading && !error && !notFound && <VideoGrid videos={videos} />}
    </div>
  );
}

export default Category;
