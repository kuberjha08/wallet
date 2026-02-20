import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  PeopleAlt as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ReceiptLong as ReceiptIcon,
  SwapHoriz as SwapHorizIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TransactionsTable from "../components/TransactionsTable";
import QuickActions from "../components/QuickActions";
import { TokenManager } from "./LoginPage.jsx";
import api from "../utils/api.js";
import SubHeader from "../components/SubHeader.jsx";

const Dashboard = ({ setCurrentPage }) => {
  const theme = useTheme();
  const [user, setUser] = useState(null);

  // Individual loading states for each data section
  const [loadingStates, setLoadingStates] = useState({
    user: true,
    userStats: true,
    walletStats: true,
    transactionStats: true,
    recentTransactions: true,
  });

  // Data states
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    activeWallets: 0,
  });

  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    todayVolume: 0,
    yesterdayVolume: 0,
  });

  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    todayCount: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  // Navigation items
  const navItems = [
    { icon: <DashboardIcon />, label: "Dashboard", page: "dashboard" },
    { icon: <PeopleIcon />, label: "Users", page: "userManagement" },
    { icon: <VerifiedUserIcon />, label: "KYCs", page: "kyc" },
    { icon: <SwapHorizIcon />, label: "Transactions", page: "transactions" },
    {
      icon: <AccountBalanceWalletIcon />,
      label: "Wallet",
      page: "walletManagement",
    },
    { icon: <SettingsIcon />, label: "Settings", page: "settings" },
  ];

  // Get user from TokenManager
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = TokenManager.getUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, user: false }));
      }
    };
    fetchUser();
  }, []);

  // Sequential API calls with individual loading states
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get("/admin/users/stats");
        setUserStats({
          totalUsers: response.data.totalUsers || 0,
          pendingKYC: response.data.pendingKYC || 0,
          activeWallets: response.data.activeWallets || 0,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, userStats: false }));
      }
    };

    const fetchWalletStats = async () => {
      try {
        const response = await api.get("/admin/wallet-management/overview");
        setWalletStats({
          totalBalance: response.data.totalBalance || 0,
          todayVolume: response.data.todayVolume || 0,
          yesterdayVolume: response.data.yesterdayVolume || 0,
        });
      } catch (error) {
        console.error("Error fetching wallet stats:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, walletStats: false }));
      }
    };

    const fetchTransactionStats = async () => {
      try {
        const response = await api.get("/admin/transactions/summary");
        setTransactionStats({
          totalTransactions: response.data.totalTransactions || 0,
          todayCount: response.data.todayCount || 0,
        });
      } catch (error) {
        console.error("Error fetching transaction stats:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, transactionStats: false }));
      }
    };

    const fetchRecentTransactions = async () => {
      try {
        const response = await api.get("/admin/transactions?page=0&size=5");
        setRecentTransactions(response.data.content || []);
      } catch (error) {
        console.error("Error fetching recent transactions:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, recentTransactions: false }));
      }
    };

    // Execute APIs sequentially
    const fetchAllData = async () => {
      await fetchUserStats();
      await fetchWalletStats();
      await fetchTransactionStats();
      await fetchRecentTransactions();
    };

    fetchAllData();
  }, []);

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return "+0%";
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`;
  };

  // Stat Cards Configuration
  const statCards = [
    {
      title: "Total Users",
      value: userStats.totalUsers.toLocaleString(),
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      change: "+5.2%",
      trend: "up",
      loading: loadingStates.userStats,
    },
    {
      title: "Pending KYCs",
      value: userStats.pendingKYC.toLocaleString(),
      icon: <VerifiedUserIcon />,
      color: theme.palette.warning.main,
      change: "+2.1%",
      trend: "up",
      loading: loadingStates.userStats,
    },
    {
      title: "Wallet Balance",
      value: `$${walletStats.totalBalance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <AccountBalanceWalletIcon />,
      color: theme.palette.success.main,
      change: calculateGrowth(
        walletStats.todayVolume,
        walletStats.yesterdayVolume,
      ),
      trend:
        walletStats.todayVolume >= walletStats.yesterdayVolume ? "up" : "down",
      loading: loadingStates.walletStats,
    },
    {
      title: "Today's Transactions",
      value: transactionStats.todayCount.toLocaleString(),
      icon: <ReceiptIcon />,
      color: theme.palette.info.main,
      change: "+12.5%",
      trend: "up",
      loading: loadingStates.transactionStats,
    },
  ];

  // Format transactions
  const formatTransactions = () => {
    if (recentTransactions.length === 0) return [];

    return recentTransactions.map((tx) => ({
      id: tx.transactionId || `TXN-${tx.id}`,
      user: tx.userName || "User",
      initials: (tx.userName || "U").charAt(0).toUpperCase(),
      amount: tx.amount || 0,
      status: (tx.status || "pending").toLowerCase(),
      time: formatTimeAgo(new Date(tx.date || tx.createdAt)),
    }));
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    if (!date) return "recently";
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  // Quick actions
  const quickActions = [
    {
      icon: <PeopleIcon />,
      label: "Manage Users",
      onClick: () => setCurrentPage("userManagement"),
    },
    {
      icon: <VerifiedUserIcon />,
      label: "Pending KYC",
      onClick: () => setCurrentPage("kyc"),
    },
    {
      icon: <ReceiptIcon />,
      label: "Transactions",
      onClick: () => setCurrentPage("transactions"),
    },
    {
      icon: <AccountBalanceWalletIcon />,
      label: "Wallet",
      onClick: () => setCurrentPage("walletManagement"),
    },
  ];

  // Handle refresh
  const handleRefresh = () => {
    setLoadingStates({
      userStats: true,
      walletStats: true,
      transactionStats: true,
      recentTransactions: true,
    });

    // Refetch data
    const fetchAllData = async () => {
      try {
        const userStatsRes = await api.get("/admin/users/stats");
        setUserStats({
          totalUsers: userStatsRes.data.totalUsers || 0,
          pendingKYC: userStatsRes.data.pendingKYC || 0,
          activeWallets: userStatsRes.data.activeWallets || 0,
        });
        setLoadingStates((prev) => ({ ...prev, userStats: false }));

        const walletRes = await api.get("/admin/wallet-management/overview");
        setWalletStats({
          totalBalance: walletRes.data.totalBalance || 0,
          todayVolume: walletRes.data.todayVolume || 0,
          yesterdayVolume: walletRes.data.yesterdayVolume || 0,
        });
        setLoadingStates((prev) => ({ ...prev, walletStats: false }));

        const txSummaryRes = await api.get("/admin/transactions/summary");
        setTransactionStats({
          totalTransactions: txSummaryRes.data.totalTransactions || 0,
          todayCount: txSummaryRes.data.todayCount || 0,
        });
        setLoadingStates((prev) => ({ ...prev, transactionStats: false }));

        const txRes = await api.get("/admin/transactions?page=0&size=5");
        setRecentTransactions(txRes.data.content || []);
        setLoadingStates((prev) => ({ ...prev, recentTransactions: false }));
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };

    fetchAllData();
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* <Sidebar
        navItems={navItems}
        activePage="dashboard"
        onNavigate={(page) => setCurrentPage(page)}
        onSupportClick={() => console.log('Support clicked')}
      /> */}

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: "0px" }}>
        <SubHeader
          //   title="Dashboard"
          onRefresh={handleRefresh}
          loading={Object.values(loadingStates).some((v) => v)}
        />

        <Box sx={{ p: 3 }}>
          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>

          {/* Charts and Transactions Section */}
          <Grid container spacing={3}>
            {/* User Stats Card */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    User Statistics
                  </Typography>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                      {loadingStates.userStats ? (
                        <Skeleton variant="text" width={100} height={40} />
                      ) : (
                        <Typography variant="h3" fontWeight="700">
                          {userStats.totalUsers}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Wallets
                      </Typography>
                      {loadingStates.userStats ? (
                        <Skeleton variant="text" width={100} height={40} />
                      ) : (
                        <Typography variant="h3" fontWeight="700">
                          {userStats.activeWallets}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Pending KYC
                      </Typography>
                      {loadingStates.userStats ? (
                        <Skeleton variant="text" width={100} height={40} />
                      ) : (
                        <Typography
                          variant="h3"
                          fontWeight="700"
                          color="warning.main"
                        >
                          {userStats.pendingKYC}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transactions Table */}
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <TransactionsTable
                transactions={formatTransactions()}
                loading={loadingStates.recentTransactions}
                onViewAll={() => setCurrentPage("transactions")}
                onRowClick={(tx) => console.log("Transaction clicked:", tx)}
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mt: 4 }}>
            <QuickActions actions={quickActions} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
