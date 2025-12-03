const mongoose = require('mongoose')
const Schema = mongoose.Schema
/*
    This is where we specify the format of the data we're going to put into
    the database.
    
    @author McKilla Gorilla
*/

const songSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    youTubeId: { type: String, required: true }
}, { _id: false });

const playlistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: [songSchema]
    },
    { timestamps: true },
)

module.exports = mongoose.model('Playlist', playlistSchema)
