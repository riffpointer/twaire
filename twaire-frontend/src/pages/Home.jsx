import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Strings from '../utils/Strings.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    document.title = "Home - Twaire";
    fetchVideos(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const fetchVideos = async (sortOption) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/videos?sort=${sortOption}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="display-4">Welcome to Twaire!</h2>
        <p>{Strings.branding.description}</p>
        <hr />

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">
            {sort === "latest" ? "Latest uploads" : "Trending now"}
          </h3>
          <select
            className="form-select w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        <div className="mb-3">
          {loading ? (
            <p>Loading videos...</p>
          ) : videos.length === 0 ? (
            <p>No videos uploaded yet.</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-2">
              {videos.map((video) => (
                <div className="col mt-0 mb-4" key={video._id}>
                  <Link
                    to={`/watch/${video._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <VideoCard
                      title={video.title}
                      channel={video.channel || "Twaire"}
                      views={video.views ?? 0}
                      thumbnail={video.thumbnail}
                      description={video.description}
                      uploadedAt={video.uploadedAt}
                    />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;
