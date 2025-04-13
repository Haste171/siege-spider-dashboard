import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    useTheme,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Person as PersonIcon,
    Block as BlockIcon,
    Gamepad as GamepadIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const links = [
        { text: 'Lookup', path: '/', icon: <PersonIcon /> },
        { text: 'Bans', path: '/bans', icon: <BlockIcon /> },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <GamepadIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                    R6S Spider
                </Typography>
            </Box>
            <Divider />
            <List>
                {links.map((link) => (
                    <ListItem key={link.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={link.path}
                            sx={{
                                backgroundColor: isActive(link.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                            }}
                        >
                            <ListItemIcon>{link.icon}</ListItemIcon>
                            <ListItemText primary={link.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static" sx={{ mb: 2, width: '100%' }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GamepadIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            R6S Spider
                        </Typography>
                    </Box>
                    {!isMobile && (
                        <Box sx={{ display: 'flex', ml: 4 }}>
                            {links.map((link) => (
                                <Button
                                    key={link.text}
                                    component={Link}
                                    to={link.path}
                                    color="inherit"
                                    startIcon={link.icon}
                                    sx={{
                                        mx: 1,
                                        borderBottom: isActive(link.path) ? '2px solid white' : 'none',
                                        borderRadius: 0,
                                        paddingBottom: '2px',
                                    }}
                                >
                                    {link.text}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navbar;