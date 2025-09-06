import { getRelativeTime } from "../utils/DateUtils";
import ApiConfig from "../utils/ApiConfig.jsx";


function VideoCard({ title, channel, views, thumbnail, description, verified, uploadedAt }) {
    const safeThumbnail = thumbnail
        ? `${ApiConfig.serverUrl}/thumbnails/${thumbnail}`
        : `https://placehold.co/320x180?text=${encodeURIComponent(title)}`;

    // Format uploaded date
    //   const formattedDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "";

    const uploadedAtFormatted = getRelativeTime(uploadedAt);

    return (
        <div className="card h-100 shadow-sm video-card" title={description || ""}>
            <div className="ratio ratio-16x9">
                <img
                    src={safeThumbnail}
                    alt={title}
                    className="card-img-top"
                    style={{ objectFit: "cover" }}
                />
            </div>
            <div className="card-body p-2">
                <h6 className="card-title text-truncate mb-1">{title}</h6>
                <p className="card-text text-muted mb-0 d-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
                    <span className="text-truncate">{channel}</span>
                    {verified && (
                        <i className="bi bi-patch-check-fill text-primary" title="Verified channel"></i>
                    )}
                    • <span className="text-nowrap">{views} views</span>
                    {uploadedAtFormatted && <>• <span className="text-nowrap">{uploadedAtFormatted}</span></>}
                </p>
            </div>
        </div>
    );
}

export default VideoCard;
