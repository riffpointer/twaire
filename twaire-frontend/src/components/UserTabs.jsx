import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, MenuItem, Paper, Tab, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { getRelativeTime } from '../utils/DateUtils.js';
import VideoGrid from './VideoGrid.jsx';

function UserTabs({ user, videos }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [sort, setSort] = useState("relevance");

  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };

  const userCreationDate = new Date(user.createdAt);
  const localUserCreationDate = userCreationDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, mb: 2 }}>
      <TabContext value={selectedTabIndex.toString()}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 0 }}>
          <TabList onChange={handleTabChange} aria-label="channel info tabs">
            <Tab label="Videos" value="0" />
            <Tab label="About" value="1" />
          </TabList>
        </Box>

        <TabPanel value="0" sx={{ p: 0, m: 0, mt: 2 }}>
          {videos.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              This user has not uploaded any videos yet.
            </Typography>
          ) : (
            <>
              <TextField
                select
                size="small"
                label="Sort by..."
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                variant="outlined"
                sx={{ width: "auto", minWidth: 160, mb: 2, mt: 1 }}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="date">Upload date (Newest first)</MenuItem>
                <MenuItem value="views">Most viewed</MenuItem>
              </TextField>
              <VideoGrid videos={videos} />
            </>
          )}
        </TabPanel>

        <TabPanel value="1" sx={{ p: 1, mt: 1 }}>
          <Box mb={2}>
            <Typography variant="h6">About this channel</Typography>
            <Typography component="div" variant="body2">
              {user.bio || (
                <Box component="i" sx={{ color: 'text.secondary' }}>
                  No bio.
                </Box>
              )}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="h6">More links</Typography>
            <Typography component="div" variant="body2">
              {user.moreLinks || (
                <Box component="i" sx={{ color: 'text.secondary' }}>
                  No links.
                </Box>
              )}
            </Typography>
          </Box>
          <Box>
            <small>
              <Box component="i" sx={{ color: 'text.secondary' }}>
                Account created at {user.createdAt ? localUserCreationDate : "unknown date"} ({getRelativeTime(user.createdAt) || "unknown days ago"}).
              </Box>
            </small>
          </Box>
        </TabPanel>
      </TabContext>
    </Paper>
  );
}

export default UserTabs;
