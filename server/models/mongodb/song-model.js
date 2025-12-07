const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const songSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    youTubeId: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    numPlaylists: { type: Number, required: true },
    numListens: { type: Number, required: true }
});

module.exports = mongoose.model('Song', songSchema)
