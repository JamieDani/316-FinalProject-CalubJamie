import { Box, Typography, TextField, Button, Divider, Stack } from '@mui/material';

const PlaylistsScreen = () => {

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#ffe4e1' }}>
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 4,
                gap: 2
            }}>
                <Typography variant="h4" gutterBottom>
                    Playlists
                </Typography>

                <Stack spacing={2} sx={{ flex: 1, maxWidth: 500 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Playlist Name"
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by User Name"
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Song Title"
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Song Artist"
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Song Year"
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" color="primary">
                            Search
                        </Button>
                        <Button variant="outlined" color="secondary">
                            Clear
                        </Button>
                    </Box>
                </Stack>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4
            }}>
                <Typography variant="h5">
                    Hello world
                </Typography>
            </Box>
        </Box>
    )
}

export default PlaylistsScreen;