const MongoManager = require('../db/mongodb/MongoManager');
const testPlaylists = require('../test/data/test-playlists.json');
const fs = require('fs');
const path = require('path');

async function resetPlaylists() {
    console.log('Starting playlist reset...');

    const db = new MongoManager();
    await db.initialize();
    console.log('Connected to database');

    const User = require('../models/mongodb/user-model');
    const Playlist = require('../models/mongodb/playlist-model');
    const Song = require('../models/mongodb/song-model');

    const deletePlaylistResult = await Playlist.deleteMany({});
    console.log(`Deleted ${deletePlaylistResult.deletedCount} existing playlists`);

    const deleteSongResult = await Song.deleteMany({});
    console.log(`Deleted ${deleteSongResult.deletedCount} existing songs`);

    await User.updateMany({}, { $set: { playlists: [] } });
    console.log('Reset all user playlist arrays');

    const totalPlaylists = testPlaylists.playlists.length;
    let successCount = 0;
    let errorCount = 0;

    console.log(`\nProcessing ${totalPlaylists} playlists...\n`);

    const songCache = new Map(); 

    const failedPlaylists = [];

    for (let i = 0; i < testPlaylists.playlists.length; i++) {
        const playlistData = testPlaylists.playlists[i];

        try {
            const user = await User.findOne({ email: playlistData.ownerEmail });
            if (!user) {
                console.error(`User not found for email: ${playlistData.ownerEmail}`);
                errorCount++;
                continue;
            }

            const playlist = await db.createPlaylist(user._id, playlistData.ownerEmail);
            const playlistId = db.getPlaylistId(playlist);

            await db.updatePlaylist(user._id, playlistId, {
                playlist: { name: playlistData.name }
            });

            for (const songData of playlistData.songs) {
                const normalizedTitle = songData.title.trim().toLowerCase();
                const normalizedArtist = songData.artist.trim().toLowerCase();
                const cacheKey = `${normalizedTitle}-${normalizedArtist}-${songData.year}`;

                let songId;

                if (songCache.has(cacheKey)) {
                    songId = songCache.get(cacheKey);
                } else {
                    const existingSong = await Song.findOne({
                        title: { $regex: new RegExp(`^${songData.title.trim()}$`, 'i') },
                        artist: { $regex: new RegExp(`^${songData.artist.trim()}$`, 'i') },
                        year: songData.year
                    });

                    if (existingSong) {
                        songId = existingSong._id;
                    } else {
                        const newSong = await db.addSong(
                            songData.title.trim(),
                            songData.artist.trim(),
                            songData.year,
                            songData.youTubeId,
                            user.username,
                            playlistData.ownerEmail
                        );
                        songId = newSong._id;
                    }

                    songCache.set(cacheKey, songId);
                }

                await db.addSongToPlaylist(user._id, playlistId, songId, -1);
            }

            successCount++;

            if ((i + 1) % 20 === 0 || (i + 1) === totalPlaylists) {
                console.log(`Progress: ${i + 1} / ${totalPlaylists} playlists complete`);
            }

        } catch (error) {
            errorCount++;
            console.error(`Failed to create playlist "${playlistData.name}":`, error.message);

            failedPlaylists.push({
                playlistIndex: i,
                playlistName: playlistData.name,
                ownerEmail: playlistData.ownerEmail,
                songCount: playlistData.songs ? playlistData.songs.length : 0,
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                },
                timestamp: new Date().toISOString(),
                playlistData: playlistData
            });
        }
    }

    if (failedPlaylists.length > 0) {
        const failedPlaylistsPath = path.join(__dirname, '../test/data/failed-playlists.json');
        const failedPlaylistsOutput = {
            totalFailed: failedPlaylists.length,
            generatedAt: new Date().toISOString(),
            failures: failedPlaylists
        };

        fs.writeFileSync(
            failedPlaylistsPath,
            JSON.stringify(failedPlaylistsOutput, null, 2),
            'utf-8'
        );
        console.log(`\nSaved ${failedPlaylists.length} failed playlists to: test/data/failed-playlists.json`);
    }

    console.log('\nSummary:');
    console.log(`   Total playlists in file: ${totalPlaylists}`);
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Unique songs in cache: ${songCache.size}`);

    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    console.log('Playlist reset complete!');
}

resetPlaylists()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
