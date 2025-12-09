import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
import MongoManager from '../db/mongodb/MongoManager';

/**
 * Executed once before all tests are performed.
 */
let db;
beforeAll(async () => {
    db = new MongoManager();
    await db.initialize();
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) Reading a User from the Database', async () => {
    // Create a user first
    const expectedUser = {
        username: "samaltman",
        email: "sam@openai.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        profilePicture: null
    };

    await db.createUser(expectedUser.username, expectedUser.email, expectedUser.passwordHash, expectedUser.profilePicture);

    // Read the user back
    const actualUser = await db.getUserByEmail("sam@openai.com");

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.username).toEqual(actualUser.username);
    expect(expectedUser.email).toEqual(actualUser.email);
    expect(expectedUser.passwordHash).toEqual(actualUser.passwordHash);
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #2) Creating a User in the Database', async () => {
    // MAKE A TEST USER TO CREATE IN THE DATABASE
    const expectedUser = {
        username: "peterthiel",
        email: "pete@palintir.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        profilePicture: null
    };

    await db.createUser(expectedUser.username, expectedUser.email, expectedUser.passwordHash, expectedUser.profilePicture);

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = await db.getUserByEmail(expectedUser.email);

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.username).toEqual(actualUser.username);
    expect(expectedUser.email).toEqual(actualUser.email);
    expect(expectedUser.passwordHash).toEqual(actualUser.passwordHash);
});

/**
 * Vitest test to see if the Database Manager can create a Playlist
 */
test('Test #3) Creating a Playlist in the Database', async () => {

    await db.createUser("jeffbezos", "jeff@bezos.com", "aaaaaaaa", null);
    const user = await db.getUserByEmail("jeff@bezos.com");

    // Create some songs first
    const song1 = await db.addSong("Across the Universe", "The Beatles", 1969, "90M60PzmxEE", "jeffbezos", "jeff@bezos.com");
    const song2 = await db.addSong("Astronomy Domine", "Pink Floyd", 1967, "8UbNbor3OqQ", "jeffbezos", "jeff@bezos.com");
    const song3 = await db.addSong("Black Hole Sun", "Soundgarden", 1994, "3mbBbFH9fAg", "jeffbezos", "jeff@bezos.com");

    // Create playlist (auto-generates name as "Untitled0")
    const newPlaylist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(newPlaylist);

    // Add songs to the playlist
    await db.addSongToPlaylist(db.getUserId(user), playlistId, song1._id, -1);
    await db.addSongToPlaylist(db.getUserId(user), playlistId, song2._id, -1);
    await db.addSongToPlaylist(db.getUserId(user), playlistId, song3._id, -1);

    // Update the playlist name
    await db.updatePlaylist(db.getUserId(user), playlistId, { playlist: { name: "Jeff's Jam" } });

    const actualPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);

    // COMPARE THE VALUES
    expect(actualPlaylist.ownerEmail).toEqual(user.email);
    expect(actualPlaylist.name).toEqual("Jeff's Jam");
    expect(actualPlaylist.songs.length).toBe(3);
})
test('Test #4) Deleting a Playlist in the Database', async () => {
    await db.createUser("markzuck", "mark@zuckerberg.com", "aaaaaaaa", null);
    const user = await db.getUserByEmail("mark@zuckerberg.com");

    const newPlaylist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(newPlaylist);

    // Rename the playlist
    await db.updatePlaylist(db.getUserId(user), playlistId, { playlist: { name: "Mark's Music" } });

    const foundPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(foundPlaylist).not.toBeNull();
    expect(foundPlaylist.name).toBe("Mark's Music");

    await db.deletePlaylist(db.getUserId(user), playlistId);

    let deletedError = null;
    try {
        await db.getPlaylistById(db.getUserId(user), playlistId);
    } catch (err) {
        deletedError = err;
    }
    expect(deletedError).not.toBeNull();
    expect(deletedError.message).toBe("playlist not found");
});

/**
 * Vitest test to see if the Database Manager can update a Playlist
 */
