import { getRelativeTime } from "../utils/DateUtils";
import ApiConfig from "../utils/ApiConfig.jsx";
import { Card, CardActionArea, Box, Typography, CardMedia, CardContent } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";


function VideoCard({ video }) {
  const safeThumbnail = video.thumbnail
    ? `${ApiConfig.serverUrl}/data/thumbnails/${video.thumbnail}`
    : `${ApiConfig.serverUrl}/api/helper/placeholder/320x180?text=${encodeURIComponent(video.title)}`;

  // Format uploaded date
  //   const formattedDate = uploadedAt ? new Date(uploadedAt).toLocaleDateString() : "";

  const uploadedAtFormatted = getRelativeTime(video.uploadedAt);

  return (
    <Card
      elevation={3}
      sx={{
        userSelect: "none",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%", // stretch to parent Grid item
        minWidth: 200,
      }}
    >
      <CardActionArea
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", height: "100%" }}
      >
        <Box sx={{ position: "relative", width: "100%", pt: "56.25%", flexGrow: 1 }}>
          <CardMedia
            component="img"
            image={safeThumbnail}
            alt={video.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        <CardContent sx={{ p: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ mb: 0.5, fontWeight: 500 }}
            title={video.description || ""}
          >
            {video.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{ fontSize: "inherit", color: "inherit" }}
            >
              {video.channel}
            </Typography>

            {video.uploader.verified && (
              <CheckCircleIcon sx={{ fontSize: 14, color: "primary.main" }} />
            )}

            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
              • {video.views} views
            </Box>

            {uploadedAtFormatted && (
              <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                • {uploadedAtFormatted}
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default VideoCard;
