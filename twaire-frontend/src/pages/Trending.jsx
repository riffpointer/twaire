import { ContentContainer } from "@/components/Containers.jsx";
import Footer from "@/components/Footer.jsx";
import Loading from "@/components/Loading.jsx";
import VideoCard from "@/components/VideoCard.jsx";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiConfig from "../utils/ApiConfig.js";
import { NoLinkStyling } from "@/styles/LinkStyles.jsx";

function Trending() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Trending - Twaire";
    const fetchTrending = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch(`${ApiConfig.serverUrl}/api/videos/`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch trending videos");
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

    fetchTrending();
  }, []);

  return (
    <ContentContainer>
      <div>
        <Typography variant="h3" sx={{ mb: 0.5 }}>
          <WhatshotIcon sx={{ mb: 2, fontSize: 50 }} /> Trending Videos
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          These videos are going viral, take a look at them!
        </Typography>

        <Loading show={loading} label="Loading videos" />
        {error && <p className="text-danger">Error: {error}</p>}

        {!loading && !error && videos.length === 0 && (
          <Typography color="text.secondary">No trending videos found.</Typography>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-0">
          {videos.map((video) => (
            <div key={video._id} className="col">
              <Link to={`/watch/${video._id}`} style={NoLinkStyling}>
                <VideoCard video={video} />
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </ContentContainer>
  );
}

export default Trending;
