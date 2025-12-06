import { useState, useEffect, useRef } from 'react';
import { Dialog, Box, Typography, Button, Avatar, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import storeRequestSender from '../store/requests';
import YouTubePlayer from './YouTubePlayer';

const PlayPlaylistScreen = ({ open, onClose, playlist }) => {
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (open && playlist) {
            fetchPlaylistSongs();
            fetchProfilePicture();
            setCurrentSongIndex(0);
            setIsPlaying(true);
        }
    }, [open, playlist]);

    const fetchPlaylistSongs = async () => {
        try {
            const response = await storeRequestSender.getSongsOfPlaylist(playlist._id);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch (error) {
            console.error("Error fetching playlist songs:", error);
        }
    };

    const fetchProfilePicture = async () => {
        try {
            const response = await storeRequestSender.getUserProfilePictureByEmail(playlist.ownerEmail);
            if (response.data.success) {
                setProfilePicture(response.data.profilePicture);
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    };

    const handlePlayerReady = (player) => {
        playerRef.current = player;
    };

    const handlePlayPause = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handlePrevious = () => {
        if (songs.length === 0) return;
        const newIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
        setCurrentSongIndex(newIndex);
        setIsPlaying(true);
    };

    const handleNext = () => {
        if (songs.length === 0) return;
        const newIndex = currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1;
        setCurrentSongIndex(newIndex);
        setIsPlaying(true);
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    };

    const currentSong = songs[currentSongIndex];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    height: '80vh',
                    maxHeight: '80vh'
                }
            }}
        >
            <Box sx={{ display: 'flex', height: '100%', p: 3, gap: 3 }}>
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                        <Avatar
                            src={profilePicture}
                            sx={{ width: 60, height: 60 }}
                        >
                            {playlist?.ownerUsername?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {playlist?.name || 'Untitled Playlist'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {playlist?.ownerUsername}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto' }}>
                        {songs.map((song, index) => (
                            <Box
                                key={song._id}
                                onClick={() => handleSongClick(index)}
                                sx={{
                                    p: 2,
                                    mb: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    backgroundColor: index === currentSongIndex ? '#d4edff' : '#f9f9f9',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: index === currentSongIndex ? '#c0e3ff' : '#f0f0f0'
                                    }
                                }}
                            >
                                <Typography variant="body1">
                                    {index + 1}. "{song.title}" by {song.artist} ({song.year})
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <YouTubePlayer
                            videoId={currentSong?.youTubeId}
                            onPlayerReady={handlePlayerReady}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <IconButton
                            onClick={handlePrevious}
                            disabled={songs.length === 0}
                            sx={{ border: '1px solid #ccc' }}
                        >
                            <SkipPreviousIcon />
                        </IconButton>
                        <IconButton
                            onClick={handlePlayPause}
                            disabled={songs.length === 0}
                            sx={{ border: '1px solid #ccc' }}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        <IconButton
                            onClick={handleNext}
                            disabled={songs.length === 0}
                            sx={{ border: '1px solid #ccc' }}
                        >
                            <SkipNextIcon />
                        </IconButton>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onClose}
                        fullWidth
                    >
                        Close
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
};

export default PlayPlaylistScreen;
