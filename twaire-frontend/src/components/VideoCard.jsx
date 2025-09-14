import { getRelativeTime } from "../utils/DateUtils";
import ApiConfig from "../utils/ApiConfig.jsx";
import { Card, CardActionArea, Paper } from "@mui/material";


function VideoCard({ video }) {
    const safeThumbnail = video.thumbnail
        ? `${ApiConfig.serverUrl}/thumbnails/${video.thumbnail}`
        : `https://placehold.co/320x180?text=${encodeURIComponent(video.title)}`;

    // Format uploaded date
    //   const formattedDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "";

    const uploadedAtFormatted = getRelativeTime(video.uploadedAt);

    return (
        <Card elevation={3} className="h-100">
            <CardActionArea>
                <div className="h-100 shadow-sm video-card" title={video.description || ""}>
                    <div className="ratio ratio-16x9">
                        <img
                            src={safeThumbnail}
                            alt={video.title}
                            className="card-img-top"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                    <div className="card-body p-2">
                        <h6 className="card-title text-truncate mb-1">{video.title}</h6>
                        <p className="card-text text-muted mb-0 d-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
                            <span className="text-truncate">{video.channel}</span>
                            {video.verified && (
                                <i className="bi bi-patch-check-fill text-primary" title="Verified channel"></i>
                            )}
                            • <span className="text-nowrap">{video.views} views</span>
                            {uploadedAtFormatted && <>• <span className="text-nowrap">{uploadedAtFormatted}</span></>}
                        </p>
                    </div>
                </div>
            </CardActionArea>
        </Card>
    );
}

export default VideoCard;
