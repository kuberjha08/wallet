import React, { useEffect, useState } from "react";
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
  TablePagination,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack,
  Tooltip,
  Skeleton,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Fade,
  Grow,
  Zoom,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Fingerprint as FingerprintIcon,
  Computer as ComputerIcon,
  Language as LanguageIcon,
  ContentCopy as ContentCopyIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../utils/api.js";
import { toast } from "react-toastify";

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.palette.text.secondary,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    cursor: "pointer",
  },
  transition: "background-color 0.2s",
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    completed: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      icon: <CheckCircleIcon />,
    },
    pending: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      icon: <AccessTimeIcon />,
    },
    failed: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      icon: <ErrorIcon />,
    },
    processing: {
      bg: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
      icon: <AccessTimeIcon />,
    },
  };
  const colorConfig = colors[status?.toLowerCase()] || {
    bg: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.text.secondary,
  };
  
  return {
    backgroundColor: colorConfig.bg,
    color: colorConfig.color,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 24,
    "& .MuiChip-label": { px: 1.5 },
  };
});

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  top: "50%",
  transform: "translateY(-50%)",
  opacity: 0,
  transition: "opacity 0.2s",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "pending":
        return <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />;
      case "failed":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                width: 48,
                height: 48,
              }}
            >
              <ReceiptIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Transaction Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.transactionId}
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
        <Grid container spacing={3}>
          {/* Status Banner */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(
                  transaction.status?.toLowerCase() === "completed"
                    ? theme.palette.success.main
                    : transaction.status?.toLowerCase() === "failed"
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                  0.1,
                ),
                border: `1px solid ${alpha(
                  transaction.status?.toLowerCase() === "completed"
                    ? theme.palette.success.main
                    : transaction.status?.toLowerCase() === "failed"
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                  0.2,
                )}`,
              }}
            >
              {getStatusIcon(transaction.status)}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Current Status
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {transaction.status || "Unknown"}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Transaction Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Transaction Information
            </Typography>
            <Stack spacing={2}>
              <DetailItem>
                <FingerprintIcon fontSize="small" color="action" />
                <Box sx={{ flex: 1, position: "relative" }}>
                  <Typography variant="caption" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {transaction.transactionId}
                  </Typography>
                  <CopyButton
                    size="small"
                    onClick={() =>
                      handleCopy(transaction.transactionId, "Transaction ID")
                    }
                    sx={{ opacity: copied === "Transaction ID" ? 1 : 0 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </CopyButton>
                </Box>
              </DetailItem>

              <DetailItem>
                <CalendarIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {formatDate(transaction.date || transaction.createdAt)}
                  </Typography>
                </Box>
              </DetailItem>

              <DetailItem>
                <PaymentIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {transaction.paymentMethod || "N/A"}
                  </Typography>
                </Box>
              </DetailItem>

              <DetailItem>
                <ReceiptIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Reference
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {transaction.reference || "N/A"}
                  </Typography>
                </Box>
              </DetailItem>
            </Stack>
          </Grid>

          {/* User Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              User Information
            </Typography>
            <Stack spacing={2}>
              <DetailItem>
                <PersonIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    User Name
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {transaction.userName || "N/A"}
                  </Typography>
                </Box>
              </DetailItem>

              <DetailItem>
                <AccountBalanceIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color={
                      transaction.type === "DEPOSIT"
                        ? "success.main"
                        : transaction.type === "WITHDRAWAL"
                          ? "error.main"
                          : "text.primary"
                    }
                  >
                    {transaction.type === "DEPOSIT" ? "+" : ""}
                    {transaction.type === "WITHDRAWAL" ? "-" : ""}$
                    {(transaction.amount || 0).toFixed(2)}
                  </Typography>
                </Box>
              </DetailItem>

              <DetailItem>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Chip
                  label={transaction.type}
                  size="small"
                  icon={
                    transaction.type === "DEPOSIT" ? (
                      <TrendingUpIcon />
                    ) : transaction.type === "WITHDRAWAL" ? (
                      <TrendingDownIcon />
                    ) : (
                      <ReceiptIcon />
                    )
                  }
                  color={
                    transaction.type === "DEPOSIT"
                      ? "success"
                      : transaction.type === "WITHDRAWAL"
                        ? "error"
                        : "info"
                  }
                  variant="outlined"
                />
              </DetailItem>
            </Stack>
          </Grid>

          {/* Additional Info */}
          {(transaction.ipAddress || transaction.deviceInfo) && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Additional Information
              </Typography>
              <Stack spacing={2}>
                {transaction.ipAddress && (
                  <DetailItem>
                    <LanguageIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        IP Address
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {transaction.ipAddress}
                      </Typography>
                    </Box>
                  </DetailItem>
                )}
                {transaction.deviceInfo && (
                  <DetailItem>
                    <ComputerIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Device Info
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {transaction.deviceInfo}
                      </Typography>
                    </Box>
                  </DetailItem>
                )}
              </Stack>
            </Grid>
          )}
        </Grid>
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

// Loading Overlay Component
const LoadingOverlay = ({ open, message = "Loading transactions..." }) => (
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

const Transactions = () => {
  const theme = useTheme();
  
  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [summary, setSummary] = useState({
    todayVolume: 0,
    todayCount: 0,
    yesterdayVolume: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState({
    initial: true,
    export: false,
  });
  const [error, setError] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedColumns] = useState([
    "date",
    "id",
    "user",
    "amount",
    "status",
    "paymentMethod",
  ]);

  // Fetch Transactions
  const fetchTransactions = async (showLoading = true) => {
    if (showLoading) setLoading((prev) => ({ ...prev, initial: true }));
    setError(null);

    try {
      const response = await api.get(
        `/admin/transactions?page=${page}&size=${rowsPerPage}` +
          `&type=${filterType !== "all" ? filterType : ""}` +
          `&status=${filterStatus !== "all" ? filterStatus : ""}` +
          `&search=${searchTerm}`,
      );
      setTransactions(response.data.content || []);
      setTotalTransactions(response.data.totalElements || 0);

      // Fetch summary
      const summaryResponse = await api.get("/admin/transactions/summary");
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.response?.data?.message || "Failed to load transactions");
      toast.error("Failed to load transactions");
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }
  };

  // Initial Load
  useEffect(() => {
    fetchTransactions();
  }, [page, rowsPerPage, filterType, filterStatus, searchTerm]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Export
  const handleExport = async (format) => {
    setLoading((prev) => ({ ...prev, export: true }));
    try {
      const response = await api.post(
        `/admin/transactions/export?format=${format}`,
        selectedColumns,
      );
      window.open(response.data.url);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export report");
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  };

  // Handle View Details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  // Handle Menu
  const handleMenuClick = (event, transaction) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  // Handle Row Click
  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  // Handle Pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get Transaction Icon
  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return <TrendingUpIcon color="success" />;
      case "withdrawal":
        return <TrendingDownIcon color="error" />;
      default:
        return <ReceiptIcon color="info" />;
    }
  };

  // Calculate Total Amount
  const totalAmount = transactions.reduce(
    (sum, tx) => sum + (tx.amount || 0),
    0,
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Loading Overlay */}
      <LoadingOverlay
        open={loading.initial}
        message="Loading transactions..."
      />

      {/* Transaction Details Dialog */}
      <TransactionDetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        transaction={selectedTransaction}
      />

      <Box sx={{ p: 3, minHeight:'100vh' }}>
        {/* Header */}
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
              Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all financial transactions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={
              loading.export ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={() => handleExport("pdf")}
            disabled={loading.export || transactions.length === 0}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {loading.export ? "Exporting..." : "Export Report"}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchTransactions}>
                Retry
              </Button>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Zoom in={true} style={{ transitionDelay: "100ms" }}>
              <SummaryCard>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Today's Volume
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    ${(summary.todayVolume || 0).toFixed(2)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 1,
                    }}
                  >
                    <TrendingUpIcon fontSize="small" />
                    {summary.yesterdayVolume > 0
                      ? `+${(
                          (summary.todayVolume / summary.yesterdayVolume) *
                            100 -
                          100
                        ).toFixed(1)}% from yesterday`
                      : "No data"}
                  </Typography>
                </CardContent>
              </SummaryCard>
            </Zoom>
          </Grid>
          <Grid item xs={12} md={6}>
            <Zoom in={true} style={{ transitionDelay: "200ms" }}>
              <SummaryCard>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Transactions Count
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {totalTransactions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transactions.filter((tx) => tx.status === "COMPLETED")
                      .length}{" "}
                    completed
                  </Typography>
                </CardContent>
              </SummaryCard>
            </Zoom>
          </Grid>
        </Grid>

        {/* Filters */}
        <FilterPaper>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by ID or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Tooltip title="Reset Filters">
                <IconButton
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterStatus("all");
                    fetchTransactions();
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </FilterPaper>

        {/* Transactions Table */}
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Transaction ID</StyledTableCell>
                  <StyledTableCell>User</StyledTableCell>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Type</StyledTableCell>
                  <StyledTableCell align="right">Amount</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Payment Method</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 && !loading.initial ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <ReceiptIcon
                        sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No transactions found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filter criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <StyledTableRow
                      key={tx.id}
                      hover
                      onClick={() => handleRowClick(tx)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {tx.transactionId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(
                                theme.palette.primary.main,
                                0.1,
                              ),
                              color: theme.palette.primary.main,
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {tx.userName?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          <Typography variant="body2" fontWeight="500">
                            {tx.userName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(
                            tx.date || tx.createdAt,
                          ).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(
                            tx.date || tx.createdAt,
                          ).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          {getTransactionIcon(tx.type)}
                          <Typography variant="body2">{tx.type}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="700"
                          color={
                            tx.type === "DEPOSIT"
                              ? "success.main"
                              : tx.type === "WITHDRAWAL"
                                ? "error.main"
                                : "text.primary"
                          }
                        >
                          {tx.type === "DEPOSIT"
                            ? "+"
                            : tx.type === "WITHDRAWAL"
                              ? "-"
                              : ""}
                          ${(tx.amount || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={tx.status}
                          status={tx.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {tx.paymentMethod || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, tx)}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalTransactions}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              ".MuiTablePagination-select": {
                borderRadius: 1,
              },
            }}
          />
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              minWidth: 200,
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => handleRowClick(selectedTransaction)}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            View Details
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              // Handle download receipt
            }}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon>
              <ReceiptIcon fontSize="small" />
            </ListItemIcon>
            Download Receipt
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default Transactions;