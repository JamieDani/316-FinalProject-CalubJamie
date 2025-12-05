import { Box, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

function PlaylistSongCard({ song, index, onDragStart, onDragOver, onDrop, onDragEnter }) {
    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        if (onDragStart) {
            onDragStart(index);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (onDragOver) {
            onDragOver(e, index);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (onDrop) {
            onDrop(e, index);
        }
    };

    const handleDragEnter = (e) => {
        if (onDragEnter) {
            onDragEnter(index);
        }
    };

    return (
        <Box
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 1.5,
                marginBottom: 1,
                backgroundColor: '#e0e0e0',
                border: '1px solid #999',
                borderRadius: 1,
                cursor: 'move',
                '&:hover': {
                    backgroundColor: '#d0d0d0'
                }
            }}
        >
            <Typography variant="body1">
                {index + 1}. {song.title} by {song.artist} ({song.year})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small">
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}

export default PlaylistSongCard;
