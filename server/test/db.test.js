import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
import MongoManager from '../db/mongodb/MongoManager';
import PostgresManager from '../db/postgresql/PostgresManager';
//import { db } from '../models/mongodb/user-model';
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose')

const resetMongo = require("./data/mongo/index")
const resetSequelize = require("./data/postgre/reset-instance")

/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
let db;
const dbType = process.env.DB_TYPE || 'mongodb';
beforeAll(async () => {
    if (dbType === 'mongodb') {
        db = new MongoManager();
    } else if (dbType === 'postgresql') {
        db = new PostgresManager()
        const sequelize = await db.initialize()
        await resetSequelize(sequelize);
    } else {
        throw new Error(`Unsupported DB type: ${dbType}`);
    }
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
afterAll(() => {
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) Reading a User from the Database', async () => {
    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        firstName: "Sam",
        lastName: "Altman",
        email: "sam@openai.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu"
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = await db.getUserByEmail("sam@openai.com")

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName).toEqual(actualUser.firstName);
    expect(expectedUser.lastName).toEqual(actualUser.lastName);
    expect(expectedUser.email).toEqual(actualUser.email);
    expect(expectedUser.passwordHash).toEqual(actualUser.passwordHash);
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #2) Creating a User in the Database', async () => {
    // MAKE A TEST USER TO CREATE IN THE DATABASE
    const expectedUser = {
        firstName: "Peter",
        lastName: "Thiel",
        email: "pete@palintir.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu"
    };

    await db.createUser(expectedUser.firstName, expectedUser.lastName, expectedUser.email, expectedUser.passwordHash)

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = await db.getUserByEmail(expectedUser.email)

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName).toEqual(actualUser.firstName);
    expect(expectedUser.lastName).toEqual(actualUser.lastName);
    expect(expectedUser.email).toEqual(actualUser.email);
    expect(expectedUser.passwordHash).toEqual(actualUser.passwordHash);
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #3) Creating a Playlist in the Database', async () => {
    
    await db.createUser("Jeff", "Bezos", "jeff@bezos.com", "aaaaaaaa");
    const user = await db.getUserByEmail("jeff@bezos.com")

    const songs = [
        {
            "title": "Across the Universe",
            "artist": "The Beatles",
            "year": 1969,
            "youTubeId": "90M60PzmxEE"
        },
        {
            "title": "Astronomy Domine",
            "artist": "Pink Floyd",
            "year": 1967,
            "youTubeId": "8UbNbor3OqQ"
        },
        {
            "title": "Black Hole Sun",
            "artist": "Soundgarden",
            "year": 1994,
            "youTubeId": "3mbBbFH9fAg"
        }
    ]

    const expectedPlaylist = {
        ownerEmail: "jeff@bezos.com",
        name: "Jef's Jam",
        songs: songs
    }

    const newPlaylist = await db.createPlaylist(db.getUserId(user), expectedPlaylist.name, expectedPlaylist.ownerEmail, expectedPlaylist.songs)
    const actualPlaylist = await db.getPlaylistById(db.getUserId(user), db.getPlaylistId(newPlaylist))

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(actualPlaylist.ownerEmail).toEqual(expectedPlaylist.ownerEmail);
    expect(actualPlaylist.name).toEqual(expectedPlaylist.name);
    actualPlaylist.songs.forEach((songDoc, idx) => {
        const song = songs[idx];
        expect(songDoc.title).toEqual(song.title);
        expect(songDoc.artist).toEqual(song.artist);
        expect(songDoc.year).toEqual(song.year);
        expect(songDoc.youTubeId).toEqual(song.youTubeId);
    });
})
test('Test #4) Deleting a Playlist in the Database', async () => {
    await db.createUser("Mark", "Zuckerberg", "mark@zuckerberg.com", "aaaaaaaa");
    const user = await db.getUserByEmail("mark@zuckerberg.com");
    
    const songs = [
      { title: "Across the Universe", artist: "The Beatles", year: 1969, youTubeId: "90M60PzmxEE" },
      { title: "Astronomy Domine", artist: "Pink Floyd", year: 1967, youTubeId: "8UbNbor3OqQ" },
      { title: "Black Hole Sun", artist: "Soundgarden", year: 1994, youTubeId: "3mbBbFH9fAg" }
    ];
  
    const newPlaylist = await db.createPlaylist(
      db.getUserId(user),
      "Mark's Music",
      "mark@zuckerberg.com",
      songs
    );
  
    const playlistId = db.getPlaylistId(newPlaylist);
    console.log("Created playlist:", playlistId.toString());
  
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
    
    const updatedUser = await db.getUserByEmail("mark@zuckerberg.com");
    const userPlaylists = await db.getPlaylists();
    const playlistStillExists = userPlaylists.some(p => db.getPlaylistId(p) === playlistId);
    expect(playlistStillExists).toBe(false);
  });

