import { useContext, useState } from 'react'
import AuthContext from '../auth';
import storeRequestSender from '../store/requests';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 345,
    height: 250,
    backgroundSize: "contain",
    backgroundImage: `url(https://i.insider.com/602ee9ced3ad27001837f2ac?})`,
    border: '3px solid #000',
    padding: '20px',
    boxShadow: 24,
};

export default function AddSongModal({ open, onClose }) {
    const { auth } = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [year, setYear] = useState("");
    const [youTubeId, setYouTubeId] = useState("");

    function handleConfirmAddSong() {
        if (!auth.user) {
            console.error("No user logged in");
            return;
        }

        storeRequestSender.addSong(
            title,
            artist,
            parseInt(year),
            youTubeId,
            auth.user.username,
            auth.user.email
        )
        .then(response => {
            console.log("Song added successfully:", response.data);
            handleCancelAddSong();
        })
        .catch(error => {
            console.error("Error adding song:", error);
        });
    }

    function handleCancelAddSong() {
        setTitle("");
        setArtist("");
        setYear("");
        setYouTubeId("");
        onClose();
    }

    function handleUpdateTitle(event) {
        setTitle(event.target.value);
    }

    function handleUpdateArtist(event) {
        setArtist(event.target.value);
    }

    function handleUpdateYear(event) {
        setYear(event.target.value);
    }

    function handleUpdateYouTubeId(event) {
        setYouTubeId(event.target.value);
    }

    return (
        <Modal open={open}>
            <Box sx={style1}>
                <div id="add-song-modal" data-animation="slideInOutLeft">
                    <Typography
                        sx={{fontWeight: 'bold'}}
                        id="add-song-modal-title" variant="h4" component="h2">
                        Add Song
                    </Typography>
                    <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
                    <Typography
                        sx={{mt: "10px", color: "#702963", fontWeight:"bold", fontSize:"30px"}}
                        id="modal-modal-title" variant="h6" component="h2">
                        Title: <input id="add-song-modal-title-textfield" className='modal-textfield' type="text" value={title} onChange={handleUpdateTitle} />
                    </Typography>
                    <Typography
                        sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}}
                        id="modal-modal-artist" variant="h6" component="h2">
                        Artist: <input id="add-song-modal-artist-textfield" className='modal-textfield' type="text" value={artist} onChange={handleUpdateArtist} />
                    </Typography>
                    <Typography
                        sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}}
                        id="modal-modal-year" variant="h6" component="h2">
                        Year: <input id="add-song-modal-year-textfield" className='modal-textfield' type="text" value={year} onChange={handleUpdateYear} />
                    </Typography>
                    <Typography
                        sx={{color: "#702963", fontWeight:"bold", fontSize:"25px"}}
                        id="modal-modal-youTubeId" variant="h6" component="h2">
                        YouTubeId: <input id="add-song-modal-youTubeId-textfield" className='modal-textfield' type="text" value={youTubeId} onChange={handleUpdateYouTubeId} />
                    </Typography>
                    <Button
                        sx={{color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px"}} variant="outlined"
                        id="add-song-confirm-button" onClick={handleConfirmAddSong}>Save</Button>
                    <Button
                        sx={{opacity: 0.80, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px", ml:"197px"}} variant="outlined"
                        id="add-song-cancel-button" onClick={handleCancelAddSong}>Cancel</Button>
                </div>
            </Box>
        </Modal>
    );
}
