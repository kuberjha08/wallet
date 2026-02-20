import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const SubHeader = ({ title, onSearch, onRefresh, loading }) => {
  const theme = useTheme();
  const { toggleTheme } = useThemeMode();

  return (
    <Paper
      elevation={0}
      sx={{
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        borderRadius: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Typography variant="h5" fontWeight="600">
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          onChange={onSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.action.hover, 0.3),
            },
          }}
        />

        <IconButton
          onClick={onRefresh}
          disabled={loading}
          sx={{
            animation: loading ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          <RefreshIcon />
        </IconButton>

        <IconButton onClick={toggleTheme}>
          {theme.palette.mode === 'light' ? '🌙' : '☀️'}
        </IconButton>

        <IconButton sx={{ position: 'relative' }}>
          <NotificationsIcon />
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'error.main',
              border: `2px solid ${theme.palette.background.paper}`,
            }}
          />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default SubHeader;