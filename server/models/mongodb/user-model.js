const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        profilePicture: { type: String, required: false },
        playlists: [{type: ObjectId, ref: 'Playlist'}]
    },
    { timestamps: true },
)

module.exports = mongoose.model('User', UserSchema)
