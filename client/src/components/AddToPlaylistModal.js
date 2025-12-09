import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import storeRequestSender from '../store/requests';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    maxHeight: 500,
    bgcolor: 'background.paper',
    border: '3px solid #000',
    boxShadow: 24,
    p: 3,
    display: 'flex',
    flexDirection: 'column'
};

export default function AddToPlaylistModal({ open, onClose, song, onSongAdded }) {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (open) {
            fetchPlaylists();
        }
    }, [open]);

    const fetchPlaylists = async () => {
        try {
            const response = await storeRequestSender.getPlaylistPairs();
            if (response.data.success) {
                setPlaylists(response.data.idNamePairs);
            }
        } catch (error) {
            console.error("Error fetching playlists:", error);
        }
    };

    const handleSelectPlaylist = async (playlistId) => {
        if (!song) return;

        try {
            await storeRequestSender.addSongToPlaylist(playlistId, song._id);
            console.log("Song added to playlist successfully");

            if (onSongAdded) {
                onSongAdded(song._id);
            }

            onClose();
        } catch (error) {
            console.error("Error adding song to playlist:", error);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Add "{song?.title}" to Playlist
                </Typography>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <List>
                        {playlists.map((playlist) => (
                            <ListItem key={playlist._id} disablePadding>
                                <ListItemButton onClick={() => handleSelectPlaylist(playlist._id)}>
                                    <ListItemText primary={playlist.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Modal>
    );
}
