import React from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    IconButton,
    Divider,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Instagram as InstagramIcon,
    Favorite as FavoriteIcon,
    AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';

const Footer = () => {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Product: ['Features', 'Pricing', 'API', 'Documentation'],
        Company: ['About', 'Blog', 'Careers', 'Press'],
        Resources: ['Community', 'Support', 'Status', 'Security'],
        Legal: ['Privacy', 'Terms', 'Cookie Policy', 'GDPR'],
    };

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
                borderTop: `1px solid ${theme.palette.divider}`,
                pt: 6,
                pb: 3,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Logo and Description */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <AdminPanelIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                            <Typography variant="h6" fontWeight="700">
                                Admin Panel
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Complete fintech administration solution for managing users,
                            transactions, and compliance with enterprise-grade security.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                                <FacebookIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                                <TwitterIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                                <LinkedInIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
                                <InstagramIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <Grid item xs={6} sm={3} md={2} key={category}>
                            <Typography
                                variant="subtitle2"
                                fontWeight="600"
                                gutterBottom
                                sx={{ color: theme.palette.text.primary }}
                            >
                                {category}
                            </Typography>
                            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                {links.map((link) => (
                                    <Box component="li" key={link} sx={{ mb: 1 }}>
                                        <Link
                                            href="#"
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    color: theme.palette.primary.main,
                                                },
                                            }}
                                        >
                                            {link}
                                        </Link>
                                    </Box>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Bottom Bar */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {currentYear} Admin Panel. All rights reserved.
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mt: { xs: 2, sm: 0 },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'success.main',
                                }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                System Status: Operational
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Made with <FavoriteIcon sx={{ fontSize: 16, color: theme.palette.error.main }} /> for Fintech
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;