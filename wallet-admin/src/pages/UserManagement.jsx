import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Grid,
  useTheme,
  alpha,
  Pagination,
  PaginationItem,
  Fade,
  Zoom,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import api from "../utils/api.js";
import TableSkeleton from "../components/TableSkeleton";
import StatsCardSkeleton from "../components/StatsCardSkeleton";

// Styled Components
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease-in-out",
  height: "100%",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-4px)",
    borderColor: theme.palette.primary.main,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    fontWeight: 700,
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  "&.MuiTableCell-body": {
    fontSize: "0.9rem",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    cursor: "pointer",
  },
}));

const StatusChip = ({ status }) => {
  const theme = useTheme();
  const colors = {
    approved: {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.main,
      label: "Approved",
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
    },
    pending: {
      bg: alpha(theme.palette.warning.main, 0.12),
      color: theme.palette.warning.main,
      label: "Pending",
      icon: <WarningIcon sx={{ fontSize: 16 }} />,
    },
    rejected: {
      bg: alpha(theme.palette.error.main, 0.12),
      color: theme.palette.error.main,
      label: "Rejected",
      icon: <BlockIcon sx={{ fontSize: 16 }} />,
    },
    active: {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.main,
      label: "Active",
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
    },
    inactive: {
      bg: alpha(theme.palette.error.main, 0.12),
      color: theme.palette.error.main,
      label: "Inactive",
      icon: <BlockIcon sx={{ fontSize: 16 }} />,
    },
    verified: {
      bg: alpha(theme.palette.success.main, 0.12),
      color: theme.palette.success.main,
      label: "Verified",
      icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
    },
  };

  const config = colors[status?.toLowerCase()] || {
    bg: alpha(theme.palette.grey[500], 0.12),
    color: theme.palette.text.secondary,
    label: status || "Unknown",
    icon: null,
  };

  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 28,
        "& .MuiChip-label": { px: 1.5 },
        "& .MuiChip-icon": { color: "inherit", ml: 0.5 },
      }}
    />
  );
};

