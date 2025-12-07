import { useState, useEffect, useRef } from 'react';
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
import { jsTPS, jsTPS_Transaction } from 'jstps';

class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(modal, oldIndex, newIndex) {
        super();
        this.modal = modal;
        this.oldIndex = oldIndex;
        this.newIndex = newIndex;
    }

    executeDo() {
        this.modal.moveSong(this.oldIndex, this.newIndex);
    }

    executeUndo() {
        this.modal.moveSong(this.newIndex, this.oldIndex);
    }
}

class AddSong_Transaction extends jsTPS_Transaction {
    constructor(modal, song, index) {
        super();
        this.modal = modal;
        this.song = song;
        this.index = index;
    }

    executeDo() {
        this.modal.addSongAtIndex(this.song, this.index);
    }

    executeUndo() {
        this.modal.removeSongAtIndex(this.index);
    }
}

class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(modal, song, index) {
        super();
        this.modal = modal;
        this.song = song;
        this.index = index;
    }

    executeDo() {
        this.modal.removeSongAtIndex(this.index);
    }

    executeUndo() {
        this.modal.addSongAtIndex(this.song, this.index);
    }
}

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
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const tps = useRef(new jsTPS());
    const songsRef = useRef([]);

    useEffect(() => {
        if (playlist) {
            setPlaylistTitle(playlist.name);
            fetchSongs();
            tps.current.clearAllTransactions();
            setCanUndo(false);
            setCanRedo(false);
        }
    }, [playlist]);

    useEffect(() => {
        songsRef.current = songs;
    }, [songs]);

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

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            return;
        }

        addMoveSongTransaction(draggedIndex, dropIndex);
        setDraggedIndex(null);
    };

    const handleDragEnter = (index) => {
    };

    const handleAddSong = () => {
        history.push('/song-catalog/');
    };

    const handleRemoveSong = (song, index) => {
        if (!playlist?._id || !song?._id) return;
        addRemoveSongTransaction(song, index);
    };

    const moveSong = async (start, end) => {
        const newSongs = [...songsRef.current];
        const [movedSong] = newSongs.splice(start, 1);
        newSongs.splice(end, 0, movedSong);

        setSongs(newSongs);

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

    const addSongAtIndex = async (song, index) => {
        const newSongs = [...songsRef.current];
        if (index === -1 || index >= newSongs.length) {
            newSongs.push(song);
        } else {
            newSongs.splice(index, 0, song);
        }

        setSongs(newSongs);

        try {
            await storeRequestSender.addSongToPlaylist(playlist._id, song._id, index);
        } catch (error) {
            console.error("Error adding song to playlist:", error);
            fetchSongs();
        }
    };

    const removeSongAtIndex = async (index) => {
        const newSongs = [...songsRef.current];
        const removedSong = newSongs[index];
        newSongs.splice(index, 1);

        setSongs(newSongs);

        try {
            await storeRequestSender.removeSongFromPlaylist(playlist._id, removedSong._id);
        } catch (error) {
            console.error("Error removing song from playlist:", error);
            fetchSongs();
        }
    };

    const addMoveSongTransaction = (start, end) => {
        const transaction = new MoveSong_Transaction({ moveSong }, start, end);
        tps.current.processTransaction(transaction);
        setCanUndo(tps.current.hasTransactionToUndo());
        setCanRedo(tps.current.hasTransactionToDo());
    };

    const addRemoveSongTransaction = (song, index) => {
        const transaction = new RemoveSong_Transaction({ removeSongAtIndex, addSongAtIndex }, song, index);
        tps.current.processTransaction(transaction);
        setCanUndo(tps.current.hasTransactionToUndo());
        setCanRedo(tps.current.hasTransactionToDo());
    };

    const handleUndo = () => {
        if (tps.current.hasTransactionToUndo()) {
            tps.current.undoTransaction();
            setCanUndo(tps.current.hasTransactionToUndo());
            setCanRedo(tps.current.hasTransactionToDo());
        }
    };

    const handleRedo = () => {
        if (tps.current.hasTransactionToDo()) {
            tps.current.doTransaction();
            setCanUndo(tps.current.hasTransactionToUndo());
            setCanRedo(tps.current.hasTransactionToDo());
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
                            onClick={handleUndo}
                            disabled={!canUndo}
                            sx={{
                                border: '1px solid #8932CC',
                                color: '#8932CC',
                                '&.Mui-disabled': {
                                    color: '#ccc',
                                    borderColor: '#ccc'
                                }
                            }}
                        >
                            <UndoIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleRedo}
                            disabled={!canRedo}
                            sx={{
                                border: '1px solid #8932CC',
                                color: '#8932CC',
                                '&.Mui-disabled': {
                                    color: '#ccc',
                                    borderColor: '#ccc'
                                }
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
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
