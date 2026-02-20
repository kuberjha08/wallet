import React from 'react';
import { Grid, Button, useTheme, alpha } from '@mui/material';

const QuickActions = ({ actions }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
      {actions.map((action, index) => (
        <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{
              py: 1.8,
              textTransform: 'none',
              borderRadius: 3,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {action.label}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default QuickActions;