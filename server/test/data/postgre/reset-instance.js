const UserModel = require("../../../models/postgresql/user-model");
const PlaylistModel = require("../../../models/postgresql/playlist-model");

async function resetSequelize(sequelize) {
    const testData = require("../example-db-data.json");

    const User = UserModel(sequelize);
    const Playlist = PlaylistModel(sequelize, User);

    User.hasMany(Playlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Playlist.belongsTo(User, { foreignKey: 'userId' });

    async function clearTable(model, modelName) {
        try {
            await model.destroy({ where: {} });
            console.log(`${modelName} cleared`);
        } catch (err) {
            console.log(err);
        }
    }

    async function insertUsers(userData) {
        for (const user of userData) {
            await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash,
                playlists: user.playlists || []
            });
        }
        console.log('Users inserted');
    }

    async function insertPlaylists(playlistData) {
        for (const playlist of playlistData) {
            await Playlist.create({
                id: playlist._id,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs || []
            });
        }
        console.log('Playlists inserted');
    }

    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL via Sequelize');
        console.log("Resetting the Postgres");

        await clearTable(Playlist, "Playlists");
        await clearTable(User, "Users");

        await insertUsers(testData.users);
        await insertPlaylists(testData.playlists);

        console.log('Reset complete');
    } catch (error) {
        console.error('Error during reset:', error.message);
    }
}

module.exports = resetSequelize;
