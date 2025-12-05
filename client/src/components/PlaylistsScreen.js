import { Box, Typography, TextField, Button, Divider, Stack } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import EditPlaylistModal from './EditPlaylistModal';
import PlaylistCard from './PlaylistCard';
import DeletePlaylistConfirmModal from './DeletePlaylistConfirmModal';

const PlaylistsScreen = () => {
    const { auth } = useContext(AuthContext);
    const [isEditPlaylistModalOpen, setIsEditPlaylistModalOpen] = useState(false);
    const [isDeletePlaylistModalOpen, setIsDeletePlaylistModalOpen] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    const [playlists, setPlaylists] = useState([]);

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
        fetchPlaylists();
    };

    const handleDeletePlaylist = (playlist) => {
        setPlaylistToDelete(playlist);
        setIsDeletePlaylistModalOpen(true);
    };

    const handleCloseDeletePlaylistModal = (deleted) => {
        setIsDeletePlaylistModalOpen(false);
        setPlaylistToDelete(null);
        if (deleted) {
            fetchPlaylists();
        }
    };

    const handleEditPlaylist = (playlist) => {
        setCurrentPlaylist(playlist);
        setIsEditPlaylistModalOpen(true);
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const response = await storeRequestSender.getPlaylistPairs();
            if (response.data.success) {
                const playlistsWithSongs = await Promise.all(
                    response.data.idNamePairs.map(async (playlist) => {
                        try {
                            const songsResponse = await storeRequestSender.getSongsOfPlaylist(playlist._id);
                            const profilePictureResponse = await storeRequestSender.getUserProfilePictureByEmail(playlist.ownerEmail);
                            return {
                                ...playlist,
                                songs: songsResponse.data.success ? songsResponse.data.songs : [],
                                ownerProfilePicture: profilePictureResponse.data.success ? profilePictureResponse.data.profilePicture : null
                            };
                        } catch (error) {
                            console.error(`Error fetching data for playlist ${playlist._id}:`, error);
                            return {
                                ...playlist,
                                songs: [],
                                ownerProfilePicture: null
                            };
                        }
                    })
                );
                setPlaylists(playlistsWithSongs);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    return (
        <>
            <EditPlaylistModal
                open={isEditPlaylistModalOpen}
                onClose={handleClosePlaylistModal}
                playlist={currentPlaylist}
            />
            <DeletePlaylistConfirmModal
                open={isDeletePlaylistModalOpen}
                onClose={handleCloseDeletePlaylistModal}
                playlist={playlistToDelete}
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
                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                    {playlists.map((playlist, index) => (
                        <PlaylistCard
                            key={playlist._id || index}
                            playlist={playlist}
                            songs={playlist.songs || []}
                            onDelete={handleDeletePlaylist}
                            onEdit={handleEditPlaylist}
                        />
                    ))}
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