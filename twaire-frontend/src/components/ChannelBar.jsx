import { Link as MuiLink, Typography } from "@mui/material";
import { Avatar, Box, Card } from "@mui/material";
import React from "react";
import ApiConfig from "../utils/ApiConfig.js";
import SubscribeButton from "./SubscribeButton";
import VerifiedUserBadge from "./VerifiedUserBadge";
import { Link, useParams } from "react-router-dom";
import UserAvatar from "./UserAvatar.jsx";

function ChannelBar({ video, uploaderSubs, subscribed, subLoading, handleSubscribe }) {
  return <Card
    sx={{
      p: 1.5,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2,
    }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <UserAvatar user={video.uploader} size={48} sx={{ mr: 1 }} />

      <Box>
        <MuiLink
          component={Link}
          to={`/user/${video.uploader.username}`}
          underline="none"
          color="text.primary"
          sx={{ fontWeight: 'bold', display: "flex", alignItems: "center" }}
        >
          {video.uploader.publicName}
          <VerifiedUserBadge user={video.uploader} verticalAlign="text-center" />
        </MuiLink>

        <Typography variant="body2" color="text.secondary">
          {uploaderSubs} subscriber{uploaderSubs === 1 || "s"}
        </Typography>
      </Box>
    </Box>

    <Box>
      <SubscribeButton
        subscribed={subscribed}
        subLoading={subLoading}
        handleSubscribe={handleSubscribe} />
    </Box>
  </Card>;
}

export default ChannelBar;