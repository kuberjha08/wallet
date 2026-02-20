import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
  Zoom,
  Fade,
  Backdrop,
  CircularProgress,
  AlertTitle,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Badge as BadgeIcon,
  Face as FaceIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  Report as ReportIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import api from "../utils/api.js";
import { toast } from "react-toastify";

const TabButton = styled(Button)(({ theme, active }) => ({
  position: "relative",
  padding: theme.spacing(1.5, 2),
  borderRadius: 0,
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: 700,
  fontSize: "0.875rem",
  textTransform: "none",
  "&::after": active
    ? {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: theme.palette.primary.main,
      }
    : {},
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    pending: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      icon: <WarningIcon />,
    },
    approved: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      icon: <CheckCircleIcon />,
    },
    rejected: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      icon: <ErrorIcon />,
    },
  };
  const normalizedStatus = status?.toLowerCase() || "pending";
  const colorConfig = colors[normalizedStatus] || colors.pending;
  
  return {
    backgroundColor: colorConfig.bg,
    color: colorConfig.color,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: 24,
    "& .MuiChip-label": { px: 1.5 },
  };
});

const DocumentButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.grey[500], 0.05),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(0.5),
  textTransform: "uppercase",
  fontSize: "0.65rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
  gap: theme.spacing(0.5),
  minWidth: "auto",
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.spacing(1.5),
    maxWidth: 560,
    width: "100%",
  },
}));

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

