import { getRelativeTime } from "../utils/DateUtils";
import ApiConfig from "../utils/ApiConfig.jsx";
import { Card, CardActionArea, Box, Typography } from "@mui/material";


function VideoCard({ video }) {
  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title)}`;

  // Format uploaded date
  //   const formattedDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "";

  const uploadedAtFormatted = getRelativeTime(video.uploadedAt);

  return (
    <Card elevation={3} className="h-100" sx={{ userSelect: "none" }}>
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.85rem',
                color: 'text.secondary',
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{ fontSize: 'inherit', color: 'inherit' }}
              >
                {video.channel}
              </Typography>

              {video.verified && (
                <i class="bi bi-check"></i>
              )}

              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>• {video.views} views</Box>

              {uploadedAtFormatted && (
                <Box component="span" sx={{ whiteSpace: 'nowrap' }}>• {uploadedAtFormatted}</Box>
              )}
            </Box>
          </div>
        </div>
      </CardActionArea>
    </Card>
  );
}

export default VideoCard;
