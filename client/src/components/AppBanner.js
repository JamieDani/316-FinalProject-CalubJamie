import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store'

import EditToolbar from './EditToolbar'

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const hideNavButtons =
        location.pathname === '/' ||
        location.pathname === '/register/' ||
        location.pathname === '/login/' ||
        location.pathname === '/edit-account/';

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    }

    const handleHouseClick = () => {
        store.closeCurrentList();
    }

    const menuId = 'primary-search-account-menu';
    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem component={Link} to='/login/' onClick={handleMenuClose}>Login</MenuItem>
            <MenuItem component={Link} to='/register/' onClick={handleMenuClose}>Create New Account</MenuItem>
        </Menu>
    );
    const loggedInMenu =
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem component={Link} to='/edit-account/' onClick={handleMenuClose}>Edit Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>        

    let editToolbar = "";
    let menu = loggedOutMenu;
    if (auth.loggedIn) {
        menu = loggedInMenu;
        if (store.currentList) {
            editToolbar = <EditToolbar />;
        }
    }
    
    function getAccountMenu(loggedIn) {
        if (loggedIn) {
            const userInitials = auth.getUserInitials();
            const profilePicture = auth.user?.profilePicture;

            return (
                <Avatar
                    src={profilePicture || undefined}
                    sx={{ width: 40, height: 40 }}
                >
                    {!profilePicture && userInitials}
                </Avatar>
            );
        } else {
            return <AccountCircle />;
        }
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h4"
                        noWrap
                        component={Link}
                        to='/'
                        onClick={handleHouseClick}
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            textDecoration: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        ⌂
                    </Typography>
                    {!hideNavButtons && (
                        <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/playlists/"
                                sx={{ fontSize: '1rem' }}
                            >
                                Playlists
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/song-catalog/"
                                sx={{ fontSize: '1rem' }}
                            >
                                Song Catalog
                            </Button>
                        </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }}>{editToolbar}</Box>
                    <Box sx={{ height: "90px", display: { xs: 'none', md: 'flex' } }}>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            { getAccountMenu(auth.loggedIn) }
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {
                menu
            }
        </Box>
    );
}