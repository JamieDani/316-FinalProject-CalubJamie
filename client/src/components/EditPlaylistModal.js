import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import storeRequestSender from '../store/requests';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import PlaylistSongCard from './PlaylistSongCard';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    height: 500,
    bgcolor: 'background.paper',
    border: '3px solid #000',
    boxShadow: 24,
    p: 3,
    display: 'flex',
    flexDirection: 'column'
};

export default function EditPlaylistModal({ open, onClose, playlist }) {
    const history = useHistory();
    const [playlistTitle, setPlaylistTitle] = useState("Untitled Playlist");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [songs, setSongs] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        if (playlist) {
            setPlaylistTitle(playlist.name);
            fetchSongs();
        }
    }, [playlist]);

    const fetchSongs = async () => {
        if (!playlist?._id) return;
        try {
            const response = await storeRequestSender.getSongsOfPlaylist(playlist._id);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            setSongs([]);
        }
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            return;
        }

        const newSongs = [...songs];
        const [draggedSong] = newSongs.splice(draggedIndex, 1);
        newSongs.splice(dropIndex, 0, draggedSong);

        setSongs(newSongs);
        setDraggedIndex(null);

        const songIds = newSongs.map(song => song._id);
        try {
            await storeRequestSender.updatePlaylistById(playlist._id, {
                songs: songIds
            });
        } catch (error) {
            console.error("Error updating playlist order:", error);
            fetchSongs();
        }
    };

    const handleDragEnter = (index) => {
    };

    const handleAddSong = () => {
        history.push('/song-catalog/');
    };

    const handleRemoveSong = async (song) => {
        if (!playlist?._id || !song?._id) return;
        try {
            await storeRequestSender.removeSongFromPlaylist(playlist._id, song._id);
            fetchSongs();
        } catch (error) {
            console.error("Error removing song from playlist:", error);
        }
    };

    const handleTitleDoubleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (event) => {
        setPlaylistTitle(event.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            setIsEditingTitle(false);
            if (playlist && playlistTitle !== playlist.name) {
                try {
                    await storeRequestSender.updatePlaylistById(playlist._id, {
                        name: playlistTitle
                    });
                    console.log("Playlist title saved");
                } catch (error) {
                    console.error("Error updating playlist title:", error);
                }
            }
        }
    };

    const handleSaveAndClose = async () => {
        if (playlist && playlistTitle !== playlist.name) {
            try {
                await storeRequestSender.updatePlaylistById(playlist._id, {
                    name: playlistTitle
                });
            } catch (error) {
                console.error("Error updating playlist:", error);
            }
        }
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={playlistTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                border: '1px solid #ccc',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                flex: 1,
                                marginRight: '10px'
                            }}
                        />
                    ) : (
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 'bold', cursor: 'pointer', flex: 1 }}
                            onDoubleClick={handleTitleDoubleClick}
                        >
                            {playlistTitle}
                        </Typography>
                    )}
                    <IconButton
                        onClick={handleAddSong}
                        sx={{
                            border: '2px solid #8932CC',
                            color: '#8932CC',
                            '&:hover': {
                                backgroundColor: '#f0e6ff'
                            }
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: 1,
                        padding: 2,
                        backgroundColor: '#f9f9f9'
                    }}
                >
                    {songs && songs.length > 0 ? (
                        songs.map((song, index) => (
                            <PlaylistSongCard
                                key={song._id || index}
                                song={song}
                                index={index}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onDragEnter={handleDragEnter}
                                onDelete={handleRemoveSong}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            No songs in this playlist
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                            sx={{
                                border: '1px solid #8932CC',
                                color: '#8932CC'
                            }}
                        >
                            <UndoIcon />
                        </IconButton>
                        <IconButton
                            sx={{
                                border: '1px solid #8932CC',
                                color: '#8932CC'
                            }}
                        >
                            <RedoIcon />
                        </IconButton>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleSaveAndClose}
                        sx={{
                            backgroundColor: '#8932CC',
                            '&:hover': {
                                backgroundColor: '#702963'
                            }
                        }}
                    >
                        Save and Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
