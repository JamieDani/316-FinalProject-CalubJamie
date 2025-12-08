import { Box, Typography, TextField, Button, Divider, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState, useEffect, useContext, useRef } from 'react';
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
    const [sortMethod, setSortMethod] = useState("");
    const lastTrackedSongRef = useRef(null);

    useEffect(() => {
        const initialFilters = {};
        if (auth.user && auth.user.email) {
            initialFilters.ownerEmail = auth.user.email;
        }
        fetchSongs(initialFilters);
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

        const hasNoFilters = Object.keys(filters).length === 0;
        if (hasNoFilters && auth.user && auth.user.email) {
            filters.ownerEmail = auth.user.email;
        }

        fetchSongs(filters);
    };

    const handleClear = () => {
        setTitleFilter("");
        setArtistFilter("");
        setYearFilter("");
        const emptyFilters = {};
        if (auth.user && auth.user.email) {
            emptyFilters.ownerEmail = auth.user.email;
        }
        fetchSongs(emptyFilters);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
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

    const handleSongAddedToPlaylist = (songId) => {
        setSongs(prevSongs =>
            prevSongs.map(s =>
                s._id === songId ? { ...s, numPlaylists: (s.numPlaylists || 0) + 1 } : s
            )
        );
    };

    const handleSongClick = (song) => {
        setSelectedSongForPlayer(song);
    };

    const handleSongPlay = async (song) => {
        if (!song || !song._id) return;

        if (lastTrackedSongRef.current !== song._id) {
            try {
                const response = await storeRequestSender.addSongListen(song._id);
                lastTrackedSongRef.current = song._id;
                console.log("Song listen tracked for:", song.title);

                if (response.data.success && response.data.song) {
                    setSongs(prevSongs =>
                        prevSongs.map(s =>
                            s._id === song._id ? { ...s, numListens: response.data.song.numListens } : s
                        )
                    );
                }
            } catch (error) {
                console.error("Error tracking song listen:", error);
            }
        }
    };

    const handleSortChange = (event) => {
        setSortMethod(event.target.value);
    };

    const getSortedSongs = () => {
        const songsCopy = [...songs];

        switch (sortMethod) {
            case "listens-hi-lo":
                return songsCopy.sort((a, b) => (b.numListens || 0) - (a.numListens || 0));
            case "listens-lo-hi":
                return songsCopy.sort((a, b) => (a.numListens || 0) - (b.numListens || 0));
            case "playlists-hi-lo":
                return songsCopy.sort((a, b) => (b.numPlaylists || 0) - (a.numPlaylists || 0));
            case "playlists-lo-hi":
                return songsCopy.sort((a, b) => (a.numPlaylists || 0) - (b.numPlaylists || 0));
            case "year-a-z":
                return songsCopy.sort((a, b) => a.title.localeCompare(b.title));
            case "year-z-a":
                return songsCopy.sort((a, b) => b.title.localeCompare(a.title));
            case "artist-a-z":
                return songsCopy.sort((a, b) => a.artist.localeCompare(b.artist));
            case "artist-z-a":
                return songsCopy.sort((a, b) => b.artist.localeCompare(a.artist));
            case "year-hi-lo":
                return songsCopy.sort((a, b) => b.year - a.year);
            case "year-lo-hi":
                return songsCopy.sort((a, b) => a.year - b.year);
            default:
                return songsCopy;
        }
    };

    return (
        <>
            <AddSongModal open={isAddSongModalOpen} onClose={handleCloseAddSongModal} mode="add" />
            <AddSongModal open={isEditSongModalOpen} onClose={handleCloseEditSongModal} mode="edit" song={selectedSong} />
            <DeleteSongConfirmModal open={isDeleteModalOpen} onClose={handleCloseDeleteModal} song={selectedSong} />
            <AddToPlaylistModal open={isAddToPlaylistModalOpen} onClose={handleCloseAddToPlaylistModal} song={selectedSong} onSongAdded={handleSongAddedToPlaylist} />
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
                        onKeyDown={handleKeyDown}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Artist"
                        value={artistFilter}
                        onChange={(e) => setArtistFilter(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="by Year"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        onKeyDown={handleKeyDown}
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
                        <YouTubePlayer
                            videoId={selectedSongForPlayer?.youTubeId}
                            onPlay={() => handleSongPlay(selectedSongForPlayer)}
                        />
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
                            value={sortMethod}
                            onChange={handleSortChange}
                        >
                            <MenuItem value="listens-hi-lo">Listens (Hi-Lo)</MenuItem>
                            <MenuItem value="listens-lo-hi">Listens (Lo-Hi)</MenuItem>
                            <MenuItem value="playlists-hi-lo">Playlists (Hi-Lo)</MenuItem>
                            <MenuItem value="playlists-lo-hi">Playlists (Lo-Hi)</MenuItem>
                            <MenuItem value="year-a-z">Song title (A-Z)</MenuItem>
                            <MenuItem value="year-z-a">Song title (Z-A)</MenuItem>
                            <MenuItem value="artist-a-z">Song artist (A-Z)</MenuItem>
                            <MenuItem value="artist-z-a">Song artist (Z-A)</MenuItem>
                            <MenuItem value="year-hi-lo">Song year (Hi-Lo)</MenuItem>
                            <MenuItem value="year-lo-hi">Song year (Lo-Hi)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                    {getSortedSongs().map((song, index) => (
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

                {auth.user && (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ alignSelf: 'flex-start' }}
                        onClick={handleAddSong}
                    >
                        Add Song
                    </Button>
                )}
            </Box>
        </Box>
        </>
    )
}

export default SongCatalogScreen;