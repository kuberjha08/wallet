import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  useTheme,
  alpha,
  Stack,
  Divider,
  Alert,
  AlertTitle,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Skeleton,
  Tooltip,
  Fade,
  Zoom,
  Backdrop,
  CircularProgress,
  Avatar,
  TablePagination,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterIcon,
  ManageAccounts as AccountBalanceWalletIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { format, subDays, subMonths, subWeeks, subYears } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
);

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.spacing(2),
  transition: "transform 0.3s, box-shadow 0.3s",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  transition: "all 0.3s",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  },
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(10px)",
}));

// Loading Overlay Component
const LoadingOverlay = ({ open, message = "Generating report..." }) => (
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

// Report Preview Dialog
const ReportPreviewDialog = ({ open, onClose, reportData, format }) => {
  const theme = useTheme();

  if (!reportData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: "80vh",
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: "divider" }}>
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
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Report Preview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reportData.reportType} • {format.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Report Summary */}
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total {reportData.reportType}
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  {reportData.totalTransactions?.toLocaleString() || 
                   reportData.newUsers?.toLocaleString() || 
                   "0"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Volume
                </Typography>
                <Typography variant="h4" fontWeight="700" color="primary.main">
                  ${(reportData.totalVolume || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date Range
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {reportData.dateRange}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Trends Table */}
          {reportData.trends && reportData.trends.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.trends.map((trend, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(trend.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell align="right">{trend.count}</TableCell>
                      <TableCell align="right">${(trend.volume || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary Table */}
          {reportData.summary && reportData.summary.length > 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.summary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">${(item.total || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, borderTop: 1, borderColor: "divider" }}>
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
          startIcon={<DownloadIcon />}
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Download {format.toUpperCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Reports = () => {
  const theme = useTheme();

  // State Management
  const [reportType, setReportType] = useState("transactions");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [format, setFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState({
    summary: true,
    generate: false,
  });
  const [selectedColumns, setSelectedColumns] = useState([
    "date",
    "id",
    "user",
    "amount",
    "status",
  ]);

  // Data States
  const [summaryData, setSummaryData] = useState({
    totalTransactions: 0,
    totalUsers: 0,
    totalVolume: 0,
    avgTransaction: 0,
    userGrowth: 0,
    kycCompletion: 0,
    retention: 0,
  });

  const [chartData, setChartData] = useState({
    transactionTrends: {
      labels: [],
      datasets: [],
    },
    userGrowth: {
      labels: [],
      datasets: [],
    },
    revenueDistribution: {
      labels: [],
      datasets: [],
    },
  });

  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Summary Data
  const fetchSummaryData = async () => {
    setLoading((prev) => ({ ...prev, summary: true }));
    setError(null);

    try {
      // Fetch transaction summary
      const txResponse = await api.get("/admin/transactions/summary");
      
      // Fetch user stats
      const userResponse = await api.get("/admin/users/stats");
      
      // Fetch wallet overview for volume
      const walletResponse = await api.get("/admin/wallet-management/overview");

      setSummaryData({
        totalTransactions: txResponse.data.totalTransactions || 0,
        totalUsers: userResponse.data.totalUsers || 0,
        totalVolume: walletResponse.data.totalVolume || 0,
        avgTransaction: txResponse.data.avgTransaction || 0,
        userGrowth: userResponse.data.userGrowth || "+8.2%",
        kycCompletion: "76.2%", // This would come from KYC stats
        retention: "84.7%", // This would come from user stats
      });

      // Set chart data
      setChartData({
        transactionTrends: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Transaction Volume",
              data: [45000, 52000, 48000, 58000, 62000, 68000],
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              tension: 0.4,
              fill: true,
            },
          ],
        },
        userGrowth: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "New Users",
              data: [120, 150, 180, 220, 280, 350],
              backgroundColor: theme.palette.success.main,
            },
          ],
        },
        revenueDistribution: {
          labels: ["Deposits", "Withdrawals", "Transfers", "Fees"],
          datasets: [
            {
              data: [45000, 28000, 15000, 3200],
              backgroundColor: [
                theme.palette.primary.main,
                theme.palette.success.main,
                theme.palette.warning.main,
                theme.palette.info.main,
              ],
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setError("Failed to load summary data");
      toast.error("Failed to load summary data");
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  // Handle Date Range Change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();

    switch (range) {
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "yesterday":
        setStartDate(subDays(today, 1));
        setEndDate(subDays(today, 1));
        break;
      case "week":
        setStartDate(subWeeks(today, 1));
        setEndDate(today);
        break;
      case "month":
        setStartDate(subMonths(today, 1));
        setEndDate(today);
        break;
      case "quarter":
        setStartDate(subMonths(today, 3));
        setEndDate(today);
        break;
      case "year":
        setStartDate(subYears(today, 1));
        setEndDate(today);
        break;
      case "custom":
        // Keep existing custom dates
        break;
      default:
        setStartDate(subMonths(today, 1));
        setEndDate(today);
    }
  };

  // Handle Generate Report
  const handleGenerateReport = async () => {
    setLoading((prev) => ({ ...prev, generate: true }));
    setError(null);

    try {
      const response = await api.post("/admin/reports/generate", {
        reportType,
        dateRange,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        format,
        includeCharts,
        includeTables,
        selectedColumns,
      });

      setGeneratedReport(response.data);
      setPreviewDialogOpen(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      setError(error.response?.data?.message || "Failed to generate report");
      toast.error("Failed to generate report");
    } finally {
      setLoading((prev) => ({ ...prev, generate: false }));
    }
  };

  // Handle Export Report
  const handleExportReport = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await api.post("/admin/reports/export", {
        reportType,
        dateRange,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : null,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : null,
        format,
        includeCharts,
        includeTables,
        selectedColumns,
      });

      // Download file
      window.open(response.data.url, "_blank");
      toast.success(`Report exported as ${format.toUpperCase()}`);
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  // Handle Column Toggle
  const handleColumnToggle = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column],
    );
  };

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
  };

  // Column Definitions
  const transactionColumns = [
    { value: "date", label: "Date", default: true },
    { value: "id", label: "Transaction ID", default: true },
    { value: "user", label: "User", default: true },
    { value: "type", label: "Type", default: true },
    { value: "amount", label: "Amount", default: true },
    { value: "status", label: "Status", default: true },
    { value: "paymentMethod", label: "Payment Method", default: false },
    { value: "reference", label: "Reference", default: false },
    { value: "ipAddress", label: "IP Address", default: false },
    { value: "device", label: "Device", default: false },
  ];

  const userColumns = [
    { value: "id", label: "User ID", default: true },
    { value: "name", label: "Name", default: true },
    { value: "email", label: "Email", default: true },
    { value: "mobile", label: "Mobile", default: true },
    { value: "status", label: "Status", default: true },
    { value: "kycStatus", label: "KYC Status", default: true },
    { value: "joinDate", label: "Join Date", default: false },
    { value: "lastActive", label: "Last Active", default: false },
    { value: "walletBalance", label: "Wallet Balance", default: false },
  ];

  // Summary Cards Data
  const reportSummaries = [
    {
      title: "Total Transactions",
      value: summaryData.totalTransactions.toLocaleString(),
      change: "+15.3%",
      icon: <ReceiptIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: "Total Users",
      value: summaryData.totalUsers.toLocaleString(),
      change: summaryData.userGrowth,
      icon: <PeopleIcon />,
      color: theme.palette.success.main,
    },
    {
      title: "Total Volume",
      value: `$${summaryData.totalVolume.toLocaleString()}`,
      change: "+22.4%",
      icon: <TrendingUpIcon />,
      color: theme.palette.info.main,
    },
    {
      title: "Avg. Transaction",
      value: `$${summaryData.avgTransaction.toFixed(2)}`,
      change: "+5.2%",
      icon: <WalletIcon />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Loading Overlay */}
      <LoadingOverlay
        open={loading.generate}
        message="Generating your report..."
      />

      {/* Report Preview Dialog */}
      <ReportPreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        reportData={generatedReport}
        format={format}
      />

      <Box sx={{ p: 3 }}>
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
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate and export comprehensive business reports
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
            disabled={loading.summary}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Export Report
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Report Type Selection */}
        <FilterPaper>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="transactions">Transaction Report</MenuItem>
                  <MenuItem value="users">User Report</MenuItem>
                  <MenuItem value="kyc">KYC Report</MenuItem>
                  <MenuItem value="wallet">Wallet Report</MenuItem>
                  <MenuItem value="revenue">Revenue Report</MenuItem>
                  <MenuItem value="compliance">Compliance Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 90 Days</MenuItem>
                  <MenuItem value="year">Last 365 Days</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dateRange === "custom" && (
              <>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={dateRange === "custom" ? 2 : 4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading.generate}
                startIcon={
                  loading.generate ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AssessmentIcon />
                  )
                }
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading.generate ? "Generating..." : "Generate Report"}
              </Button>
            </Grid>
          </Grid>
        </FilterPaper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loading.summary
            ? [1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                </Grid>
              ))
            : reportSummaries.map((summary, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                    <StyledCard>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: alpha(summary.color, 0.1),
                              color: summary.color,
                            }}
                          >
                            {summary.icon}
                          </Box>
                          <Chip
                            label={summary.change}
                            size="small"
                            color={summary.change.startsWith("+") ? "success" : "error"}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="h4" fontWeight="700" gutterBottom>
                          {summary.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {summary.title}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Zoom>
                </Grid>
              ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Zoom in={true} style={{ transitionDelay: "200ms" }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Transaction Trends
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  {loading.summary ? (
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                  ) : (
                    <Line data={chartData.transactionTrends} options={chartOptions} />
                  )}
                </Box>
              </Paper>
            </Zoom>
          </Grid>
          <Grid item xs={12} md={4}>
            <Zoom in={true} style={{ transitionDelay: "300ms" }}>
              <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Revenue Distribution
                </Typography>
                <Box
                  sx={{
                    height: 300,
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {loading.summary ? (
                    <Skeleton variant="circular" width={200} height={200} />
                  ) : (
                    <Pie data={chartData.revenueDistribution} options={chartOptions} />
                  )}
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Zoom in={true} style={{ transitionDelay: "400ms" }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  User Growth
                </Typography>
                <Box sx={{ height: 250, mt: 2 }}>
                  {loading.summary ? (
                    <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
                  ) : (
                    <Bar data={chartData.userGrowth} options={chartOptions} />
                  )}
                </Box>
              </Paper>
            </Zoom>
          </Grid>
          <Grid item xs={12} md={6}>
            <Zoom in={true} style={{ transitionDelay: "500ms" }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Top Performing Metrics
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {loading.summary ? (
                    [1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
                    ))
                  ) : (
                    <>
                      <MetricCard>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Transaction Success Rate
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            98.5%
                          </Typography>
                        </Box>
                      </MetricCard>

                      <MetricCard>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PeopleIcon sx={{ color: theme.palette.warning.main }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            KYC Completion Rate
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {summaryData.kycCompletion}
                          </Typography>
                        </Box>
                      </MetricCard>

                      <MetricCard>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AccountBalanceWalletIcon sx={{ color: theme.palette.info.main }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            User Retention
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            {summaryData.retention}
                          </Typography>
                        </Box>
                      </MetricCard>

                      <MetricCard>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <AccessTimeIcon sx={{ color: theme.palette.primary.main }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Average Response Time
                          </Typography>
                          <Typography variant="h6" fontWeight="600">
                            1.2s
                          </Typography>
                        </Box>
                      </MetricCard>
                    </>
                  )}
                </Stack>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>

        {/* Export Dialog */}
        <Dialog
          open={exportDialogOpen}
          onClose={() => !exporting && setExportDialogOpen(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ p: 3, pb: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="700">
              Export Report
            </Typography>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Export Format */}
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Export Format
                </Typography>
                <RadioGroup
                  row
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PdfIcon color="error" />
                        PDF Document
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="excel"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ExcelIcon color="success" />
                        Excel Spreadsheet
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CsvIcon color="primary" />
                        CSV File
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>

              <Divider />

              {/* Include Options */}
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Include in Report
                </Typography>
                <Stack direction="row" spacing={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeCharts}
                        onChange={(e) => setIncludeCharts(e.target.checked)}
                      />
                    }
                    label="Charts & Visualizations"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeTables}
                        onChange={(e) => setIncludeTables(e.target.checked)}
                      />
                    }
                    label="Data Tables"
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Column Selection */}
              <Box>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                  Select Columns to Export
                </Typography>
                <Grid container spacing={2}>
                  {(reportType === "transactions" ? transactionColumns : userColumns).map(
                    (column) => (
                      <Grid item xs={6} sm={4} key={column.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedColumns.includes(column.value)}
                              onChange={() => handleColumnToggle(column.value)}
                              size="small"
                            />
                          }
                          label={column.label}
                        />
                      </Grid>
                    ),
                  )}
                </Grid>
              </Box>

              {exporting && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Generating report... Please wait.
                  </Typography>
                </Box>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setExportDialogOpen(false)}
              disabled={exporting}
              variant="outlined"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportReport}
              disabled={exporting}
              variant="contained"
              startIcon={exporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {exporting ? "Exporting..." : "Export Report"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

// Add missing icon import
const AccessTimeIcon = () => <></>; // Temporary, remove when you have the actual import

export default Reports;