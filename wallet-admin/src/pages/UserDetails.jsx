import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Skeleton,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Fade,
  Zoom,
  Badge,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  AcUnit as AcUnitIcon,
  ArrowDownward as ArrowDownwardIcon,
  TrendingDown as TrendingDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ZoomIn as ZoomInIcon,
  Mail as MailIcon,
  Call as CallIcon,
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import api from "../utils/api.js";

// Styled Components
const StatusChip = ({ status, type = "status" }) => {
  const theme = useTheme();

  const statusConfig = {
    // Status types
    active: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      label: "Active",
    },
    inactive: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      label: "Inactive",
    },
    pending: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      label: "Pending",
    },
    suspended: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      label: "Suspended",
    },

    // KYC status
    verified: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      label: "Verified",
    },
    unverified: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      label: "Unverified",
    },
    rejected: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      label: "Rejected",
    },

    // Transaction status
    completed: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      label: "Completed",
    },
    failed: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      label: "Failed",
    },
    processing: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
      label: "Processing",
    },

    // Risk levels
    low: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      label: "LOW",
    },
    medium: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      label: "MEDIUM",
    },
    high: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      label: "HIGH",
    },
  };

  const normalizedStatus = status?.toLowerCase() || "active";
  const config = statusConfig[normalizedStatus] || {
    bg: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.text.secondary,
    label: status || "Unknown",
  };

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 24,
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
};

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  height: "100%",
  transition: "all 0.3s",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

const DocumentThumb = styled(Box)(({ theme }) => ({
  position: "relative",
  aspectRatio: "3/2",
  borderRadius: theme.spacing(1),
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.grey[500], 0.05),
  cursor: "pointer",
  transition: "all 0.3s",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  },
  "&:hover .overlay": { opacity: 1 },
  "&:hover img": { transform: "scale(1.05)" },
}));

const DocumentOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor: alpha(theme.palette.common.black, 0.4),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s",
}));

const WalletCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  color: "white",
  position: "relative",
  overflow: "hidden",
  boxShadow: theme.shadows[8],
}));

const WalletIconBg = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: -20,
  bottom: -20,
  opacity: 0.1,
  "& .MuiSvgIcon-root": { fontSize: 200 },
}));

const StatsBox = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backdropFilter: "blur(8px)",
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