const KYCManagement = ({ setCurrentPage }) => {
  const theme = useTheme();
  
  // State Management
  const [openModal, setOpenModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [kycRequests, setKycRequests] = useState([]);
  const [totalKyc, setTotalKyc] = useState(0);
  const [kycStats, setKycStats] = useState({});
  const [loading, setLoading] = useState({
    initial: true,
    action: false,
  });
  const [error, setError] = useState(null);

  // Fetch KYC Requests
  const fetchKycRequests = useCallback(async () => {
    setLoading(prev => ({ ...prev, initial: true }));
    setError(null);
    
    try {
      const response = await api.get(
        `/admin/kyc?page=${page}&size=10&status=${activeTab}&search=${searchTerm}`,
      );
      setKycRequests(response.data.content || []);
      setTotalKyc(response.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching KYC:", error);
      setError("Failed to load KYC requests");
      toast.error("Failed to load KYC requests");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [page, activeTab, searchTerm]);

  // Fetch KYC Stats
  const fetchKycStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/kyc/stats");
      setKycStats(response.data);
    } catch (error) {
      console.error("Error fetching KYC stats:", error);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchKycRequests();
    fetchKycStats();
  }, [fetchKycRequests, fetchKycStats]);

  // Handle Approve
  const handleApproveKYC = async (kycId) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.post(`/admin/kyc/${kycId}/approve`);
      toast.success("KYC approved successfully");
      await fetchKycRequests();
      await fetchKycStats();
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error(error.response?.data?.message || "Failed to approve KYC");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle Reject
  const handleRejectKYC = async (kycId) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await api.post(`/admin/kyc/${kycId}/reject`, {
        reason: rejectionReason,
        notes: customNotes,
      });
      toast.success("KYC rejected successfully");
      handleCloseModal();
      await fetchKycRequests();
      await fetchKycStats();
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast.error(error.response?.data?.message || "Failed to reject KYC");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Handle Open Modal
  const handleOpenModal = (kyc) => {
    setSelectedKYC(kyc);
    setOpenModal(true);
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedKYC(null);
    setRejectionReason("");
    setCustomNotes("");
  };

  // Handle Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) fetchKycRequests();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchKycRequests]);

  // Handle Refresh
  const handleRefresh = () => {
    fetchKycRequests();
    fetchKycStats();
    toast.info("Data refreshed");
  };

  // Handle Export
  const handleExport = async () => {
    try {
      toast.info("Export feature coming soon");
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  // Get document icon
  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "id":
      case "aadhar":
      case "pan":
      case "dl":
        return <BadgeIcon fontSize="small" />;
      case "selfie":
        return <FaceIcon fontSize="small" />;
      case "utility bill":
        return <HomeIcon fontSize="small" />;
      default:
        return <BadgeIcon fontSize="small" />;
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      <LoadingOverlay open={loading.action} message="Processing KYC..." />

      <Box sx={{ p: 3 }}>
        {/* Page Heading */}
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
          <Box>
            <Typography variant="h4" fontWeight="700">
              KYC Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify and manage user KYC documents
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                disabled={loading.initial}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <RefreshIcon
                  sx={{
                    animation: loading.initial ? "spin 1s linear infinite" : "none",
                  }}
                />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Export CSV
            </Button>
          </Box>
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

        {/* Search */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <TextField
            placeholder="Search by name or email..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 4 }}>
            <TabButton
              active={activeTab === "pending"}
              onClick={() => setActiveTab("pending")}
            >
              Pending
              <Chip
                label={kycStats.pending || "0"}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  fontWeight: 600,
                  height: 20,
                }}
              />
            </TabButton>
            <TabButton
              active={activeTab === "approved"}
              onClick={() => setActiveTab("approved")}
            >
              Approved
              <Chip
                label={kycStats.approved || "0"}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  height: 20,
                }}
              />
            </TabButton>
            <TabButton
              active={activeTab === "rejected"}
              onClick={() => setActiveTab("rejected")}
            >
              Rejected
              <Chip
                label={kycStats.rejected || "0"}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  fontWeight: 600,
                  height: 20,
                }}
              />
            </TabButton>
          </Box>
        </Box>

        {/* Table */}
        <Paper
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
                    User
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
                    Date Submitted
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
                    Documents
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
                    Status
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.secondary" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.initial ? (
                  // Loading Skeletons
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton variant="rectangular" height={60} sx={{ my: 0.5 }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : kycRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <InfoIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No KYC requests found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search or filter criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  kycRequests.map((kyc) => (
                    <TableRow key={kyc.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            src={kyc.userAvatar}
                            sx={{
                              bgcolor: kyc.userAvatar
                                ? "transparent"
                                : alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {!kyc.userAvatar && kyc.userName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {kyc.userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kyc.userEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(kyc.submittedDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(kyc.submittedDate).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {kyc.documents?.map((doc, idx) => (
                            <Tooltip key={idx} title={`View ${doc.type}`}>
                              <DocumentButton size="small">
                                {getDocumentIcon(doc.type)}
                                {doc.type}
                              </DocumentButton>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={kyc.status}
                          status={kyc.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          {activeTab === "pending" && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  px: 2,
                                }}
                                onClick={() => handleApproveKYC(kyc.id)}
                                disabled={loading.action}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  px: 2,
                                }}
                                onClick={() => handleOpenModal(kyc)}
                                disabled={loading.action}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {activeTab !== "pending" && (
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {!loading.initial && kycRequests.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.grey[500], 0.02),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography color="text.secondary" variant="body2">
                Showing {page * 10 + 1} to {Math.min((page + 1) * 10, totalKyc)} of {totalKyc} applications
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  sx={{ textTransform: "none" }}
                >
                  Previous
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={(page + 1) * 10 >= totalKyc}
                  onClick={() => setPage(page + 1)}
                  sx={{ textTransform: "none" }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Rejection Modal */}
        <StyledDialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Fade}
        >
          <DialogTitle
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  p: 1,
                  borderRadius: 1.5,
                }}
              >
                <ReportIcon />
              </Box>
              <Typography variant="h6" fontWeight="700">
                Reject KYC Application
              </Typography>
            </Box>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.05),
                p: 2,
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Avatar
                src={selectedKYC?.userAvatar}
                sx={{
                  bgcolor: selectedKYC?.userAvatar
                    ? "transparent"
                    : alpha(theme.palette.grey[500], 0.2),
                  color: theme.palette.text.primary,
                  width: 40,
                  height: 40,
                }}
              >
                {!selectedKYC?.userAvatar && selectedKYC?.userName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="600">
                  {selectedKYC?.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedKYC?.userEmail}
                </Typography>
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Reason for Rejection</InputLabel>
              <Select
                value={rejectionReason}
                label="Reason for Rejection"
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <MenuItem value="Blurry Document">Blurry Document</MenuItem>
                <MenuItem value="Expired ID">Expired ID</MenuItem>
                <MenuItem value="Document Name Mismatch">Document Name Mismatch</MenuItem>
                <MenuItem value="Invalid Document Type">Invalid Document Type</MenuItem>
                <MenuItem value="Suspicious/Modified Document">Suspicious/Modified Document</MenuItem>
                <MenuItem value="Incomplete Information">Incomplete Information</MenuItem>
                <MenuItem value="Other">Other Reason...</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Custom Notes to User"
              multiline
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Explain why the document was rejected..."
              sx={{ mb: 2 }}
            />

            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                borderRadius: 2,
              }}
            >
              <Typography variant="caption">
                This action will notify the user via email to resubmit their documents.
              </Typography>
            </Alert>
          </DialogContent>

          <DialogActions
            sx={{ p: 2, gap: 1, borderTop: `1px solid ${theme.palette.divider}` }}
          >
            <Button
              onClick={handleCloseModal}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleRejectKYC(selectedKYC?.id)}
              disabled={!rejectionReason || loading.action}
              startIcon={loading.action ? <CircularProgress size={20} /> : null}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {loading.action ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogActions>
        </StyledDialog>
      </Box>

      {/* Animation Styles */}
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

export default KYCManagement;