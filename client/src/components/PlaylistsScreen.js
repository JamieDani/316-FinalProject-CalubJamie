import { Box, Typography, TextField, Button, Divider, Stack } from '@mui/material';
import { useState, useContext } from 'react';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import EditPlaylistModal from './EditPlaylistModal';

const PlaylistsScreen = () => {
    const { auth } = useContext(AuthContext);
    const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);

    const handleAddPlaylist = async () => {
        if (!auth.user) {
            console.error("No user logged in");
            return;
        }

        try {
            const response = await storeRequestSender.createPlaylist(
                auth.user.username,
                auth.user.email
            );
            if (response.data.success) {
                setCurrentPlaylist(response.data.playlist);
                setIsEditPlaylistModalOpen(true);
            }
        } catch (error) {
            console.error("Error creating playlist:", error);
        }
    };

    const handleClosePlaylistModal = () => {
        setIsEditPlaylistModalOpen(false);
        setCurrentPlaylist(null);
    };

    return (
        <>
            <EditPlaylistModal
                open={isEditPlaylistModalOpen}
                onClose={handleClosePlaylistModal}
                playlist={currentPlaylist}
            />
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
                flexDirection: 'column',
                padding: 4
            }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5">
                        Hello world
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPlaylist}
                    sx={{ alignSelf: 'flex-start' }}
                >
                    Add Playlist
                </Button>
            </Box>
        </Box>
        </>
    )
}

export default PlaylistsScreen;