// Loading Overlay Component
const LoadingOverlay = ({ open, message = "Processing..." }) => (
  <Backdrop
    sx={{
      color: "#fff",
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
    open={open}
  >
    <CircularProgress color="primary" size={60} thickness={4} />
    <Typography variant="h6" sx={{ fontWeight: 500, letterSpacing: 1 }}>
      {message}
    </Typography>
  </Backdrop>
);

const UserDetails = ({ user, setCurrentPage }) => {
  const theme = useTheme();

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    user: false,
    transactions: true,
  });

  // Global loading for wallet actions
  const [globalLoading, setGlobalLoading] = useState({
    open: false,
    message: "Processing...",
  });

  // Error states
  const [errors, setErrors] = useState({
    user: null,
    transactions: null,
  });

  // Data states - initialize with props data
  const [userData, setUserData] = useState(
    user || {
      id: "N/A",
      name: "Unknown User",
      email: "N/A",
      mobile: "N/A",
      status: "Inactive",
      riskLevel: "UNKNOWN",
      dob: "N/A",
      nationality: "N/A",
      address: "N/A",
      joinDate: "N/A",
      walletBalance: 0,
      frozenFunds: 0,
      isFrozen: 0,
      pendingCredits: 0,
      kycStatus: "UNVERIFIED",
      kycDocuments: [],
      profilePicture: null,
    },
  );

  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch user details only if needed
  const fetchUserDetails = useCallback(async () => {
    if (!user?.id) return;

    setLoadingStates((prev) => ({ ...prev, user: true }));
    setErrors((prev) => ({ ...prev, user: null }));

    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setErrors((prev) => ({
        ...prev,
        user: error.response?.data?.message || "Failed to load user details",
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, user: false }));
    }
  }, [user]);

  // Fetch user transactions
  const fetchUserTransactions = useCallback(async () => {
    if (!user?.id) {
      setLoadingStates((prev) => ({ ...prev, transactions: false }));
      return;
    }

    setLoadingStates((prev) => ({ ...prev, transactions: true }));
    setErrors((prev) => ({ ...prev, transactions: null }));

    try {
      const response = await api.get(
        `/admin/transactions?userId=${user.id}&page=0&size=5`,
      );
      setRecentActivities(response.data.content || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setErrors((prev) => ({
        ...prev,
        transactions:
          error.response?.data?.message || "Failed to load transactions",
      }));
      setRecentActivities([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, transactions: false }));
    }
  }, [user]);

  // Initial fetch - only fetch transactions, user details are optional
  useEffect(() => {
    fetchUserTransactions();
    if (user?.id) {
      fetchUserDetails().catch(() => {});
    }
  }, [fetchUserTransactions, fetchUserDetails, user]);

  // Handle refresh
  const handleRefresh = () => {
    fetchUserTransactions();
    if (user?.id) {
      fetchUserDetails();
    }
  };

  // Handle freeze wallet with loading overlay
  const handleFreezeWallet = async () => {
    if (!user?.id) return;

    setGlobalLoading({
      open: true,
      message: "Freezing wallet...",
    });

    try {
      await api.post(`/admin/users/${user.id}/freeze`, {
        reason: "Admin action",
      });
      await fetchUserDetails(); // Wait for refresh
    } catch (error) {
      console.error("Error freezing wallet:", error);
    } finally {
      setGlobalLoading({
        open: false,
        message: "Processing...",
      });
    }
  };

  const handleUnfreezeWallet = async () => {
    if (!user?.id) return;

    setGlobalLoading({
      open: true,
      message: "Unfreezing wallet...",
    });

    try {
      await api.post(`/admin/users/${user.id}/unfreeze`);
      await fetchUserDetails(); // Wait for refresh
    } catch (error) {
      console.error("Error unfreezing wallet:", error);
    } finally {
      setGlobalLoading({
        open: false,
        message: "Processing...",
      });
    }
  };

  // Get icon for activity type
  const getActivityIcon = (activity) => {
    const type = activity?.type?.toLowerCase() || "";

    if (type.includes("deposit")) return <ArrowDownwardIcon fontSize="small" />;
    if (type.includes("withdrawal"))
      return <TrendingDownIcon fontSize="small" />;
    if (type.includes("payment")) return <ReceiptIcon fontSize="small" />;
    if (type.includes("login")) return <HistoryIcon fontSize="small" />;
    return <ReceiptIcon fontSize="small" />;
  };

  // Get color for activity
  const getActivityColor = (activity) => {
    const type = activity?.type?.toLowerCase() || "";

    if (type.includes("deposit")) return "success";
    if (type.includes("withdrawal")) return "error";
    if (type.includes("payment")) return "info";
    return "primary";
  };

  // Format amount with sign
  const formatAmount = (activity) => {
    if (!activity?.amount) return null;

    const amount = Number(activity.amount);
    const type = activity?.type?.toLowerCase() || "";

    if (type.includes("deposit") || type.includes("credit")) {
      return { value: `+$${amount.toFixed(2)}`, color: "success.main" };
    }
    if (type.includes("withdrawal") || type.includes("debit")) {
      return { value: `-$${amount.toFixed(2)}`, color: "error.main" };
    }
    return { value: `$${amount.toFixed(2)}`, color: "text.primary" };
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // Format time safely
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Use display data (prioritize fetched data, fallback to props)
  const displayData = userData || user || {};

  return (
    <>
      {/* Global Loading Overlay */}
      <LoadingOverlay
        open={globalLoading.open}
        message={globalLoading.message}
      />

      <Fade in={true} timeout={500}>
        <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
          {/* Header with Back Button and Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() => setCurrentPage("userManagement")}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" fontWeight="700">
                  User Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage user information
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loadingStates.transactions || globalLoading.open}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <RefreshIcon
                    sx={{
                      animation: loadingStates.transactions
                        ? "spin 1s linear infinite"
                        : "none",
                    }}
                  />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                color={displayData?.isFrozen ? "success" : "error"}
                startIcon={<AcUnitIcon />}
                onClick={
                  displayData?.isFrozen
                    ? handleUnfreezeWallet
                    : handleFreezeWallet
                }
                disabled={globalLoading.open}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {displayData?.isFrozen
                  ? "Unfreeze Wallet"
                  : "Freeze Wallet"}
              </Button>
            </Box>
          </Box>

          {/* Info Alert - Shows that we're using cached data if API fails */}
          {errors.user && (
            <Alert
              severity="info"
              sx={{ mb: 3, borderRadius: 2 }}
              icon={<InfoIcon />}
              action={
                <Button color="inherit" size="small" onClick={fetchUserDetails}>
                  Retry
                </Button>
              }
            >
              <AlertTitle>Using Cached Data</AlertTitle>
              Unable to fetch latest user details. Showing previously loaded data.
            </Alert>
          )}

          {errors.transactions && (
            <Alert
              severity="warning"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={fetchUserTransactions}
                >
                  Retry
                </Button>
              }
            >
              <AlertTitle>Transactions Unavailable</AlertTitle>
              {errors.transactions}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column - User Info & KYC */}
            <Grid item xs={12} lg={5}>
              <Stack spacing={3}>
                {/* Profile Summary */}
                <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                  <ProfileCard>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        badgeContent={
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              bgcolor:
                                displayData.status?.toLowerCase() === "active"
                                  ? "success.main"
                                  : "error.main",
                              border: `2px solid ${theme.palette.background.paper}`,
                            }}
                          />
                        }
                      >
                        <Avatar
                          src={displayData.profilePicture}
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 3,
                            border: `4px solid ${theme.palette.background.default}`,
                            boxShadow: theme.shadows[4],
                          }}
                        >
                          {displayData.name?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                      </Badge>

                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="h5" fontWeight="700">
                            {displayData.name || "Unknown User"}
                          </Typography>
                          <StatusChip status={displayData.status} />
                        </Box>

                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              color: "text.secondary",
                            }}
                          >
                            <MailIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              {displayData.email || "N/A"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              color: "text.secondary",
                            }}
                          >
                            <CallIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              {displayData.mobile || "N/A"}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ mt: 2 }}>
                          <StatusChip status={displayData.riskLevel} />
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="700"
                        >
                          Date of Birth
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {displayData.dob || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="700"
                        >
                          Nationality
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {displayData.nationality || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="700"
                        >
                          Address
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {displayData.address || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="700"
                        >
                          User ID
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="500"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {displayData.id || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="700"
                        >
                          Joined Date
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {displayData.joinDate ||
                            formatDate(displayData.createdAt) ||
                            "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ProfileCard>
                </Zoom>

                {/* KYC Documents */}
                <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                  <ProfileCard>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight="700">
                        KYC Documents
                      </Typography>
                      <StatusChip status={displayData.kycStatus} />
                    </Box>

                    {!displayData.kycDocuments ||
                    displayData.kycDocuments.length === 0 ? (
                      <Box
                        sx={{
                          py: 4,
                          textAlign: "center",
                          bgcolor: alpha(theme.palette.grey[500], 0.05),
                          borderRadius: 2,
                        }}
                      >
                        <ReceiptIcon
                          sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                        />
                        <Typography color="text.secondary">
                          No KYC documents available
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {displayData.kycDocuments.map((doc, index) => (
                          <Grid item xs={6} key={index}>
                            <DocumentThumb
                              onClick={() => setSelectedImage(doc.url)}
                            >
                              <Box
                                component="img"
                                src={doc.url}
                                alt={doc.type}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.3s",
                                }}
                              />
                              <DocumentOverlay className="overlay">
                                <Tooltip title={`View ${doc.type}`}>
                                  <ZoomInIcon sx={{ color: "white" }} />
                                </Tooltip>
                              </DocumentOverlay>
                            </DocumentThumb>
                            <Typography
                              variant="caption"
                              sx={{ mt: 0.5, display: "block", fontWeight: 500 }}
                            >
                              {doc.type}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Approve KYC
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        Reject / Flag
                      </Button>
                    </Box>
                  </ProfileCard>
                </Zoom>
              </Stack>
            </Grid>

            {/* Right Column - Wallet & Activity */}
            <Grid item xs={12} lg={7}>
              <Stack spacing={3}>
                {/* Wallet Card */}
                <Zoom in={true} style={{ transitionDelay: "150ms" }}>
                  <WalletCard elevation={0}>
                    <WalletIconBg>
                      <WalletIcon />
                    </WalletIconBg>

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: alpha(theme.palette.common.white, 0.7),
                              textTransform: "uppercase",
                              letterSpacing: 1,
                            }}
                          >
                            Total Available Balance
                          </Typography>
                          <Typography
                            variant="h2"
                            fontWeight="900"
                            sx={{ mt: 0.5 }}
                          >
                            ${Math.floor(displayData.walletBalance || 0)}.
                            <Typography
                              component="span"
                              variant="h4"
                              fontWeight="700"
                              sx={{
                                color: alpha(theme.palette.common.white, 0.6),
                              }}
                            >
                              {((displayData.walletBalance || 0) % 1)
                                .toFixed(2)
                                .slice(2)}
                            </Typography>
                          </Typography>
                        </Box>

                        <StatsBox>
                          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: alpha(theme.palette.common.white, 0.7),
                                }}
                              >
                                Frozen Funds
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                sx={{ color: theme.palette.error.light }}
                              >
                                ${(displayData.frozenFunds || 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: alpha(theme.palette.common.white, 0.7),
                                }}
                              >
                                Pending Credits
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                sx={{ color: theme.palette.success.light }}
                              >
                                +${(displayData.pendingCredits || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        </StatsBox>
                      </Box>

                      <Box
                        sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: "white",
                            color: "primary.main",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.common.white, 0.9),
                            },
                          }}
                        >
                          Add Credit
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: alpha(theme.palette.common.white, 0.2),
                            color: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.common.white, 0.3),
                            },
                          }}
                        >
                          Manual Debit
                        </Button>
                      </Box>
                    </Box>
                  </WalletCard>
                </Zoom>

                {/* Recent Activity */}
                <Zoom in={true} style={{ transitionDelay: "250ms" }}>
                  <ProfileCard sx={{ p: 0, overflow: "hidden" }}>
                    <Box
                      sx={{
                        p: 3,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }}
                    >
                      <Typography variant="h6" fontWeight="700">
                        Recent Activity
                      </Typography>
                      <Button
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 600 }}
                      >
                        View All History
                      </Button>
                    </Box>

                    {loadingStates.transactions ? (
                      <Box sx={{ p: 3 }}>
                        <Stack spacing={2}>
                          {[1, 2, 3, 4].map((i) => (
                            <Skeleton
                              key={i}
                              variant="rectangular"
                              height={60}
                              sx={{ borderRadius: 1 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ) : recentActivities.length === 0 ? (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          bgcolor: alpha(theme.palette.grey[500], 0.02),
                        }}
                      >
                        <HistoryIcon
                          sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                        />
                        <Typography color="text.secondary">
                          No recent activity found
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow
                              sx={{
                                bgcolor: alpha(theme.palette.grey[500], 0.03),
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  color: "text.secondary",
                                }}
                              >
                                Transaction
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  color: "text.secondary",
                                }}
                              >
                                Date & Time
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  color: "text.secondary",
                                }}
                              >
                                Amount
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  color: "text.secondary",
                                }}
                              >
                                Status
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentActivities.map((activity, index) => {
                              const amountFormat = formatAmount(activity);
                              const activityColor = getActivityColor(activity);

                              return (
                                <TableRow key={activity.id || index} hover>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 36,
                                          height: 36,
                                          bgcolor: alpha(
                                            theme.palette[activityColor].main,
                                            0.1,
                                          ),
                                          color:
                                            theme.palette[activityColor].main,
                                        }}
                                      >
                                        {getActivityIcon(activity)}
                                      </Avatar>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight="600"
                                        >
                                          {activity.type || "Transaction"}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {activity.description ||
                                            activity.reference ||
                                            activity.id}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="500">
                                      {formatDate(
                                        activity.date || activity.createdAt,
                                      )}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formatTime(
                                        activity.date || activity.createdAt,
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {amountFormat ? (
                                      <Typography
                                        variant="body2"
                                        fontWeight="700"
                                        sx={{ color: amountFormat.color }}
                                      >
                                        {amountFormat.value}
                                      </Typography>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        N/A
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <StatusChip status={activity.status} />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {/* Pagination */}
                    {recentActivities.length > 0 && (
                      <Box
                        sx={{
                          p: 2,
                          borderTop: `1px solid ${theme.palette.divider}`,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                            }}
                          >
                            <ChevronLeftIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant="contained"
                            sx={{
                              minWidth: 36,
                              height: 36,
                              fontWeight: 600,
                            }}
                          >
                            1
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 36,
                              height: 36,
                              fontWeight: 600,
                            }}
                          >
                            2
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              minWidth: 36,
                              height: 36,
                              fontWeight: 600,
                            }}
                          >
                            3
                          </Button>
                          <IconButton
                            size="small"
                            sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                            }}
                          >
                            <ChevronRightIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </ProfileCard>
                </Zoom>
              </Stack>
            </Grid>
          </Grid>

          {/* Image Preview Modal */}
          {selectedImage && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.8)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
              onClick={() => setSelectedImage(null)}
            >
              <Box
                sx={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}
              >
                <IconButton
                  sx={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                  onClick={() => setSelectedImage(null)}
                >
                  <CloseIcon />
                </IconButton>
                <img
                  src={selectedImage}
                  alt="Document preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "90vh",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </>
  );
};

// Add animation keyframes
const style = document.createElement("style");
style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default UserDetails;