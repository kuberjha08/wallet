import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  SupportAgent as SupportIcon,
} from '@mui/icons-material';

const Sidebar = ({ navItems, activePage, onNavigate, onSupportClick }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRadius: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            borderRadius: 2,
            p: 1,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows[4],
          }}
        >
          <AccountBalanceWalletIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="700" lineHeight={1.2}>
            Wallet Admin
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Wallet Management
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: theme.spacing(0, 1.5) }}>
        {navItems?.map((item) => (
          <Button
            key={item?.label}
            fullWidth
            startIcon={item?.icon}
            onClick={() => onNavigate(item?.page)}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              px: 2,
              mb: 0.5,
              borderRadius: 2,
              color:
                activePage === item?.page
                  ? 'primary.main'
                  : 'text.secondary',
              bgcolor:
                activePage === item?.page
                  ? alpha(theme.palette.primary.main, 0.08)
                  : 'transparent',
              '&:hover': {
                bgcolor:
                  activePage === item?.page
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.action.hover, 0.5),
              },
              textTransform: 'none',
              fontWeight: activePage === item?.page ? 600 : 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Support Button */}
      <Box sx={{ p: 2.5, mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SupportIcon />}
          onClick={onSupportClick}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            py: 1.2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            boxShadow: theme.shadows[4],
          }}
        >
          Support
        </Button>
      </Box>
    </Paper>
  );
};

export default Sidebar;