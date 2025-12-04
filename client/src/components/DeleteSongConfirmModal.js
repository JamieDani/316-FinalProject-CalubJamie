import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import storeRequestSender from '../store/requests';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '3px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function DeleteSongConfirmModal({ open, onClose, song }) {
    const handleConfirmDelete = () => {
        if (!song) return;

        storeRequestSender.deleteSong(song._id)
            .then(response => {
                console.log("Song deleted successfully");
                onClose(true); 
            })
            .catch(error => {
                console.error("Error deleting song:", error);
                onClose(false);
            });
    };

    const handleCancel = () => {
        onClose(false);
    };

    return (
        <Modal open={open} onClose={handleCancel}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Confirm Deletion
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    Are you sure you want to remove "{song?.title}" by {song?.artist} from the catalog?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        sx={{ color: "#8932CC", borderColor: "#8932CC" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmDelete}
                        sx={{ backgroundColor: "#8932CC", '&:hover': { backgroundColor: "#702963" } }}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