test('Test #5) Updating a Playlist in the Database', async () => {
    await db.createUser("elonmusk", "elon@tesla.com", "password123", null);
    const user = await db.getUserByEmail("elon@tesla.com");

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    // Create songs
    const song1 = await db.addSong("Life on Mars?", "David Bowie", 1971, "AZKcl4-tcuo", "elonmusk", "elon@tesla.com");
    const song2 = await db.addSong("Don't Stop Me Now", "Queen", 1978, "HgzGwKwLmgM", "elonmusk", "elon@tesla.com");

    const updatedData = {
        playlist: {
            name: "Elon's Updated Playlist",
            songs: [song1._id, song2._id]
        }
    };

    await db.updatePlaylist(db.getUserId(user), playlistId, updatedData);

    const actualPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);

    expect(actualPlaylist.name).toEqual(updatedData.playlist.name);
    expect(actualPlaylist.songs.length).toBe(2);
});

test('Test #6) getPlaylistById fetches the correct playlist', async () => {
    await db.createUser("timcook", "tim@cook.com", "password123", null);
    const user = await db.getUserByEmail("tim@cook.com");

    const playlistName = "Apple Music";
    const newPlaylist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(newPlaylist).toString();

    await db.updatePlaylist(db.getUserId(user), playlistId, { playlist: { name: playlistName } });

    const fetchedPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);

    expect(fetchedPlaylist).not.toBeNull();
    expect(db.getPlaylistId(fetchedPlaylist).toString()).toEqual(playlistId);
    expect(fetchedPlaylist.name).toEqual(playlistName);
    expect(fetchedPlaylist.ownerEmail).toEqual(user.email);
});

test('Test #7) getPlaylistPairs returns id-name pairs', async () => {
    await db.createUser("jensenhuang", "jhuang@nvidia.com", "pass123", null);
    const user = await db.getUserByEmail("jhuang@nvidia.com");

    const playlist1 = await db.createPlaylist(db.getUserId(user), user.email);
    const playlist2 = await db.createPlaylist(db.getUserId(user), user.email);

    await db.updatePlaylist(db.getUserId(user), db.getPlaylistId(playlist1), { playlist: { name: "Jensen's First" } });
    await db.updatePlaylist(db.getUserId(user), db.getPlaylistId(playlist2), { playlist: { name: "Jensen's Second" } });

    const pairs = await db.getPlaylistPairs(db.getUserId(user));

    expect(pairs).toBeInstanceOf(Array);
    expect(pairs.length).toBeGreaterThanOrEqual(2);
    expect(pairs[0]).toHaveProperty("_id");
    expect(pairs[0]).toHaveProperty("name");
    expect(pairs.map(p => p.name)).toEqual(expect.arrayContaining(["Jensen's First", "Jensen's Second"]));
});


test('Test #8) getPlaylists returns all playlists', async () => {
    await db.createUser("lucyguo", "lucy@guo.com", "funny123", null);
    const user = await db.getUserByEmail("lucy@guo.com");

    const playlist1 = await db.createPlaylist(db.getUserId(user), user.email);
    const playlist2 = await db.createPlaylist(db.getUserId(user), user.email);

    await db.updatePlaylist(db.getUserId(user), db.getPlaylistId(playlist1), { playlist: { name: "Scale AI" } });
    await db.updatePlaylist(db.getUserId(user), db.getPlaylistId(playlist2), { playlist: { name: "Passes" } });

    const playlists = await db.getPlaylists();

    expect(playlists).toBeInstanceOf(Array);
    expect(playlists.length).toBeGreaterThanOrEqual(2);
    expect(playlists.map(p => p.name)).toEqual(expect.arrayContaining(["Scale AI", "Passes"]));
});

test('Test #9) addSong adds a new song to the database', async () => {
    const songData = {
        title: "Bohemian Rhapsody",
        artist: "Queen",
        year: 1975,
        youTubeId: "fJ9rUzIMcZQ",
        ownerUsername: "testuser",
        ownerEmail: "test@example.com"
    };

    const newSong = await db.addSong(
        songData.title,
        songData.artist,
        songData.year,
        songData.youTubeId,
        songData.ownerUsername,
        songData.ownerEmail
    );

    expect(newSong).not.toBeNull();
    expect(newSong.title).toBe(songData.title);
    expect(newSong.artist).toBe(songData.artist);
    expect(newSong.year).toBe(songData.year);
    expect(newSong.youTubeId).toBe(songData.youTubeId);
    expect(newSong.ownerEmail).toBe(songData.ownerEmail);
});

