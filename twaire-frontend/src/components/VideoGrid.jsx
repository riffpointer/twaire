import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import VideoCard from "./VideoCard";

function VideoGrid({ videos, ...props }) {
  return (
    <Grid container spacing={3} mt={1} {...props}>
      {videos.map((video) => (
        <Grid size={{ xs: 12, sm: 4 }}>
          <Link
            to={`/watch/${video._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
            key={video._id}
          >
            <VideoCard video={video} sx={{ width: { xs: "100%" } }} />
          </Link>
        </Grid>
      ))}
    </Grid>
  )
}
export default VideoGrid;