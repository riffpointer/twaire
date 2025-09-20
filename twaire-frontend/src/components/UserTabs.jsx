import { useState } from 'react';

import { Paper, Box, Grid, Typography, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

import { Link } from 'react-router-dom';

import VideoCard from './VideoCard';

function UserTabs({ user, videos }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTabIndex(newValue);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <TabContext value={selectedTabIndex.toString()}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 0 }}>
          <TabList onChange={handleTabChange} aria-label="channel info tabs">
            <Tab label="Videos" value="0" />
            <Tab label="About" value="1" />
          </TabList>
        </Box>

        {/* Videos Tab Panel */}
        <TabPanel value="0" sx={{ p: 0, m: 0, mt: 2 }}>
          {videos.length === 0 ? (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              This user has not uploaded any videos yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {videos.map((video) => (
                <Grid item key={video._id} width={300}>
                  <Link
                    to={`/watch/${video._id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <VideoCard video={video} />
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* About Tab Panel */}
        <TabPanel value="1" sx={{ p: 1, mt: 1 }}>
          <Box mb={2}>
            <Typography variant="h6">
              About this channel
            </Typography>
            <Typography component="div" variant="body2">
              {user.bio || (
                <Box component="i" sx={{ color: 'text.secondary' }}>
                  No bio.
                </Box>
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">
              More links
            </Typography>
            <Typography component="div" variant="body2">
              {user.moreLinks || (
                <Box component="i" sx={{ color: 'text.secondary' }}>
                  No links.
                </Box>
              )}
            </Typography>
          </Box>
        </TabPanel>
      </TabContext>
    </Paper>
  );
};

export default UserTabs;