test('Test #10) getSongs retrieves songs with filters', async () => {
    await db.addSong("Stairway to Heaven", "Led Zeppelin", 1971, "QkF3JBuS4BA", "user1", "user1@example.com");
    await db.addSong("Hotel California", "Eagles", 1977, "09839DpTctU", "user2", "user2@example.com");

    const allSongs = await db.getSongs({});
    expect(allSongs).toBeInstanceOf(Array);
    expect(allSongs.length).toBeGreaterThanOrEqual(2);

    const filteredByArtist = await db.getSongs({ artist: "Led Zeppelin" });
    expect(filteredByArtist.length).toBeGreaterThanOrEqual(1);
    expect(filteredByArtist[0].artist).toBe("Led Zeppelin");

    const filteredByYear = await db.getSongs({ year: 1977 });
    expect(filteredByYear.length).toBeGreaterThanOrEqual(1);
    expect(filteredByYear.some(s => s.year === 1977)).toBe(true);
});

test('Test #11) updateSong updates song details', async () => {
    const song = await db.addSong("Original Title", "Original Artist", 2000, "abc123", "user", "user@example.com");
    const songId = db.getSongId ? db.getSongId(song) : song._id;

    const updates = {
        title: "Updated Title",
        artist: "Updated Artist",
        year: 2001
    };

    const updatedSong = await db.updateSong(songId, updates);
    expect(updatedSong.title).toBe(updates.title);
    expect(updatedSong.artist).toBe(updates.artist);
    expect(updatedSong.year).toBe(updates.year);
});

test('Test #12) deleteSong removes a song from the database', async () => {
    const song = await db.addSong("To Be Deleted", "Test Artist", 2020, "xyz789", "user", "user@example.com");
    const songId = db.getSongId ? db.getSongId(song) : song._id;

    await db.deleteSong(songId);

    const songs = await db.getSongs({ title: "To Be Deleted" });
    expect(songs.length).toBe(0);
});

test('Test #13) copySong creates a copy of an existing song', async () => {
    const originalSong = await db.addSong("Original Song", "Artist", 2020, "orig123", "user1", "user1@example.com");
    const originalId = db.getSongId ? db.getSongId(originalSong) : originalSong._id;

    const copiedSong = await db.copySong(originalId, "user2", "user2@example.com");

    expect(copiedSong).not.toBeNull();
    expect(copiedSong.title).toBe(originalSong.title);
    expect(copiedSong.artist).toBe(originalSong.artist);
    expect(copiedSong.year).toBe(originalSong.year);
    expect(copiedSong.youTubeId).toBe(originalSong.youTubeId);
    expect(copiedSong.ownerEmail).toBe("user2@example.com");
});

test('Test #14) incrementSongListens increases listen count', async () => {
    const song = await db.addSong("Popular Song", "Artist", 2020, "pop123", "user", "user@example.com");
    const songId = db.getSongId ? db.getSongId(song) : song._id;

    const updatedSong1 = await db.incrementSongListens(songId);
    expect(updatedSong1.numListens).toBe(1);

    const updatedSong2 = await db.incrementSongListens(songId);
    expect(updatedSong2.numListens).toBe(2);
});

test('Test #15) addSongToPlaylist adds a song to a playlist', async () => {
    await db.createUser("playlistowner", "playlist@owner.com", "pass123", null);
    const user = await db.getUserByEmail("playlist@owner.com");

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    const song = await db.addSong("New Song", "Artist", 2020, "new123", "user", "user@example.com");
    const songId = db.getSongId ? db.getSongId(song) : song._id;

    await db.addSongToPlaylist(db.getUserId(user), playlistId, songId, -1);

    const updatedPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(updatedPlaylist.songs.length).toBe(1);
    expect(updatedPlaylist.songs[0]._id.toString()).toBe(songId.toString());
});

