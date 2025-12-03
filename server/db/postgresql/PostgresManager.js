const DatabaseManager = require("../DatabaseManager");

function generatePlaylistId() {
    // 24-character hex string
    return [...Array(24)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
}

class PostgresManager extends DatabaseManager {
    constructor(sequelizeInstance = null) {
        super();
        this.sequelize = sequelizeInstance;
        this.User = null;
        this.Playlist = null;
    }

    async initialize() {
        if (!this.sequelize) {
            const { Sequelize } = require('sequelize');
            const dotenv = require('dotenv');
            dotenv.config();

            this.sequelize = new Sequelize(process.env.DB_CONNECT, {
                dialect: 'postgres',
                logging: false,
            });
        }

        const UserModel = require('../../models/postgresql/user-model');
        const PlaylistModel = require('../../models/postgresql/playlist-model');

        this.User = UserModel(this.sequelize);
        this.Playlist = PlaylistModel(this.sequelize, this.User);

        this.User.hasMany(this.Playlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
        this.Playlist.belongsTo(this.User, { foreignKey: 'userId' });

        await this.sequelize.sync({ alter: false });

        return this.sequelize;
    }
      

    getUserId(user) {
        return user.id
    }

    getPlaylistId(playlist) {
        return playlist.id
    }

    createUser(firstName, lastName, email, passwordHash) {
        return this.User.create({ firstName, lastName, email, passwordHash });
    }

    async getUserById(userId) {
        return await this.User.findByPk(userId);
    }

    async getUserByEmail(email) {
        return await this.User.findOne({ where: { email } });
    }

    async createPlaylist(userId, name, ownerEmail, songs) {
        try {
            const user = await this.User.findByPk(userId);
            if (!user) {
                throw new Error("user not found");
            }
    
            const id = generatePlaylistId()
            const playlist = await this.Playlist.create({
                id,
                name,
                ownerEmail,
                songs,
                userId: user.id
            });
    
            console.log("playlist created: ", playlist.toJSON());
    
            return playlist;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async deletePlaylist(userId, playlistId) {
        try {
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error("playlist not found");
            }
            console.log("playlist found: ", playlist.toJSON());
    
            const user = await this.User.findOne({ where: { email: playlist.ownerEmail } });
            if (!user) {
                throw new Error("user not found");
            }
    
            if (user.id !== userId) {
                throw new Error("authentication error");
            }
            console.log("correct user!");
    
            await this.Playlist.destroy({ where: { id: playlistId } });
    
            return;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getPlaylistById(userId, playlistId) {
        try {
            console.log(`finding playlist... ${playlistId}`)
            const playlist = await this.Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error("playlist not found");
            }
    
            const user = await this.getUserById(userId);
            if (!user) {
                throw new Error("user not found");
            }
    
            if (user.id !== userId) {
                throw new Error("authentication error");
            }
    
            return playlist;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getPlaylistPairs(userId) {
        try {
            const user = await this.User.findByPk(userId);
            if (!user) throw new Error("user not found");
    
            const playlists = await this.Playlist.findAll({
                where: { ownerEmail: user.email }
            });
    
            if (!playlists) {
                throw new Error("no playlists found");
            }
    
            const pairs = playlists.map(list => ({
                _id: list.id,
                name: list.name
            }));
    
            return pairs;
        } catch (err) {
            throw err;
        }
    }

    async getPlaylists() {
        try {
            const playlists = await this.Playlist.findAll();
    
            if (!playlists) {
                throw new Error("no playlists found");
            }
    
            return playlists;
        } catch (err) {
            throw err;
        }
    }

    async updatePlaylist(userId, playlistId, updatedData) {
        try {
            console.log(`calling get playlist by id ${playlistId}`)
            let playlist = null;
            try {
                playlist = await this.getPlaylistById(userId, playlistId);
            } catch(err) {
                playlist = await this.getPlaylistById(userId, updatedData.playlist.id);
            }
            if (!playlist) throw new Error("playlist not found by id");
    
            const owner = await this.User.findOne({ where: { email: playlist.ownerEmail } });
            if (!owner) throw new Error("user not found");
    
            if (owner.id !== userId) {
                throw new Error("authentication error");
            }
    
            if (updatedData.playlist?.name !== undefined) {
                playlist.name = updatedData.playlist.name;
            }
    
            if (updatedData.playlist?.songs !== undefined) {
                playlist.songs = updatedData.playlist.songs;
            }
    
            await playlist.save();
    
            return playlist;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
}

module.exports = PostgresManager;

