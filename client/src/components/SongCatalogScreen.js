import { Box, Typography, TextField, Button, Divider, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import SongCard from './SongCard';
import YouTubePlayer from './YouTubePlayer';
import AddSongModal from './AddSongModal';
import DeleteSongConfirmModal from './DeleteSongConfirmModal';
import AddToPlaylistModal from './AddToPlaylistModal';

const SongCatalogScreen = () => {
    const { auth } = useContext(AuthContext);
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
    const [isEditSongModalOpen, setIsEditSongModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [songs, setSongs] = useState([]);
    const [titleFilter, setTitleFilter] = useState("");
    const [artistFilter, setArtistFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [selectedSongForPlayer, setSelectedSongForPlayer] = useState(null);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async (filters = {}) => {
        try {
            const response = await storeRequestSender.getSongs(filters);
            if (response.data.success) {
                setSongs(response.data.songs);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    const handleSearch = () => {
        const filters = {};
        if (titleFilter) filters.title = titleFilter;
        if (artistFilter) filters.artist = artistFilter;
        if (yearFilter) filters.year = yearFilter;

        fetchSongs(filters);
    };

    const handleClear = () => {
        setTitleFilter("");
        setArtistFilter("");
        setYearFilter("");
        fetchSongs();
    };

    const handleAddSong = () => {
        setIsAddSongModalOpen(true);
    };

    const handleCloseAddSongModal = () => {
        setIsAddSongModalOpen(false);
        fetchSongs();
    };

    const handleEditSong = (song) => {
        setSelectedSong(song);
        setIsEditSongModalOpen(true);
    };

    const handleCloseEditSongModal = () => {
        setIsEditSongModalOpen(false);
        setSelectedSong(null);
        fetchSongs();
    };

    const handleDeleteSong = (song) => {
        setSelectedSong(song);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = (deleted) => {
        setIsDeleteModalOpen(false);
        setSelectedSong(null);
        if (deleted) {
            fetchSongs();
        }
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setIsAddToPlaylistModalOpen(true);
    };

    const handleCloseAddToPlaylistModal = () => {
        setIsAddToPlaylistModalOpen(false);
        setSelectedSong(null);
    };

    const handleSongClick = (song) => {
        setSelectedSongForPlayer(song);
    };

    return (
        <>
            <AddSongModal open={isAddSongModalOpen} onClose={handleCloseAddSongModal} mode="add" />
            <AddSongModal open={isEditSongModalOpen} onClose={handleCloseEditSongModal} mode="edit" song={selectedSong} />
            <DeleteSongConfirmModal open={isDeleteModalOpen} onClose={handleCloseDeleteModal} song={selectedSong} />
            <AddToPlaylistModal open={isAddToPlaylistModalOpen} onClose={handleCloseAddToPlaylistModal} song={selectedSong} />
        <Box sx={{ display: 'flex', height: '100vh', width: '100%', backgroundColor: '#ffe4e1' }}>
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 4,
                gap: 2
            }}>
                <Typography variant="h4" gutterBottom>
                    Song Catalog
                </Typography>

                <Stack spacing={2} sx={{ flex: 1, maxWidth: 500 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Title"
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Artist"
                        value={artistFilter}
                        onChange={(e) => setArtistFilter(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Year"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleClear}>
                            Clear
                        </Button>
                    </Box>

                    <Box>
                        <YouTubePlayer videoId={selectedSongForPlayer?.youTubeId} />
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body1">Sort:</Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Sort Method</InputLabel>
                        <Select
                            label="Sort Method"
                            defaultValue=""
                        >
                            <MenuItem value="listens-hi-lo">Listens (Hi-Lo)</MenuItem>
                            <MenuItem value="listens-lo-hi">Listens (Lo-Hi)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                    {songs.map((song, index) => (
                        <SongCard
                            key={song._id || index}
                            song={song}
                            onEdit={handleEditSong}
                            onDelete={handleDeleteSong}
                            onAddToPlaylist={handleAddToPlaylist}
                            onClick={() => handleSongClick(song)}
                            isSelected={selectedSongForPlayer?._id === song._id}
                            currentUserEmail={auth.user?.email}
                        />
                    ))}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    sx={{ alignSelf: 'flex-start' }}
                    onClick={handleAddSong}
                >
                    Add Song
                </Button>
            </Box>
        </Box>
        </>
    )
}

export default SongCatalogScreen;