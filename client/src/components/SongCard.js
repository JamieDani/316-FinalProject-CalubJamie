import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

function SongCard(props) {
    const { song, onEdit, onDelete, onAddToPlaylist, onClick, isSelected, currentUserEmail } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const isOwner = currentUserEmail && song.ownerEmail === currentUserEmail;
    const isSignedIn = Boolean(currentUserEmail);

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit(song);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete(song);
    };

    const handleAddToPlaylist = () => {
        handleMenuClose();
        onAddToPlaylist(song);
    };

    return (
        <Box
            onClick={onClick}
            sx={{
                border: isOwner ? '3px solid #1976d2' : '1px solid #ccc',
                borderRadius: 1,
                padding: 2,
                marginBottom: 1,
                backgroundColor: isSelected ? '#d4edff' : '#f9f9f9',
                position: 'relative',
                '&:hover': {
                    backgroundColor: isSelected ? '#c0e3ff' : '#f0f0f0',
                    cursor: 'pointer'
                }
            }}
        >
            <IconButton
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8
                }}
                onClick={handleMenuClick}
                disabled={!isSignedIn}
            >
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
            >
                {isOwner && <MenuItem onClick={handleEdit}>Edit Song</MenuItem>}
                {isOwner && <MenuItem onClick={handleDelete}>Remove Song from Catalog</MenuItem>}
                <MenuItem onClick={handleAddToPlaylist}>Add Song To Playlist</MenuItem>
            </Menu>

            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, pr: 5 }}>
                "{song.title}" by {song.artist} ({song.year})
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    listens: {song.numListeners}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    playlists: {song.numPlaylists}
                </Typography>
            </Box>
        </Box>
    )
}

export default SongCard;
// function SongCard(props) {
//     const { store } = useContext(GlobalStoreContext);
//     const { song, index } = props;

//     function handleDragStart(event) {
//         event.dataTransfer.setData("song", index);
//     }

//     function handleDragOver(event) {
//         event.preventDefault();
//     }

//     function handleDragEnter(event) {
//         event.preventDefault();
//     }

//     function handleDragLeave(event) {
//         event.preventDefault();
//     }

//     function handleDrop(event) {
//         event.preventDefault();
//         let targetIndex = index;
//         let sourceIndex = Number(event.dataTransfer.getData("song"));

//         // UPDATE THE LIST
//         store.addMoveSongTransaction(sourceIndex, targetIndex);
//     }
//     function handleRemoveSong(event) {
//         store.addRemoveSongTransaction(song, index);
//     }
//     function handleClick(event) {
//         // DOUBLE CLICK IS FOR SONG EDITING
//         if (event.detail === 2) {
//             console.log("double clicked");
//             store.showEditSongModal(index, song);
//         }
//     }

//     let cardClass = "list-card unselected-list-card";
//     return (
//         <div
//             key={index}
//             id={'song-' + index + '-card'}
//             className={cardClass}
//             onDragStart={handleDragStart}
//             onDragOver={handleDragOver}
//             onDragEnter={handleDragEnter}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//             draggable="true"
//             onClick={handleClick}
//         >
//             {index + 1}.
//             <a
//                 id={'song-' + index + '-link'}
//                 className="song-link"
//                 href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
//                 {song.title} ({song.year}) by {song.artist}
//             </a>
//             <Button
//                 sx={{transform:"translate(-5%, -5%)", width:"5px", height:"30px"}}
//                 variant="contained"
//                 id={"remove-song-" + index}
//                 className="list-card-button"
//                 onClick={handleRemoveSong}>{"\u2715"}</Button>
//         </div>
//     );
// }

// export default SongCard;