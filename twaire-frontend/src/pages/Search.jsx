import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import VideoCard from "../components/VideoCard.jsx";
import ApiConfig from "../utils/ApiConfig.jsx";
import Loading from "../components/Loading.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Search() {
  const query = useQuery();
  const searchTerm = query.get("q") || "";
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevance"); // default sort

  useEffect(() => {
    document.title = `${searchTerm} - Search - Twaire`;
    const fetchSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${ApiConfig.serverUrl}/api/videos/search?q=${encodeURIComponent(searchTerm)}&sort=${sort}`
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
  }, [searchTerm, sort]); // refetch when sort changes

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Search Results for: <b>{searchTerm}</b></h2>
          <select
            className="form-select w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="date">Upload date (Newest first)</option>
            <option value="views">Most viewed</option>
          </select>
        </div>

        {loading && <Loading label="Loading search results..." />}
        {error && <p className="text-danger">Unable to fetch search results: {error}</p>}

        {!loading && !error && videos.length === 0 && (
          <p className="text-muted">No videos found for search term <b>"{searchTerm}"</b>.</p>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
          {videos.map((video) => (
            <div key={video._id} className="col">
              <Link
                to={`/watch/${video._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <VideoCard
                  title={video.title}
                  channel={video.channel}
                  views={video.views || 0}
                  thumbnail={video.thumbnail}
                  description={video.description}
                  verified={video.verified}
                  uploadedAt={video.uploadedAt}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Search;