const UserManagement = ({ setCurrentPage, setSelectedUser }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    users: true,
    stats: true,
  });

  // Data states
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    activeWallets: 0,
    totalBalance: 0,
  });

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, users: true }));
    try {
      const response = await api.get(
        `/admin/users?page=${page}&size=${rowsPerPage}&search=${debouncedSearchTerm}`,
      );
      setUsers(response.data.content || []);
      setTotalUsers(response.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, users: false }));
    }
  }, [page, debouncedSearchTerm, rowsPerPage]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, stats: true }));
    try {
      const response = await api.get("/admin/users/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Handle refresh
  const handleRefresh = async () => {
    setLoadingStates({ users: true, stats: true });
    await Promise.all([fetchUsers(), fetchStats()]);
  };

  // Handle menu open
  const handleMenuOpen = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  // Stats cards data
  const statsCards = [
    {
      label: "Total Users",
      value: stats.totalUsers?.toLocaleString() || 0,
      change: "+5.2%",
      trend: "up",
      icon: (
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
          }}
        >
          👥
        </Avatar>
      ),
    },
    {
      label: "Pending KYC",
      value: stats.pendingKYC || 0,
      change: "+12%",
      trend: "up",
      icon: (
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: "warning.main",
          }}
        >
          📋
        </Avatar>
      ),
    },
    {
      label: "Active Wallets",
      value: stats.activeWallets?.toLocaleString() || 0,
      change: "Stable",
      trend: "neutral",
      icon: (
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: "info.main",
          }}
        >
          💰
        </Avatar>
      ),
    },
    {
      label: "Total Balance",
      value: `$${((stats.totalBalance || 0) / 1000000).toFixed(1)}M`,
      change: "-2.1%",
      trend: "down",
      icon: (
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: "success.main",
          }}
        >
          💎
        </Avatar>
      ),
    },
  ];

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all users in the system
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              disabled={loadingStates.users || loadingStates.stats}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <RefreshIcon
                sx={{
                  animation:
                    loadingStates.users || loadingStates.stats
                      ? "spin 1s linear infinite"
                      : "none",
                }}
              />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
            }}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loadingStates.stats
          ? [...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatsCardSkeleton />
              </Grid>
            ))
          : statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom
                  in={!loadingStates.stats}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <StatCard>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                          gutterBottom
                        >
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight="700">
                          {stat.value}
                        </Typography>
                      </Box>
                      <Badge
                        color={
                          stat.trend === "up"
                            ? "success"
                            : stat.trend === "down"
                              ? "error"
                              : "default"
                        }
                        variant="dot"
                        overlap="circular"
                      >
                        {stat.icon}
                      </Badge>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {stat.trend !== "neutral" ? (
                        <Chip
                          label={stat.change}
                          size="small"
                          sx={{
                            bgcolor:
                              stat.trend === "up"
                                ? alpha(theme.palette.success.main, 0.1)
                                : alpha(theme.palette.error.main, 0.1),
                            color:
                              stat.trend === "up"
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          {stat.change}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        vs last month
                      </Typography>
                    </Box>
                  </StatCard>
                </Zoom>
              </Grid>
            ))}
      </Grid>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search by name, email, or mobile..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 },
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: alpha(theme.palette.primary.main, 0.3),
            }}
          >
            Filters
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 3,
              borderColor: alpha(theme.palette.primary.main, 0.3),
            }}
          >
            Export
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
          boxShadow: theme.shadows[4],
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>User</StyledTableCell>
                <StyledTableCell>Contact</StyledTableCell>
                <StyledTableCell>KYC Status</StyledTableCell>
                <StyledTableCell>Wallet Balance</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingStates.users ? (
                <TableSkeleton rows={rowsPerPage} columns={5} />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <SearchIcon
                          sx={{ fontSize: 40, color: "primary.main" }}
                        />
                      </Avatar>
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <Fade
                    key={user.id}
                    in={!loadingStates.users}
                    timeout={500}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <StyledTableRow>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            badgeContent={
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  bgcolor: user.isActive
                                    ? "success.main"
                                    : "error.main",
                                  border: `2px solid ${theme.palette.background.paper}`,
                                }}
                              />
                            }
                          >
                            <Avatar
                              src={user.profilePicture}
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                                fontWeight: 600,
                              }}
                            >
                              {user.name?.charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {user.name}
                            </Typography>
                            {/* <Typography variant="caption" color="text.secondary">
                                                            ID: {user?.id?.slice(0, 8)}...
                                                        </Typography> */}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {user.mobile}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip status={user.kycStatus} />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="700"
                          color="success.main"
                        >
                          ${(user.walletBalance || 0).toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <WalletIcon sx={{ fontSize: 14 }} />
                          Primary Wallet
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setCurrentPage("userDetails");
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.2,
                                  ),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, user.id)}
                              sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.grey[500], 0.2),
                                },
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loadingStates.users && users.length > 0 && (
          <Box
            sx={{
              p: 2.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{page * rowsPerPage + 1}</strong> to{" "}
              <strong>{Math.min((page + 1) * rowsPerPage, totalUsers)}</strong>{" "}
              of <strong>{totalUsers}</strong> users
            </Typography>

            <Pagination
              count={Math.ceil(totalUsers / rowsPerPage)}
              page={page + 1}
              onChange={(e, p) => setPage(p - 1)}
              shape="rounded"
              color="primary"
              size="medium"
              renderItem={(item) => (
                <PaginationItem
                  slots={{ previous: ChevronLeftIcon, next: ChevronRightIcon }}
                  {...item}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                    },
                  }}
                />
              )}
            />
          </Box>
        )}
      </Paper>

      {/* Keyboard Shortcut Hint */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4],
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Chip
            label="/"
            size="small"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />{" "}
          Focus search
          <Box sx={{ width: 1, height: 12, bgcolor: "divider", mx: 1 }} />
          <Chip
            label="↑↓"
            size="small"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />{" "}
          Navigate
          <Box sx={{ width: 1, height: 12, bgcolor: "divider", mx: 1 }} />
          <Chip
            label="Enter"
            size="small"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />{" "}
          View profile
        </Typography>
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <VisibilityIcon
            sx={{ mr: 1.5, fontSize: 20, color: "primary.main" }}
          />
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <BlockIcon sx={{ mr: 1.5, fontSize: 20, color: "error.main" }} />
          Block User
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5 }}>
          <CheckCircleIcon
            sx={{ mr: 1.5, fontSize: 20, color: "success.main" }}
          />
          Approve KYC
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Add animation keyframes
const style = document.createElement("style");
style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);

export default UserManagement;
