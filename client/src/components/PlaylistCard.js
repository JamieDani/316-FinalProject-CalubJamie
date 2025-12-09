import { Box, Typography, Button, Avatar, IconButton, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlayPlaylistScreen from './PlayPlaylistScreen';

function PlaylistCard({ playlist, songs = [], onDelete, onEdit, onCopy, currentUserEmail }) {
    const [expanded, setExpanded] = useState(false);
    const [isPlayModalOpen, setIsPlayModalOpen] = useState(false);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const isOwner = currentUserEmail && playlist.ownerEmail === currentUserEmail;
    const isSignedIn = Boolean(currentUserEmail);

    const handleDelete = () => {
        if (onDelete) {
            onDelete(playlist);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(playlist);
        }
    };

    const handleCopy = () => {
        if (onCopy) {
            onCopy(playlist);
        }
    };

    const handlePlay = () => {
        setIsPlayModalOpen(true);
    };

    const getInitials = (username) => {
        if (!username) return '?';
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <Box
            sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                padding: 1.5,
                marginBottom: 1.5,
                backgroundColor: '#f9f9f9'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Avatar
                    sx={{
                        width: 50,
                        height: 50,
                        backgroundColor: '#8932CC',
                        fontSize: '18px'
                    }}
                    src={playlist.ownerProfilePicture || undefined}
                >
                    {!playlist.ownerProfilePicture && getInitials(playlist.ownerUsername)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.25 }}>
                        {playlist.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block' }}>
                        {playlist.ownerUsername}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {playlist.numListeners || 0} listeners
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {isSignedIn && (
                        <>
                            {isOwner && (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleDelete}
                                        sx={{
                                            backgroundColor: '#dc3545',
                                            '&:hover': { backgroundColor: '#c82333' },
                                            minWidth: '60px',
                                            fontSize: '0.7rem',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleEdit}
                                        sx={{
                                            backgroundColor: '#007bff',
                                            '&:hover': { backgroundColor: '#0056b3' },
                                            minWidth: '60px',
                                            fontSize: '0.7rem',
                                            padding: '4px 8px'
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleCopy}
                                    sx={{
                                        backgroundColor: '#28a745',
                                        '&:hover': { backgroundColor: '#218838' },
                                        minWidth: '60px',
                                        fontSize: '0.7rem',
                                        padding: '4px 8px'
                                    }}
                                >
                                    Copy
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handlePlay}
                                    sx={{
                                        backgroundColor: '#e83e8c',
                                        '&:hover': { backgroundColor: '#d62976' },
                                        minWidth: '60px',
                                        fontSize: '0.7rem',
                                        padding: '4px 8px'
                                    }}
                                >
                                    Play
                                </Button>
                            </Box>
                        </>
                    )}
                    {!isSignedIn && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handlePlay}
                            sx={{
                                backgroundColor: '#e83e8c',
                                '&:hover': { backgroundColor: '#d62976' },
                                minWidth: '60px',
                                fontSize: '0.7rem',
                                padding: '4px 8px'
                            }}
                        >
                            Play
                        </Button>
                    )}
                </Box>

                <IconButton onClick={handleToggleExpand} size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ mt: 2, pl: 9 }}>
                    {songs && songs.length > 0 ? (
                        songs.map((song, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                {index + 1}. {song.title} by {song.artist} ({song.year})
                            </Typography>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No songs in this playlist
                        </Typography>
                    )}
                </Box>
            </Collapse>

            <PlayPlaylistScreen
                open={isPlayModalOpen}
                onClose={() => setIsPlayModalOpen(false)}
                playlist={playlist}
            />
        </Box>
    );
}

export default PlaylistCard;
