const EventEmitter = require('events');

class DatabaseManager extends EventEmitter {

    initialize() {
        throw new Error("initialize() not implemented")
    }

    createUser(firstName, lastName, email, passwordHash) {

    }

    async getUserById(userId) {

    }

    getUserByEmail(email) {

    }

    createPlaylist(userId, name, ownerEmail, songs) {

    }

    deletePlaylist(userId, playlistId) {

    }

    getPlaylistbyId(userId, playlistId) {

    }

    async getPlaylistPairs(userId) {

    }

    getPlaylists(userId) {

    }

    updatePlaylist(userId, name, songs) {

    }
    
}

module.exports = DatabaseManager;