test('Test #16) removeSongFromPlaylist removes a song from a playlist', async () => {
    await db.createUser("removetest", "remove@test.com", "pass123", null);
    const user = await db.getUserByEmail("remove@test.com");

    const song = await db.addSong("Song to Remove", "Artist", 2020, "rem123", "removetest", "remove@test.com");
    const songId = db.getSongId ? db.getSongId(song) : song._id;

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    // Add the song to the playlist
    await db.addSongToPlaylist(db.getUserId(user), playlistId, songId, -1);

    const playlistBefore = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(playlistBefore.songs.length).toBe(1);

    await db.removeSongFromPlaylist(db.getUserId(user), playlistId, songId);

    const playlistAfter = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(playlistAfter.songs.length).toBe(0);
});

test('Test #17) getSongsOfPlaylist retrieves all songs in a playlist', async () => {
    await db.createUser("songsuser", "songs@user.com", "pass123", null);
    const user = await db.getUserByEmail("songs@user.com");

    const song1 = await db.addSong("Song 1", "Artist 1", 2020, "s1", "songsuser", "songs@user.com");
    const song2 = await db.addSong("Song 2", "Artist 2", 2021, "s2", "songsuser", "songs@user.com");

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    await db.addSongToPlaylist(db.getUserId(user), playlistId, song1._id, -1);
    await db.addSongToPlaylist(db.getUserId(user), playlistId, song2._id, -1);

    const retrievedSongs = await db.getSongsOfPlaylist(playlistId);
    expect(retrievedSongs).toBeInstanceOf(Array);
    expect(retrievedSongs.length).toBe(2);
    expect(retrievedSongs[0].title).toBe("Song 1");
    expect(retrievedSongs[1].title).toBe("Song 2");
});

test('Test #18) copyPlaylist creates a copy of an existing playlist', async () => {
    await db.createUser("copyuser", "copy@user.com", "pass123", null);
    const user = await db.getUserByEmail("copy@user.com");

    const song = await db.addSong("Song A", "Artist A", 2020, "sa", "copyuser", "copy@user.com");

    const originalPlaylist = await db.createPlaylist(db.getUserId(user), user.email);
    const originalId = db.getPlaylistId(originalPlaylist);

    await db.updatePlaylist(db.getUserId(user), originalId, { playlist: { name: "Original Playlist" } });
    await db.addSongToPlaylist(db.getUserId(user), originalId, song._id, -1);

    const copiedPlaylist = await db.copyPlaylist(db.getUserId(user), originalId);
    const copiedId = db.getPlaylistId(copiedPlaylist);

    expect(copiedPlaylist).not.toBeNull();
    expect(copiedPlaylist.name).toContain("Original Playlist");
    expect(copiedId.toString()).not.toBe(originalId.toString());
    expect(copiedPlaylist.songs.length).toBe(1);
});

test('Test #19) trackPlaylistListener adds unique listeners', async () => {
    await db.createUser("listeneruser", "listener@user.com", "pass123", null);
    const user = await db.getUserByEmail("listener@user.com");

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    await db.trackPlaylistListener(playlistId, "listener1@example.com");
    await db.trackPlaylistListener(playlistId, "listener2@example.com");
    await db.trackPlaylistListener(playlistId, "listener1@example.com"); // Duplicate

    const updatedPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(updatedPlaylist.numListeners).toBe(2); // Should only count unique listeners
});

test('Test #20) updatePlaylistLastAccessed updates the timestamp', async () => {
    await db.createUser("accessuser", "access@user.com", "pass123", null);
    const user = await db.getUserByEmail("access@user.com");

    const playlist = await db.createPlaylist(db.getUserId(user), user.email);
    const playlistId = db.getPlaylistId(playlist);

    const originalPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);
    const originalTime = originalPlaylist.lastAccessed;

    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms

    await db.updatePlaylistLastAccessed(playlistId);

    const updatedPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);
    expect(updatedPlaylist.lastAccessed).not.toBe(originalTime);
    expect(new Date(updatedPlaylist.lastAccessed).getTime()).toBeGreaterThan(new Date(originalTime).getTime());
});

test('Test #21) getUserProfilePictureByEmail retrieves user profile picture', async () => {
    await db.createUser("profileuser", "profile@user.com", "pass123", null);

    const profilePicture = await db.getUserProfilePictureByEmail("profile@user.com");

    // Profile picture should be null since we created user with null profilePicture
    expect(profilePicture).toBeNull();
});