/**
 * Vitest test to see if the Database Manager can update a Playlist
 */
test('Test #5) Updating a Playlist in the Database', async () => {
    await db.createUser("Elon", "Musk", "elon@tesla.com", "password123");
    const user = await db.getUserByEmail("elon@tesla.com");
  
    const initialSongs = [
      { title: "Space Oddity", artist: "David Bowie", year: 1969, youTubeId: "iYYRH4apXDo" },
      { title: "Rocket Man", artist: "Elton John", year: 1972, youTubeId: "DtVBCG6ThDk" }
    ];
  
    const playlist = await db.createPlaylist(
        db.getUserId(user),
        "Elon's Playlist",
        user.email,
        initialSongs
    );
    
    const updatedData = {
      playlist: {
        name: "Elon's Updated Playlist",
        songs: [
          { title: "Life on Mars?", artist: "David Bowie", year: 1971, youTubeId: "AZKcl4-tcuo" },
          { title: "Don’t Stop Me Now", artist: "Queen", year: 1978, youTubeId: "HgzGwKwLmgM" }
        ]
      }
    };
  
    await db.updatePlaylist(db.getUserId(user), db.getPlaylistId(playlist), updatedData);
  
    const actualPlaylist = await db.getPlaylistById(db.getUserId(user), db.getPlaylistId(playlist));
  
    expect(actualPlaylist.name).toEqual(updatedData.playlist.name);
    actualPlaylist.songs.forEach((songDoc, idx) => {
        const song = updatedData.playlist.songs[idx];
        expect(songDoc.title).toEqual(song.title);
        expect(songDoc.artist).toEqual(song.artist);
        expect(songDoc.year).toEqual(song.year);
        expect(songDoc.youTubeId).toEqual(song.youTubeId);
    });
  });

  test('Test #6) getPlaylistById fetches the correct playlist', async () => {
    await db.createUser("Tim", "Cook", "tim@cook.com", "password123");
    const user = await db.getUserByEmail("tim@cook.com");

    const songs = [
        { title: "Life on Mars?", artist: "David Bowie", year: 1971, youTubeId: "AZKcl4-tcuo" },
        { title: "Don’t Stop Me Now", artist: "Queen", year: 1978, youTubeId: "HgzGwKwLmgM" }
    ];
    const playlistName = "Apple Music";
    const newPlaylist = await db.createPlaylist(db.getUserId(user), playlistName, user.email, songs);

    const playlistId = db.getPlaylistId(newPlaylist).toString();

    const fetchedPlaylist = await db.getPlaylistById(db.getUserId(user), playlistId);

    expect(fetchedPlaylist).not.toBeNull();
    expect(db.getPlaylistId(fetchedPlaylist).toString()).toEqual(playlistId);
    expect(fetchedPlaylist.name).toEqual(playlistName);
    expect(fetchedPlaylist.ownerEmail).toEqual(user.email);
    expect(fetchedPlaylist.songs.length).toEqual(songs.length);
    fetchedPlaylist.songs.forEach((songDoc, idx) => {
        const song = songs[idx];
        expect(songDoc.title).toEqual(song.title);
        expect(songDoc.artist).toEqual(song.artist);
        expect(songDoc.year).toEqual(song.year);
        expect(songDoc.youTubeId).toEqual(song.youTubeId);
    });
});

test('Test #7) getPlaylistPairs returns id-name pairs', async () => {
    await db.createUser("Jensen", "Huang", "jhuang@nvidia.com", "pass123");
    const user = await db.getUserByEmail("jhuang@nvidia.com");

    await db.createPlaylist(db.getUserId(user), "Jensen's First", user.email, []);
    await db.createPlaylist(db.getUserId(user), "Jensen's Second", user.email, []);

    const pairs = await db.getPlaylistPairs(db.getUserId(user));

    expect(pairs).toBeInstanceOf(Array);
    expect(pairs.length).toBe(2);
    expect(pairs[0]).toHaveProperty("_id");
    expect(pairs[0]).toHaveProperty("name");
    expect(pairs.map(p => p.name)).toEqual(expect.arrayContaining(["Jensen's First", "Jensen's Second"]));
});


test('Test #8) getPlaylists returns all playlists', async () => {
    await db.createUser("Lucy", "Guo", "lucy@guo.com", "funny123");
    const user = await db.getUserByEmail("lucy@guo.com");

    await db.createPlaylist(db.getUserId(user), "Scale AI", user.email, []);
    await db.createPlaylist(db.getUserId(user), "Passes", user.email, []);

    const playlists = await db.getPlaylists();

    expect(playlists).toBeInstanceOf(Array);
    expect(playlists.length).toBeGreaterThanOrEqual(2); // Should at least include the ones we added
    expect(playlists.map(p => p.name)).toEqual(expect.arrayContaining(["Scale AI", "Passes"]));
});

