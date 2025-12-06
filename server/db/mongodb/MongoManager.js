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
    async createPlaylist(userId, ownerUsername, ownerEmail) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error("user not found");

            const existingPlaylists = await Playlist.find({ ownerEmail: ownerEmail });
            const untitledCount = existingPlaylists.filter(p => p.name.startsWith("Untitled")).length;
            const playlistName = `Untitled${untitledCount}`;

            const playlist = new Playlist({
                name: playlistName,
                ownerUsername: ownerUsername,
                ownerEmail: ownerEmail,
                songs: []
            });

            await playlist.save();

            user.playlists.push(playlist._id);
            await user.save();

            return playlist;
        } catch (err) {
            throw err;
        }
    }

    async copyPlaylist(userId, playlistId) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error("user not found");

            const originalPlaylist = await Playlist.findById(playlistId);
            if (!originalPlaylist) throw new Error("playlist not found");

            const newPlaylist = new Playlist({
                name: `${originalPlaylist.name} copy`,
                ownerUsername: user.username,
                ownerEmail: user.email,
                songs: [...originalPlaylist.songs]
            });

            await newPlaylist.save();

            user.playlists.push(newPlaylist._id);
            await user.save();

            return newPlaylist;
        } catch (err) {
            throw err;
        }
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
                name: list.name,
                ownerEmail: list.ownerEmail,
                ownerUsername: list.ownerUsername
            }));

            return pairs;
        } catch (err) {
            throw err;
        }
    }
    

    async getPlaylists(filters = {}) {
        try {
            const query = {};

            if (filters.name) {
                query.name = { $regex: filters.name, $options: 'i' };
            }

            if (filters.username) {
                query.ownerUsername = { $regex: filters.username, $options: 'i' };
            }

            const songFilters = [];

            if (filters.songTitle) {
                songFilters.push({ title: { $regex: filters.songTitle, $options: 'i' } });
            }
            if (filters.songArtist) {
                songFilters.push({ artist: { $regex: filters.songArtist, $options: 'i' } });
            }
            if (filters.songYear) {
                songFilters.push({ year: parseInt(filters.songYear) });
            }

            if (songFilters.length > 0) {
                const playlistIdSets = await Promise.all(
                    songFilters.map(async (songFilter) => {
                        const matchingSongs = await Song.find(songFilter);
                        const songIds = matchingSongs.map(song => song._id);
                        const playlists = await Playlist.find({
                            songs: { $in: songIds }
                        });
                        return new Set(playlists.map(p => p._id.toString()));
                    })
                );

                let intersection = playlistIdSets[0];
                for (let i = 1; i < playlistIdSets.length; i++) {
                    intersection = new Set([...intersection].filter(id => playlistIdSets[i].has(id)));
                }

                if (intersection.size === 0) {
                    return [];
                }

                query._id = { $in: Array.from(intersection) };
            }

            const playlists = await Playlist.find(query);
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

    async addSongToPlaylist(userId, playlistId, songId) {
        try {
            const playlist = await Playlist.findById(playlistId);
            if (!playlist) throw new Error("playlist not found");

            const owner = await User.findOne({ email: playlist.ownerEmail });
            if (!owner) throw new Error("user not found");

            if (owner._id.toString() !== userId.toString()) {
                throw new Error("authentication error");
            }

            if (!playlist.songs.includes(songId)) {
                playlist.songs.push(songId);
                await playlist.save();
            }

            return playlist;
        } catch (err) {
            throw err;
        }
    }

    async removeSongFromPlaylist(userId, playlistId, songId) {
        try {
            const playlist = await Playlist.findById(playlistId);
            if (!playlist) throw new Error("playlist not found");

            const owner = await User.findOne({ email: playlist.ownerEmail });
            if (!owner) throw new Error("user not found");

            if (owner._id.toString() !== userId.toString()) {
                throw new Error("authentication error");
            }

            playlist.songs = playlist.songs.filter(id => id.toString() !== songId.toString());
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

    async getSongsOfPlaylist(playlistId) {
        try {
            const playlist = await Playlist.findById(playlistId);
            if (!playlist) throw new Error("playlist not found");

            const songs = await Song.find({ _id: { $in: playlist.songs } });

            const songMap = {};
            songs.forEach(song => {
                songMap[song._id.toString()] = song;
            });

            const orderedSongs = playlist.songs.map(songId => songMap[songId.toString()]).filter(song => song !== undefined);

            return orderedSongs;
        } catch (err) {
            console.error("Error in MongoManager getSongsOfPlaylist:", err);
            throw err;
        }
    }

    async getUserProfilePictureByEmail(email) {
        try {
            const user = await User.findOne({ email: email });
            if (!user) throw new Error("user not found");
            return user.profilePicture || null;
        } catch (err) {
            console.error("Error in MongoManager getUserProfilePictureByEmail:", err);
            throw err;
        }
    }


}

module.exports = MongoManager;

