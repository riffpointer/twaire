import { Link } from "react-router-dom";
import VideoCard from "./VideoCard";

function VideoGrid({ videos, ...props }) {
  return (
    <div className="row g-4 mt-2" {...props}>
      {videos.map((video) => (
        <div key={video._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <Link
            to={`/watch/${video._id}`}
            className="text-decoration-none text-reset"
          >
            <VideoCard video={video} />
          </Link>
        </div>
      ))}
    </div>
  )
}
export default VideoGrid;
