import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Button,
    Divider,
    ListItemIcon,
    Badge,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    AccountBalanceWallet as WalletIcon,
    Assessment as AssessmentIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {TokenManager} from "../pages/LoginPage.jsx";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    boxShadow: theme.shadows[0],
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NavButton = styled(Button)(({ theme, active }) => ({
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    fontWeight: active ? 600 : 500,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        color: theme.palette.primary.main,
    },
}));

const Header = ({ setCurrentPage, onLogout }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const user = TokenManager.getUser();

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
    const handleNotificationClose = () => setNotificationAnchor(null);
    const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
    const handleMobileMenuClose = () => setMobileMenuAnchor(null);

    const navItems = [
        { label: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
        { label: 'Users', icon: <PeopleIcon />, page: 'userManagement' },
        { label: 'Transactions', icon: <ReceiptIcon />, page: 'transactions' },
        { label: 'Wallet', icon: <WalletIcon />, page: 'walletManagement' },
        { label: 'Reports', icon: <AssessmentIcon />, page: 'reports' },
    ];

    return (
        <StyledAppBar position="sticky">
            <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                {/* Mobile Menu Icon */}
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleMobileMenuOpen}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>

                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AdminPanelIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            letterSpacing: '-0.015em',
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        Wallet Admin
                    </Typography>
                </Box>

                {/* Desktop Navigation */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                    {navItems.map((item) => (
                        <NavButton
                            key={item.page}
                            startIcon={item.icon}
                            onClick={() => setCurrentPage(item.page)}
                            sx={{ mx: 0.5, px: 2 }}
                        >
                            {item.label}
                        </NavButton>
                    ))}
                </Box>

                {/* Right Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Notifications */}
                    <IconButton
                        onClick={handleNotificationOpen}
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={handleMenuOpen}
                            size="small"
                            sx={{ ml: 1 }}
                            aria-controls="user-menu"
                            aria-haspopup="true"
                        >
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: theme.palette.primary.main,
                                }}
                            >
                                {user?.name?.charAt(0) || 'A'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Box>

                {/* User Menu Dropdown */}
                <Menu
                    anchorEl={anchorEl}
                    id="user-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 2,
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                            borderRadius: 2,
                        },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="600">
                            {user?.name || 'Admin User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.mobile || 'admin@example.com'}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <MenuItem onClick={onLogout} sx={{ py: 1.5, color: 'error.main' }}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationAnchor}
                    id="notifications-menu"
                    open={Boolean(notificationAnchor)}
                    onClose={handleNotificationClose}
                    PaperProps={{
                        elevation: 2,
                        sx: {
                            mt: 1.5,
                            minWidth: 320,
                            borderRadius: 2,
                        },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="600">
                            Notifications
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem sx={{ py: 1.5 }}>
                        <Box>
                            <Typography variant="body2" fontWeight="500">
                                New KYC Request
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                2 minutes ago
                            </Typography>
                        </Box>
                    </MenuItem>
                    <MenuItem sx={{ py: 1.5 }}>
                        <Box>
                            <Typography variant="body2" fontWeight="500">
                                Large Transaction Alert
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                1 hour ago
                            </Typography>
                        </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem sx={{ justifyContent: 'center' }}>
                        <Typography variant="body2" color="primary">
                            View All
                        </Typography>
                    </MenuItem>
                </Menu>

                {/* Mobile Menu */}
                <Menu
                    anchorEl={mobileMenuAnchor}
                    id="mobile-menu"
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                    PaperProps={{
                        sx: {
                            width: 240,
                            borderRadius: 2,
                        },
                    }}
                >
                    {navItems.map((item) => (
                        <MenuItem
                            key={item.page}
                            onClick={() => {
                                setCurrentPage(item.page);
                                handleMobileMenuClose();
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            {item.label}
                        </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;