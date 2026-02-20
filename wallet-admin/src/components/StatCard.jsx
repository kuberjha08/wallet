import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, change, trend, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, height: '100%' }}>
        <CardContent>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" height={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Zoom in={!loading} style={{ transitionDelay: '100ms' }}>
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          transition: 'all 0.3s',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                color: color || theme.palette.primary.main,
              }}
            >
              {icon}
            </Box>
            {change && (
              <Chip
                label={change}
                size="small"
                icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                sx={{
                  bgcolor:
                    trend === 'up'
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                  color:
                    trend === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="700">
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default StatCard;