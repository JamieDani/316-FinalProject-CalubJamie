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

addSong = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    const body = req.body;
    console.log("addSong body:", JSON.stringify(body));

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Song',
        });
    }

    db.addSong(body.title, body.artist, body.year, body.youTubeId, body.ownerUsername, body.ownerEmail)
        .then(song => res.status(201).json({ success: true, song }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Song Not Created!'
        }));
};

getSongs = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    const filters = {
        title: req.query.title,
        artist: req.query.artist,
        year: req.query.year
    };

    console.log("getSongs filters:", JSON.stringify(filters));

    db.getSongs(filters)
        .then(songs => res.status(200).json({ success: true, songs }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Error retrieving songs'
        }));
};

updateSong = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    const body = req.body;
    console.log("updateSong body:", JSON.stringify(body));

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    db.updateSong(req.params.id, body)
        .then(song => res.status(200).json({ success: true, song }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Song not updated!'
        }));
};

deleteSong = async (req, res) => {
    if (auth.verifyUser(req) === null) {
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
    }

    console.log("deleteSong with id:", req.params.id);

    db.deleteSong(req.params.id)
        .then(() => res.status(200).json({ success: true, message: 'Song deleted successfully' }))
        .catch(err => res.status(400).json({
            success: false,
            errorMessage: err.message || 'Song not deleted!'
        }));
};

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist,
    addSong,
    getSongs,
    updateSong,
    deleteSong
}