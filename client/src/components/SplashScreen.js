import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function SplashScreen() {
    return (
        <Box
            id="splash-screen"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 200px)',
                gap: 4
            }}
        >
            <Typography variant="h1" sx={{ fontWeight: 'bold', fontSize: '4rem' }}>
                Playlister
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '300px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/playlists/"
                    fullWidth
                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                    Continue as Guest
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to="/login/"
                    fullWidth
                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                    Login
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to="/register/"
                    fullWidth
                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                >
                    Create Account
                </Button>
            </Box>
        </Box>
    )
}