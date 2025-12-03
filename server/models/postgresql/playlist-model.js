const { DataTypes } = require('sequelize');

module.exports = (sequelize, User) => {
    const Playlist = sequelize.define('Playlist', {
        id: {
            type: DataTypes.STRING(24),
            primaryKey: true,
        },
        name: DataTypes.STRING,
        ownerEmail: { type: DataTypes.STRING, field: 'owner_email' },
        songs: DataTypes.JSONB,
    });

    User.hasMany(Playlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Playlist.belongsTo(User, { foreignKey: 'userId' });

    return Playlist;
};
