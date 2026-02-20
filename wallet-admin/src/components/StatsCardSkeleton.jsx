import React from 'react';
import { Paper, Skeleton, Box } from '@mui/material';

const StatsCardSkeleton = () => {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
      <Skeleton variant="text" width="60%" height={20} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
    </Paper>
  );
};

export default StatsCardSkeleton;