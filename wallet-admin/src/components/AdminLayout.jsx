import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Avatar,
    IconButton,
    TextField,
    InputAdornment,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    Dashboard as DashboardIcon,
    Group as GroupIcon,
    VerifiedUser as VerifiedUserIcon,
    SwapHoriz as SwapHorizIcon,
    ReceiptLong as ReceiptIcon,
    Analytics as AnalyticsIcon,
    SupportAgent as SupportIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const LayoutContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
}));

const Sidebar = styled(Paper)(({ theme }) => ({
    width: 280,
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    borderRadius: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    zIndex: theme.zIndex.drawer,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 3, 2, 3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const LogoIcon = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
}));

const NavSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2),
    flex: 1,
    overflowY: 'auto',
}));

const NavSectionTitle = styled(Typography)(({ theme }) => ({
    padding: theme.spacing(1.5, 2, 0.5, 2),
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.palette.text.secondary,
}));

const NavItem = styled(Button)(({ theme, active }) => ({
    justifyContent: 'flex-start',
    padding: theme.spacing(1.2, 2),
    margin: theme.spacing(0.3, 1),
    width: `calc(100% - ${theme.spacing(2)})`,
    borderRadius: theme.shape.borderRadius * 1.5,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    '&:hover': {
        backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[500], 0.08),
    },
    textTransform: 'none',
    fontWeight: active ? 700 : 500,
    fontSize: '0.9rem',
    gap: theme.spacing(1.5),
}));

const MainContent = styled(Box)(({ theme }) => ({
    flex: 1,
    marginLeft: 280,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
}));

const Header = styled(Paper)(({ theme }) => ({
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 4),
    borderRadius: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.appBar,
}));

const HeaderLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontSize: '1.2rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
}));

const BreadcrumbSeparator = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
}));

const BreadcrumbText = styled(Typography)(({ theme, active }) => ({
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 400,
    cursor: active ? 'default' : 'pointer',
    '&:hover': {
        color: active ? theme.palette.primary.main : theme.palette.text.primary,
    },
}));

const SearchField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: alpha(theme.palette.grey[500], 0.06),
        borderRadius: theme.shape.borderRadius * 2,
        height: 44,
        width: 300,
        '& fieldset': {
            border: 'none',
        },
        '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
        },
        '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
        },
    },
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.grey[500], 0.06),
    width: 44,
    height: 44,
    '&:hover': {
        backgroundColor: alpha(theme.palette.grey[500], 0.12),
    },
}));

const NotificationBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: theme.palette.error.main,
    border: `2px solid ${theme.palette.background.paper}`,
}));

const UserInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.grey[500], 0.06),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: alpha(theme.palette.grey[500], 0.1),
    },
}));

const Footer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 4),
    borderTop: `1px solid ${theme.palette.divider}`,
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
}));

const AdminLayout = ({ children, currentPage, setCurrentPage, user, pageTitle, breadcrumbs = [] }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');

    // Navigation items with page mapping
    const navItems = [
        {
            section: 'Main Menu',
            items: [
                { icon: <DashboardIcon />, label: 'Dashboard', page: 'dashboard' },
                { icon: <GroupIcon />, label: 'User Management', page: 'userManagement' },
                { icon: <VerifiedUserIcon />, label: 'KYC Verification', page: 'kyc' },
                { icon: <SwapHorizIcon />, label: 'Transactions', page: 'transactions' },
                { icon: <ReceiptIcon />, label: 'Wallet Management', page: 'walletManagement' },
            ]
        },
        {
            section: 'Reports',
            items: [
                { icon: <AnalyticsIcon />, label: 'Analytics', page: 'analytics' },
                { icon: <ReceiptIcon />, label: 'Audit Logs', page: 'audit' },
            ]
        }
    ];

    // Function to check if current page matches nav item
    const isActivePage = (itemPage) => {
        // Handle special cases like userDetails (which should highlight User Management)
        if (currentPage === 'userDetails' && itemPage === 'userManagement') {
            return true;
        }
        return currentPage === itemPage;
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        // Implement global search logic here
    };

    return (
        <LayoutContainer>
            {/* Sidebar - Always Visible */}
            <Sidebar elevation={0}>
                <LogoContainer>
                    <LogoIcon>
                        <AccountBalanceWalletIcon fontSize="small" />
                    </LogoIcon>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="800" lineHeight={1.2}>
                            Fintech Admin
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Wallet Management System
                        </Typography>
                    </Box>
                </LogoContainer>

                <NavSection>
                    {navItems.map((section) => (
                        <Box key={section.section}>
                            <NavSectionTitle>
                                {section.section}
                            </NavSectionTitle>
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.label}
                                    active={isActivePage(item.page)}
                                    startIcon={item.icon}
                                    fullWidth
                                    onClick={() => setCurrentPage(item.page)}
                                >
                                    {item.label}
                                </NavItem>
                            ))}
                        </Box>
                    ))}
                </NavSection>

                <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SupportIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            py: 1.2,
                        }}
                    >
                        Support Center
                    </Button>
                </Box>
            </Sidebar>

            {/* Main Content */}
            <MainContent>
                {/* Header */}
                <Header elevation={0}>
                    <HeaderLeft>
                        <PageTitle>
                            {pageTitle || 'Dashboard'}
                        </PageTitle>

                        {breadcrumbs.length > 0 && (
                            <>
                                <BreadcrumbSeparator>|</BreadcrumbSeparator>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {breadcrumbs.map((crumb, index) => (
                                        <React.Fragment key={crumb.label}>
                                            {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                                            <BreadcrumbText
                                                active={index === breadcrumbs.length - 1}
                                                onClick={() => !crumb.active && crumb.onClick?.()}
                                            >
                                                {crumb.label}
                                            </BreadcrumbText>
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </>
                        )}
                    </HeaderLeft>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SearchField
                            placeholder="Search users, transactions..."
                            value={searchTerm}
                            onChange={handleSearch}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <IconButtonStyled>
                            <NotificationsIcon />
                            <NotificationBadge />
                        </IconButtonStyled>

                        <IconButtonStyled>
                            <SettingsIcon />
                        </IconButtonStyled>

                        <UserInfo>
                            <Avatar
                                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBEgB2pqoKkPFHI4FNoUYVNBQPzFGzaU-xyGquWshAqZd0cUxCOwbyQ8cKmIGOR9kvNF4maHEbpjl77ch-HgMCjrZqek4toPeaOCNnSXb3qTnfQTtQLZD0sr32hTUP2KROfhfvKfBMMDU6vxNs07qFoxJA330LVMa5NreFPdbozsdEUNYYLlhVfbWJ9kIr_Jy7jyhXMYrvOhmgNBs5vcGku19Q4rDEwfv4oP05lxHLyPw9YHruWxuDQszwWRD7YtbsOAxYaHEzWfkM"}
                                sx={{ width: 36, height: 36 }}
                            />
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="body2" fontWeight="600">
                                    {user?.name || 'Admin User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user?.role || 'Super Admin'}
                                </Typography>
                            </Box>
                        </UserInfo>
                    </Box>
                </Header>

                {/* Page Content */}
                <Box sx={{ flex: 1 }}>
                    {children}
                </Box>

                {/* Footer */}
                <Footer>
                    <Typography color="text.secondary" fontSize="0.75rem">
                        Fintech Admin v2.5.0 | Secure Wallet Management System | © 2024 All Rights Reserved
                    </Typography>
                </Footer>
            </MainContent>
        </LayoutContainer>
    );
};

export default AdminLayout;