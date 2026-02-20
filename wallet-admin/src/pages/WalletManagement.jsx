import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Stack,
  Alert,
  AlertTitle,
  Skeleton,
  Tooltip,
  Fade,
  Zoom,
  Backdrop,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import api from "../utils/api.js";
import { toast } from "react-toastify";

// Styled Components
const WalletCard = styled(Card)(({ theme, frozen }) => ({
  background: frozen
    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
  borderRadius: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: "50%",
    background: frozen
      ? alpha(theme.palette.error.main, 0.05)
      : alpha(theme.palette.primary.main, 0.05),
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    cursor: "pointer",
  },
  transition: "background-color 0.2s",
}));

const StatusChip = styled(Chip)(({ theme, status, frozen }) => {
  if (frozen) {
    return {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      fontWeight: 600,
      fontSize: "0.75rem",
      height: 24,
      "& .MuiChip-label": { px: 1.5 },
    };
  }
  
  const colors = {
    active: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    inactive: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
  };
  
  const colorConfig = colors[status?.toLowerCase()] || colors.active;
  
  return {
    backgroundColor: colorConfig.bg,
    color: colorConfig.color,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 24,
    "& .MuiChip-label": { px: 1.5 },
  };
});

const TransactionChip = styled(Chip)(({ theme, type }) => ({
  backgroundColor:
    type === "CREDIT"
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.error.main, 0.1),
  color: type === "CREDIT" ? theme.palette.success.main : theme.palette.error.main,
  fontWeight: 600,
  fontSize: "0.75rem",
  height: 24,
  "& .MuiChip-label": { px: 1.5 },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  textTransform: "none",
  fontWeight: 600,
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
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

// Transaction Details Dialog
const TransactionDetailDialog = ({ open, onClose, transaction }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(null);

  if (!transaction) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.95,
          )} 0%, ${theme.palette.background.paper} 100%)`,
          backdropFilter: "blur(10px)",
          boxShadow: theme.shadows[20],
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(
                  transaction.type === "CREDIT"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  0.1,
                ),
                color:
                  transaction.type === "CREDIT"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                width: 48,
                height: 48,
              }}
            >
              {transaction.type === "CREDIT" ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Transaction Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {transaction.id}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.grey[500], 0.2) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* User Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              User Information
            </Typography>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {transaction.userName || transaction.user || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Transaction Details */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Transaction Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    position: "relative",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight="700"
                    color={
                      transaction.type === "CREDIT"
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {transaction.type === "CREDIT" ? "+" : "-"}$
                    {(transaction.amount || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Type
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {transaction.type === "CREDIT" ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : (
                      <TrendingDownIcon color="error" fontSize="small" />
                    )}
                    <Typography variant="body1" fontWeight="600">
                      {transaction.type}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Balance After
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    ${(transaction.balanceAfter || 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Additional Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Additional Information
            </Typography>
            <Stack spacing={2}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  position: "relative",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Reference
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {transaction.reference || "N/A"}
                </Typography>
                {transaction.reference && (
                  <IconButton
                    size="small"
                    sx={{ position: "absolute", right: 8, top: 8 }}
                    onClick={() =>
                      handleCopy(transaction.reference, "Reference")
                    }
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {formatDate(transaction.date || transaction.createdAt)}
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// User Wallet Details Dialog
const UserWalletDetailDialog = ({ open, onClose, user, onAdjust }) => {
  const theme = useTheme();
  const [adjustType, setAdjustType] = useState("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleAdjust = async () => {
    setLoading(true);
    try {
      await onAdjust(user.id, adjustType, parseFloat(adjustAmount), adjustReason);
      toast.success(`Wallet ${adjustType}ed successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${adjustType} wallet`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <WalletIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {user.name}'s Wallet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {user.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Current Balance */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Balance
            </Typography>
            <Typography variant="h3" fontWeight="700" color="primary.main">
              ${(user.balance || 0).toFixed(2)}
            </Typography>
            <Chip
              label={user.frozen ? "Frozen" : "Active"}
              color={user.frozen ? "error" : "success"}
              size="small"
              sx={{ mt: 1 }}
            />
          </Paper>

          {/* Adjust Wallet */}
          <Box>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Adjust Wallet
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant={adjustType === "credit" ? "contained" : "outlined"}
                  color="success"
                  onClick={() => setAdjustType("credit")}
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Credit
                </Button>
                <Button
                  variant={adjustType === "debit" ? "contained" : "outlined"}
                  color="error"
                  onClick={() => setAdjustType("debit")}
                  startIcon={<RemoveIcon />}
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Debit
                </Button>
              </Box>

              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Reason"
                fullWidth
                multiline
                rows={2}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Enter reason for adjustment..."
              />

              <Alert
                severity={adjustType === "credit" ? "info" : "warning"}
                icon={
                  adjustType === "credit" ? (
                    <TrendingUpIcon />
                  ) : (
                    <TrendingDownIcon />
                  )
                }
              >
                {adjustType === "credit"
                  ? "This will add funds to the user's wallet."
                  : "This will deduct funds from the user's wallet."}
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdjust}
          variant="contained"
          color={adjustType === "credit" ? "success" : "error"}
          disabled={!adjustAmount || parseFloat(adjustAmount) <= 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {loading ? "Processing..." : `${adjustType === "credit" ? "Credit" : "Debit"} Wallet`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const WalletManagement = () => {
  const theme = useTheme();
  
  // State Management
  const [walletFrozen, setWalletFrozen] = useState(false);
  const [openAdjustDialog, setOpenAdjustDialog] = useState(false);
  const [openUserDetailDialog, setOpenUserDetailDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [adjustType, setAdjustType] = useState("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Loading States
  const [loading, setLoading] = useState({
    overview: true,
    users: true,
    transactions: true,
    action: false,
  });
  
  // Error States
  const [errors, setErrors] = useState({
    overview: null,
    users: null,
    transactions: null,
  });

  // Data States
  const [walletData, setWalletData] = useState({
    totalBalance: 0,
    totalUsers: 0,
    activeWallets: 0,
    frozenWallets: 0,
    todayVolume: 0,
    yesterdayVolume: 0,
    recentTransactions: [],
    users: [],
  });

  // Fetch Data
  const fetchWalletOverview = async () => {
    setLoading((prev) => ({ ...prev, overview: true }));
    setErrors((prev) => ({ ...prev, overview: null }));
    
    try {
      const response = await api.get("/admin/wallet-management/overview");
      setWalletData((prev) => ({
        ...prev,
        totalBalance: response.data.totalBalance || 0,
        totalUsers: response.data.totalUsers || 0,
        activeWallets: response.data.activeWallets || 0,
        frozenWallets: response.data.frozenWallets || 0,
        todayVolume: response.data.todayVolume || 0,
        yesterdayVolume: response.data.yesterdayVolume || 0,
      }));
    } catch (error) {
      console.error("Error fetching wallet overview:", error);
      setErrors((prev) => ({ ...prev, overview: "Failed to load wallet overview" }));
      toast.error("Failed to load wallet overview");
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  const fetchUserWallets = async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    setErrors((prev) => ({ ...prev, users: null }));
    
    try {
      const response = await api.get(
        `/admin/wallet-management/users?search=${searchTerm}`,
      );
      setWalletData((prev) => ({
        ...prev,
        users: response.data || [],
      }));
    } catch (error) {
      console.error("Error fetching user wallets:", error);
      setErrors((prev) => ({ ...prev, users: "Failed to load user wallets" }));
      toast.error("Failed to load user wallets");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchRecentTransactions = async () => {
    setLoading((prev) => ({ ...prev, transactions: true }));
    setErrors((prev) => ({ ...prev, transactions: null }));
    
    try {
      const response = await api.get(
        "/admin/wallet-management/recent-transactions?limit=5",
      );
      setWalletData((prev) => ({
        ...prev,
        recentTransactions: response.data || [],
      }));
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      setErrors((prev) => ({ ...prev, transactions: "Failed to load recent transactions" }));
      toast.error("Failed to load recent transactions");
    } finally {
      setLoading((prev) => ({ ...prev, transactions: false }));
    }
  };

  useEffect(() => {
    fetchWalletOverview();
    fetchUserWallets();
    fetchRecentTransactions();
  }, [searchTerm]);

  // Handle Refresh
  const handleRefresh = () => {
    fetchWalletOverview();
    fetchUserWallets();
    fetchRecentTransactions();
    toast.info("Data refreshed");
  };

  // Handle Adjust Wallet
  const handleAdjustWallet = async () => {
    setLoading((prev) => ({ ...prev, action: true }));
    
    try {
      await api.post("/admin/wallet-management/adjust", {
        userId: selectedUserId,
        amount: parseFloat(adjustAmount),
        type: adjustType.toUpperCase(),
        reason: adjustReason,
      });

      toast.success(`Wallet ${adjustType}ed successfully`);
      
      // Refresh data
      await Promise.all([
        fetchWalletOverview(),
        fetchUserWallets(),
        fetchRecentTransactions(),
      ]);
      
      setOpenAdjustDialog(false);
      setAdjustAmount("");
      setAdjustReason("");
    } catch (error) {
      console.error("Error adjusting wallet:", error);
      toast.error(`Failed to ${adjustType} wallet`);
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Handle User Wallet Adjust from Detail Dialog
  const handleUserWalletAdjust = async (userId, type, amount, reason) => {
    setLoading((prev) => ({ ...prev, action: true }));
    
    try {
      await api.post("/admin/wallet-management/adjust", {
        userId,
        amount,
        type: type.toUpperCase(),
        reason,
      });

      // Refresh data
      await Promise.all([
        fetchWalletOverview(),
        fetchUserWallets(),
        fetchRecentTransactions(),
      ]);
      
      return true;
    } catch (error) {
      console.error("Error adjusting wallet:", error);
      throw error;
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Handle Bulk Freeze
  const handleBulkFreeze = async () => {
    const selectedIds = walletData.users
      .filter((u) => u.selected)
      .map((u) => u.id);
      
    if (selectedIds.length === 0) {
      toast.warning("No users selected");
      return;
    }

    setLoading((prev) => ({ ...prev, action: true }));
    
    try {
      await api.post("/admin/wallet-management/bulk-freeze", selectedIds);
      toast.success(`${selectedIds.length} wallets frozen`);
      fetchUserWallets();
    } catch (error) {
      console.error("Error bulk freezing:", error);
      toast.error("Failed to freeze wallets");
    } finally {
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Handle Menu
  const handleMenuClick = (event, user) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Handle Row Click
  const handleUserRowClick = (user) => {
    setSelectedUser(user);
    setOpenUserDetailDialog(true);
  };

  const handleTransactionRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenTransactionDialog(true);
  };

  // Filter Users
  const filteredUsers = walletData.users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate Growth
  const calculateGrowth = () => {
    if (walletData.yesterdayVolume === 0) return "No data";
    const growth = ((walletData.todayVolume / walletData.yesterdayVolume) * 100 - 100).toFixed(1);
    return `${growth > 0 ? "+" : ""}${growth}% today`;
  };

  return (
    <>
      {/* Loading Overlay */}
      <LoadingOverlay open={loading.action} message="Processing..." />

      {/* Transaction Details Dialog */}
      <TransactionDetailDialog
        open={openTransactionDialog}
        onClose={() => setOpenTransactionDialog(false)}
        transaction={selectedTransaction}
      />

      {/* User Wallet Detail Dialog */}
      <UserWalletDetailDialog
        open={openUserDetailDialog}
        onClose={() => setOpenUserDetailDialog(false)}
        user={selectedUser}
        onAdjust={handleUserWalletAdjust}
      />

      <Box sx={{ p: 3 }}>
        {/* Header with Refresh */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Wallet Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage user wallets
            </Typography>
          </Box>
          
          <Tooltip title="Refresh Data">
            <IconButton
              onClick={handleRefresh}
              disabled={loading.overview || loading.users || loading.transactions}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <RefreshIcon
                sx={{
                  animation:
                    loading.overview || loading.users || loading.transactions
                      ? "spin 1s linear infinite"
                      : "none",
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Error Alerts */}
        {errors.overview && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors((p) => ({ ...p, overview: null }))}>
            <AlertTitle>Overview Error</AlertTitle>
            {errors.overview}
          </Alert>
        )}

        {/* Wallet Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
              <WalletCard frozen={walletFrozen}>
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <WalletIcon
                      sx={{
                        fontSize: 48,
                        color: walletFrozen ? "error.main" : "primary.main",
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={walletFrozen}
                          onChange={(e) => setWalletFrozen(e.target.checked)}
                          color={walletFrozen ? "error" : "primary"}
                        />
                      }
                      label={walletFrozen ? "System Frozen" : "System Active"}
                      labelPlacement="start"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total System Balance
                  </Typography>
                  {loading.overview ? (
                    <Skeleton variant="text" width={200} height={60} />
                  ) : (
                    <Typography variant="h3" fontWeight="700" gutterBottom>
                      $
                      {walletData.totalBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <TrendingUpIcon color="success" fontSize="small" />
                      <Typography variant="caption" color="success.main">
                        {calculateGrowth()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </WalletCard>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                  <StatCard>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Users
                    </Typography>
                    {loading.overview ? (
                      <Skeleton variant="text" width={100} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight="700">
                        {walletData.totalUsers.toLocaleString()}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Chip
                        label={`${walletData.activeWallets} Active`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: "success.main",
                        }}
                      />
                      <Chip
                        label={`${walletData.frozenWallets} Frozen`}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: "error.main",
                        }}
                      />
                    </Stack>
                  </StatCard>
                </Zoom>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Zoom in={true} style={{ transitionDelay: "300ms" }}>
                  <StatCard>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Today's Volume
                    </Typography>
                    {loading.overview ? (
                      <Skeleton variant="text" width={150} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight="700" color="primary.main">
                        $
                        {walletData.todayVolume.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    )}
                    <Chip
                      icon={<TrendingUpIcon />}
                      label={calculateGrowth()}
                      size="small"
                      color="success"
                      sx={{ mt: 2 }}
                    />
                  </StatCard>
                </Zoom>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setAdjustType("credit");
                  setOpenAdjustDialog(true);
                }}
                sx={{ borderColor: alpha(theme.palette.success.main, 0.5) }}
              >
                Bulk Credit
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                variant="outlined"
                startIcon={<RemoveIcon />}
                onClick={() => {
                  setAdjustType("debit");
                  setOpenAdjustDialog(true);
                }}
                sx={{ borderColor: alpha(theme.palette.error.main, 0.5) }}
              >
                Bulk Debit
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                variant="outlined"
                startIcon={<LockIcon />}
                color="error"
                onClick={handleBulkFreeze}
                sx={{ borderColor: alpha(theme.palette.error.main, 0.5) }}
              >
                Freeze Selected
              </QuickActionButton>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionButton
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => toast.info("Export feature coming soon")}
              >
                Export Report
              </QuickActionButton>
            </Grid>
          </Grid>
        </Paper>

        {/* User Wallets Table */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h6" fontWeight="600">
              User Wallets
            </Typography>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 300 } }}
            />
          </Box>
          
          {errors.users ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Alert severity="error">{errors.users}</Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.users ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton variant="rectangular" height={60} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                        <WalletIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <StyledTableRow
                        key={user.id}
                        hover
                        onClick={() => handleUserRowClick(user)}
                      >
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                          >
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                              badgeContent={
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor: user.frozen
                                      ? "error.main"
                                      : "success.main",
                                    border: `2px solid ${theme.palette.background.paper}`,
                                  }}
                                />
                              }
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: user.frozen
                                    ? alpha(theme.palette.error.main, 0.1)
                                    : alpha(theme.palette.success.main, 0.1),
                                  color: user.frozen
                                    ? theme.palette.error.main
                                    : theme.palette.success.main,
                                }}
                              >
                                {user.name?.charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {user.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="700">
                            ${(user.balance || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={user.frozen ? "Frozen" : "Active"}
                            status={user.status}
                            frozen={user.frozen}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, user)}
                            sx={{
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Recent Transactions */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="600">
              Recent Wallet Transactions
            </Typography>
            <Button
              size="small"
              endIcon={<HistoryIcon />}
              onClick={() => toast.info("View all coming soon")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              View All
            </Button>
          </Box>
          
          {errors.transactions ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Alert severity="error">{errors.transactions}</Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading.transactions ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton variant="rectangular" height={60} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : walletData.recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <HistoryIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No recent transactions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    walletData.recentTransactions.map((tx) => (
                      <StyledTableRow
                        key={tx.id}
                        hover
                        onClick={() => handleTransactionRowClick(tx)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {tx.userName || tx.user || "Unknown"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TransactionChip
                            icon={
                              tx.type === "CREDIT" ? (
                                <TrendingUpIcon />
                              ) : (
                                <TrendingDownIcon />
                              )
                            }
                            label={tx.type}
                            type={tx.type}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            color={
                              tx.type === "CREDIT" ? "success.main" : "error.main"
                            }
                          >
                            {tx.type === "CREDIT" ? "+" : "-"}${(tx.amount || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${(tx.balanceAfter || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={new Date(tx.date || tx.createdAt).toLocaleString()}>
                            <Typography variant="body2">
                              {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* User Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, minWidth: 200, mt: 1 },
          }}
        >
          <MenuItem
            onClick={() => {
              setOpenUserDetailDialog(true);
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            View Details
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAdjustType("credit");
              setSelectedUserId(selectedUser?.id);
              setOpenAdjustDialog(true);
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" color="success" />
            </ListItemIcon>
            Credit Wallet
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAdjustType("debit");
              setSelectedUserId(selectedUser?.id);
              setOpenAdjustDialog(true);
              handleMenuClose();
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <RemoveIcon fontSize="small" color="error" />
            </ListItemIcon>
            Debit Wallet
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              // Handle freeze/unfreeze
              handleMenuClose();
            }}
            sx={{ py: 1.5, color: selectedUser?.frozen ? "success.main" : "error.main" }}
          >
            <ListItemIcon>
              {selectedUser?.frozen ? (
                <LockOpenIcon fontSize="small" color="success" />
              ) : (
                <LockIcon fontSize="small" color="error" />
              )}
            </ListItemIcon>
            {selectedUser?.frozen ? "Unfreeze Wallet" : "Freeze Wallet"}
          </MenuItem>
        </Menu>

        {/* Adjust Wallet Dialog */}
        <Dialog
          open={openAdjustDialog}
          onClose={() => setOpenAdjustDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
          TransitionComponent={Fade}
        >
          <DialogTitle sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight="700">
              {adjustType === "credit" ? "Credit Wallet" : "Debit Wallet"}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Reason"
                fullWidth
                multiline
                rows={3}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Enter reason for adjustment..."
              />
              {adjustType === "credit" && (
                <Alert
                  severity="info"
                  icon={<TrendingUpIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  This will add funds to the user's wallet.
                </Alert>
              )}
              {adjustType === "debit" && (
                <Alert
                  severity="warning"
                  icon={<TrendingDownIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  This will deduct funds from the user's wallet.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setOpenAdjustDialog(false)}
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustWallet}
              variant="contained"
              color={adjustType === "credit" ? "primary" : "error"}
              disabled={!adjustAmount || parseFloat(adjustAmount) <= 0 || loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {loading.action
                ? "Processing..."
                : adjustType === "credit"
                ? "Credit Amount"
                : "Debit Amount"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default WalletManagement;