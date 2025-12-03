const Playlist = require('../models/mongodb/playlist-model')
const User = require('../models/mongodb/user-model');

const auth = require('../auth')
const db = require('../db')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }

    db.createPlaylist(req.userId, body.name, body.ownerEmail, body.songs)
    .then(playlist => res.status(201).json({ playlist }))
    .catch(err => res.status(400).json({ errorMessage: err.message || 'Playlist Not Created!' }));

}

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    
    db.deletePlaylist(req.userId, req.params.id)
    .then(() => res.status(200).json({ success: true, message: "Playlist deleted successfully" }))
    .catch(err => res.status(400).json({ errorMessage: err.message || 'Playlist Not Deleted!' }));
}

getPlaylistById = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    console.log("Find Playlist with id:", req.params.id);

    db.getPlaylistById(req.userId, req.params.id)
        .then(playlist => res.status(200).json({ success: true, playlist }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Error retrieving playlist'
        }));
};

getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");

    db.getPlaylistPairs(req.userId)
        .then(pairs => res.status(200).json({ success: true, idNamePairs: pairs }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Error retrieving playlist pairs'
        }));
}
getPlaylists = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    console.log("getPlaylists");

    db.getPlaylists()
        .then(playlists => res.status(200).json({ success: true, data: playlists }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Error retrieving playlists'
        }));
};

updatePlaylist = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    console.log("updatePlaylist body:", JSON.stringify(body));

    db.updatePlaylist(req.userId, req.params.id, body)
        .then(updated => res.status(200).json({
            success: true,
            id: updated._id,
            message: 'Playlist updated!',
        }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Playlist not updated!'
        }));
};

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}