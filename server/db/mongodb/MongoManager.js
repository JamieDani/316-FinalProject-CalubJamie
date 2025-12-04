const DatabaseManager = require("../DatabaseManager");
const User = require('../../models/mongodb/user-model')
const Playlist = require('../../models/mongodb/playlist-model')
const Song = require('../../models/mongodb/song-model')

const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config();

class MongoManager extends DatabaseManager {

    async initialize() {
        mongoose
            .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
            .catch(e => {
                console.error('Connection error', e.message)
            })

        return mongoose.connection
    }

    getUserId(user) {
        return user._id
    }

    getPlaylistId(playlist) {
        return playlist._id
    }

    async createUser(username, email, passwordHash, profilePicture) {
        const newUser = new User({username, email, passwordHash, profilePicture});
        await newUser.save();
        return newUser
    }

    async getUserById(userId) {
        return await User.findOne({ _id: userId })
    }

    async getUserByEmail(email) {
        return await User.findOne({ email: email })
    }

    async updateUser(userId, username, email, passwordHash, profilePicture) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error("user not found");

            if (username !== undefined) user.username = username;
            if (email !== undefined) user.email = email;
            if (passwordHash !== undefined) user.passwordHash = passwordHash;
            if (profilePicture !== undefined) user.profilePicture = profilePicture;

            await user.save();
            return user;
        } catch (err) {
            throw err;
        }
    }

    // returns playlist on success and null on failure
    createPlaylist(userId, name, ownerEmail, songs) {
        return new Promise((resolve, reject) => {
            const playlist = new Playlist({
                name: name,
                ownerEmail: ownerEmail,
                songs: songs
            });

            console.log("playlist: " + playlist.toString());
            if (!playlist) { return reject(new Error("invalid playlist object")); }

            User.findOne({ _id: userId }, (err, user) => {
                if (err) { return reject(err) }
                if (!user) { return reject(new Error("user not found")) }
                console.log("user found: " + JSON.stringify(user));
                user.playlists.push(playlist._id);
                user
                    .save()
                    .then(() => {
                        playlist
                            .save()
                            .then(() => {
                                resolve(playlist)
                            }).catch(err => reject(err))
                    }).catch(err => reject(err));
            })
        })
    }

    async deletePlaylist(userId, playlistId) {
        try {
          const playlist = await Playlist.findById(playlistId);
          if (!playlist) throw new Error("playlist not found");
      
          const owner = await User.findOne({ email: playlist.ownerEmail });
          if (!owner) throw new Error("user not found");
      
          if (owner._id.toString() !== userId.toString()) {
            throw new Error("authentication error");
          }
      
          await Playlist.findByIdAndDelete(playlistId);
      
          owner.playlists = owner.playlists.filter(p => p.toString() !== playlistId.toString());
          await owner.save();
      
          return;
        } catch (err) {
          throw err;
        }
      }

    getPlaylistById(userId, playlistId) {
        return new Promise((resolve, reject) => {
            Playlist.findById({ _id: playlistId }, (err, list) => {
                if (err || !list) {
                    return reject(new Error("playlist not found"));
                }
    
                User.findOne({ email: list.ownerEmail }, (err, user) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!user) {
                        return reject(new Error("user not found"));
                    }
    
                    if (user._id.toString() === userId.toString()) {
                        return resolve(list);
                    } else {
                        return reject(new Error("authentication error"));
                    }
                });
            });
        });
    }
    

    async getPlaylistPairs(userId) {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) throw new Error("user not found");
    
            const playlists = await Playlist.find({ ownerEmail: user.email });
            if (!playlists) {
                throw new Error("no playlists found");
            }
    
            const pairs = playlists.map(list => ({
                _id: list._id,
                name: list.name
            }));
    
            return pairs;
        } catch (err) {
            throw err;
        }
    }
    

    async getPlaylists() {
        try {
            const playlists = await Playlist.find({});
    
            if (!playlists || playlists.length === 0) {
                throw new Error("no playlists found");
            }
    
            return playlists;
        } catch (err) {
            throw err;
        }
    }

    async updatePlaylist(userId, playlistId, updatedData) {
        try {
            const playlist = await Playlist.findById(playlistId);
            if (!playlist) throw new Error("playlist not found");

            const owner = await User.findOne({ email: playlist.ownerEmail });
            if (!owner) throw new Error("user not found");

            if (owner._id.toString() !== userId.toString()) {
                throw new Error("authentication error");
            }

            if (updatedData.playlist?.name !== undefined)
                playlist.name = updatedData.playlist.name;

            if (updatedData.playlist?.songs !== undefined)
                playlist.songs = updatedData.playlist.songs;

            await playlist.save();

            return playlist;
        } catch (err) {
            throw err;
        }
    }

    async addSong(title, artist, year, youTubeId, ownerUsername, ownerEmail) {
        try {
            console.log("MongoManager addSong called");
            const newSong = new Song({
                title,
                artist,
                year,
                youTubeId,
                ownerUsername,
                ownerEmail,
                numPlaylists: 0,
                numListeners: 0
            });
            console.log("New song object created:", newSong);
            await newSong.save();
            console.log("Song saved successfully:", newSong);
            return newSong;
        } catch (err) {
            console.error("Error in MongoManager addSong:", err);
            throw err;
        }
    }

    async getSongs(filters = {}) {
        try {
            const query = {};

            if (filters.title) {
                query.title = { $regex: filters.title, $options: 'i' };
            }
            if (filters.artist) query.artist = filters.artist;
            if (filters.year) query.year = parseInt(filters.year);

            const songs = await Song.find(query);
            return songs;
        } catch (err) {
            console.error("Error in MongoManager getSongs:", err);
            throw err;
        }
    }

    async updateSong(songId, updatedData) {
        try {
            const song = await Song.findById(songId);
            if (!song) throw new Error("song not found");

            if (updatedData.title !== undefined) song.title = updatedData.title;
            if (updatedData.artist !== undefined) song.artist = updatedData.artist;
            if (updatedData.year !== undefined) song.year = updatedData.year;
            if (updatedData.youTubeId !== undefined) song.youTubeId = updatedData.youTubeId;

            await song.save();
            return song;
        } catch (err) {
            console.error("Error in MongoManager updateSong:", err);
            throw err;
        }
    }

    async deleteSong(songId) {
        try {
            const song = await Song.findByIdAndDelete(songId);
            if (!song) throw new Error("song not found");
            return;
        } catch (err) {
            console.error("Error in MongoManager deleteSong:", err);
            throw err;
        }
    }


}

module.exports = MongoManager;

