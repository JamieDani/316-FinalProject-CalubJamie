const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: { type: DataTypes.STRING, field: 'first_name' },
        lastName: { type: DataTypes.STRING, field: 'last_name' },
        email: { type: DataTypes.STRING, unique: true },
        passwordHash: { type: DataTypes.STRING, field: 'password_hash' },
    });

    return User;
};
