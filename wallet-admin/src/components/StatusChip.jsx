import React from 'react';
import { Chip, useTheme, alpha } from '@mui/material';

const StatusChip = ({ status }) => {
  const theme = useTheme();
  
  const statusConfig = {
    completed: { color: theme.palette.success.main, label: 'Completed' },
    success: { color: theme.palette.success.main, label: 'Success' },
    pending: { color: theme.palette.warning.main, label: 'Pending' },
    failed: { color: theme.palette.error.main, label: 'Failed' },
    rejected: { color: theme.palette.error.main, label: 'Rejected' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.completed;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: alpha(config.color, 0.1),
        color: config.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
      }}
    />
  );
};

export default StatusChip;