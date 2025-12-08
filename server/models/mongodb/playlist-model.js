const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

/*
    This is where we specify the format of the data we're going to put into
    the database.
    
    @author McKilla Gorilla
*/

const playlistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerUsername: { type: String, required: false },  // will be looked up from user via ownerEmail
        ownerEmail: { type: String, required: true },
        songs: [{type: ObjectId, ref: 'Song'}],
        listenerList: [{ type: String }],
        numListeners: { type: Number, default: 0 },
        lastAccessed: { type: Date, default: Date.now }
    },
    { timestamps: true },
)

module.exports = mongoose.model('Playlist', playlistSchema)
