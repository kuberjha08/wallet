import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Paper,
    Grid,
    Avatar,
    Divider,
    Link,
    useTheme,
    Alert,
    Stack,
    Card,
    CardContent,
    Fade,
    Grow,
    CircularProgress,
} from '@mui/material';
import {
    MailOutline as MailIcon,
    LockOutlined as LockIcon,
    VisibilityOutlined as VisibilityIcon,
    VisibilityOffOutlined as VisibilityOffIcon,
    ArrowForward as ArrowForwardIcon,
    ShieldOutlined as ShieldIcon,
    FingerprintOutlined as FingerprintIcon,
    VpnKeyOutlined as VpnKeyIcon,
    AdminPanelSettings as AdminPanelIcon,
    VerifiedUser as VerifiedUserIcon,
    Verified as VerifiedIcon,
    Phone as PhoneIcon,
    Pin as PinIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from "../utils/api.js";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[20],
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 1.5,
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiOutlinedInput-input': {
        padding: theme.spacing(1.8, 1.75),
    },
}));

const GradientButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    '&:disabled': {
        background: theme.palette.action.disabledBackground,
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 120,
    height: 120,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[10],
}));

const SecurityIconBox = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
}));

const StatBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

// Token management utility
const TokenManager = {
    setToken: (token, user, rememberMe = false) => {
        if (rememberMe) {
            // Store in localStorage for persistence across browser sessions
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            localStorage.setItem('adminLoginTime', Date.now().toString());
        } else {
            // Store in sessionStorage - cleared when browser/tab is closed
            sessionStorage.setItem('adminToken', token);
            sessionStorage.setItem('adminUser', JSON.stringify(user));
            sessionStorage.setItem('adminLoginTime', Date.now().toString());
        }
    },

    getToken: () => {
        // Check sessionStorage first (current session)
        let token = sessionStorage.getItem('adminToken');
        if (token) return token;

        // Fallback to localStorage (remembered sessions)
        token = localStorage.getItem('adminToken');
        return token;
    },

    getUser: () => {
        // Check sessionStorage first
        let userStr = sessionStorage.getItem('adminUser');
        if (userStr) return JSON.parse(userStr);

        // Fallback to localStorage
        userStr = localStorage.getItem('adminUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    clearTokens: () => {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminLoginTime');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminLoginTime');
    },

    isAuthenticated: () => {
        return !!TokenManager.getToken();
    },

    getLoginTime: () => {
        const sessionTime = sessionStorage.getItem('adminLoginTime');
        if (sessionTime) return parseInt(sessionTime);

        const localTime = localStorage.getItem('adminLoginTime');
        return localTime ? parseInt(localTime) : null;
    },
};

const LoginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [mobile, setMobile] = useState('');
    const [mpin, setMpin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateMobile = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const validateMpin = (mpin) => {
        return mpin.length === 4 && /^\d+$/.test(mpin);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateMobile(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        if (!validateMpin(mpin)) {
            setError('MPIN must be 4 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/admin/login', {
                mobile: mobile,
                mpin: mpin,
            });

            const data = response.data;

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.token && data.user) {
                TokenManager.setToken(data.token, data.user, rememberMe);
                setMpin('');
                navigate('/dashboard');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    px: { xs: 3, md: 6 },
                    py: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ color: 'primary.main' }}>
                        <AdminPanelIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.015em',
                        }}
                    >
                        Wallet Admin
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                        Secure Access
                    </Typography>
                </Box>
            </Paper>

            {/* Main Content */}
            <Container
                maxWidth="lg"
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Grow in={true} timeout={1000}>
                    <StyledCard>
                        <Grid container>
                            {/* Left Column - Login Form */}
                            <Grid item xs={12} md={6}>
                                <Box
                                    sx={{
                                        p: { xs: 4, md: 6, lg: 8 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                    }}
                                >
                                    <Box sx={{ mb: 5, textAlign: { xs: 'center', md: 'left' } }}>
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 800,
                                                mb: 1,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            Secure Admin Login
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Enter your credentials to manage the fintech ecosystem.
                                        </Typography>
                                    </Box>

                                    {error && (
                                        <Fade in={!!error}>
                                            <Alert
                                                severity="error"
                                                sx={{
                                                    mb: 3,
                                                    borderRadius: 2,
                                                    '& .MuiAlert-message': {
                                                        width: '100%',
                                                    },
                                                }}
                                            >
                                                {error}
                                            </Alert>
                                        </Fade>
                                    )}

                                    <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
                                        <Stack spacing={3}>
                                            <Box>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{ mb: 1, fontWeight: 600 }}
                                                >
                                                    Mobile Number
                                                </Typography>
                                                <StyledTextField
                                                    fullWidth
                                                    placeholder="Enter 10-digit mobile number"
                                                    type="tel"
                                                    value={mobile}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        if (value.length <= 10) {
                                                            setMobile(value);
                                                        }
                                                    }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PhoneIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    error={mobile.length > 0 && !validateMobile(mobile)}
                                                    helperText={
                                                        mobile.length > 0 && !validateMobile(mobile)
                                                            ? 'Enter a valid 10-digit mobile number'
                                                            : ''
                                                    }
                                                    required
                                                />
                                            </Box>

                                            <Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 1,
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        MPIN
                                                    </Typography>
                                                    <Link
                                                        href="#"
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                            '&:hover': { textDecoration: 'underline' },
                                                        }}
                                                    >
                                                        Forgot MPIN?
                                                    </Link>
                                                </Box>
                                                <StyledTextField
                                                    fullWidth
                                                    placeholder="Enter 4-digit MPIN"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={mpin}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        if (value.length <= 4) {
                                                            setMpin(value);
                                                        }
                                                    }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PinIcon color="action" />
                                                            </InputAdornment>
                                                        ),
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? (
                                                                        <VisibilityOffIcon />
                                                                    ) : (
                                                                        <VisibilityIcon />
                                                                    )}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    error={mpin.length > 0 && !validateMpin(mpin)}
                                                    helperText={
                                                        mpin.length > 0 && !validateMpin(mpin)
                                                            ? 'MPIN must be 4 digits'
                                                            : ''
                                                    }
                                                    required
                                                />
                                            </Box>

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                        color="primary"
                                                        size="small"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" color="text.secondary">
                                                        Remember this device for 30 days
                                                    </Typography>
                                                }
                                            />

                                            <GradientButton
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                disabled={loading || !validateMobile(mobile) || !validateMpin(mpin)}
                                                endIcon={
                                                    loading ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        <ArrowForwardIcon
                                                            sx={{
                                                                transition: 'transform 0.2s',
                                                            }}
                                                        />
                                                    )
                                                }
                                                sx={{
                                                    '&:hover:not(:disabled) .MuiSvgIcon-root': {
                                                        transform: 'translateX(4px)',
                                                    },
                                                }}
                                            >
                                                {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                                            </GradientButton>
                                        </Stack>
                                    </Box>

                                    <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                letterSpacing: '0.1em',
                                                mb: 2,
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            Authorized Access Only
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: 2,
                                            }}
                                        >
                                            <SecurityIconBox>
                                                <ShieldIcon />
                                            </SecurityIconBox>
                                            <SecurityIconBox>
                                                <FingerprintIcon />
                                            </SecurityIconBox>
                                            <SecurityIconBox>
                                                <VpnKeyIcon />
                                            </SecurityIconBox>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Right Column - Illustration */}
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    display: { xs: 'none', md: 'block' },
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Background Blur Elements */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -100,
                                        right: -100,
                                        width: 400,
                                        height: 400,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        filter: 'blur(80px)',
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: -100,
                                        left: -100,
                                        width: 400,
                                        height: 400,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        filter: 'blur(80px)',
                                    }}
                                />

                                <Box
                                    sx={{
                                        position: 'relative',
                                        zIndex: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 6,
                                    }}
                                >
                                    <Box sx={{ position: 'relative', mb: 4 }}>
                                        <StyledAvatar>
                                            <AdminPanelIcon
                                                sx={{
                                                    fontSize: 64,
                                                    color: 'primary.main',
                                                }}
                                            />
                                        </StyledAvatar>
                                        <Avatar
                                            sx={{
                                                position: 'absolute',
                                                bottom: -8,
                                                right: -8,
                                                width: 48,
                                                height: 48,
                                                bgcolor: 'success.main',
                                                color: 'white',
                                                border: 4,
                                                borderColor: 'background.paper',
                                            }}
                                        >
                                            <VerifiedIcon sx={{ fontSize: 24 }} />
                                        </Avatar>
                                    </Box>

                                    <Box sx={{ textAlign: 'center', maxWidth: 280, mb: 4 }}>
                                        <Typography
                                            variant="h5"
                                            sx={{ fontWeight: 700, mb: 1.5 }}
                                        >
                                            Enhanced Security
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Your admin session is encrypted with bank-grade security
                                            and monitored for suspicious activity.
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={2} sx={{ maxWidth: 320 }}>
                                        <Grid item xs={6}>
                                            <StatBox elevation={0}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        color: 'primary.main',
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    99.9%
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontWeight: 700,
                                                        letterSpacing: '0.05em',
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    System Uptime
                                                </Typography>
                                            </StatBox>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <StatBox elevation={0}>
                                                <Typography
                                                    variant="h5"
                                                    sx={{
                                                        color: 'primary.main',
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    256-bit
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontWeight: 700,
                                                        letterSpacing: '0.05em',
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    Encryption
                                                </Typography>
                                            </StatBox>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </StyledCard>
                </Grow>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 6,
                    textAlign: 'center',
                }}
            >
                <Typography variant="body2" color="text.disabled">
                    © 2026 Fintech Admin Dashboard. All rights reserved.
                    <Box component="span" sx={{ mx: 1 }}>
                        |
                    </Box>
                    System Status:{' '}
                    <Box
                        component="span"
                        sx={{ color: 'success.main', fontWeight: 600 }}
                    >
                        Operational
                    </Box>
                </Typography>
            </Box>
        </Box>
    );
};

export { LoginPage, TokenManager };