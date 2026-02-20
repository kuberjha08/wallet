import React from 'react';
import {
  Card,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import StatusChip from './StatusChip';

const TransactionsTable = ({ transactions, loading, onViewAll, onRowClick }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Skeleton variant="text" width={200} height={32} />
        </Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Box
            key={i}
            sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Skeleton variant="text" width="100%" height={24} />
          </Box>
        ))}
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Recent Transactions
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          size="small"
          onClick={onViewAll}
          sx={{
            textTransform: 'none',
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          View all
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
              <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No transactions found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRowClick?.(tx)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {tx?.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            fontSize: '0.8rem',
                          }}
                        >
                          {tx?.initials}
                        </Avatar>
                        <Typography variant="body2">{tx?.user}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        ${tx?.amount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={tx?.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tx?.time}
                      </Typography>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TransactionsTable;