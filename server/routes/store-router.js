/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/
const express = require('express')
const StoreController = require('../controllers/store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, StoreController.createPlaylist)
router.post('/playlist/:id/copy', auth.verify, StoreController.copyPlaylist)
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.get('/playlist/:id', auth.verify, StoreController.getPlaylistById)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)
router.get('/playlists', StoreController.getPlaylists)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.put('/playlist/:id/add-song', auth.verify, StoreController.addSongToPlaylist)
router.delete('/playlist/:id/song/:songId', auth.verify, StoreController.removeSongFromPlaylist)
router.get('/playlist/:id/songs', StoreController.getSongsOfPlaylist)
router.put('/playlist/:id/play', StoreController.trackPlaylistPlay)
router.post('/song', auth.verify, StoreController.addSong)
router.get('/songs', StoreController.getSongs)
router.put('/song/:id', auth.verify, StoreController.updateSong)
router.delete('/song/:id', auth.verify, StoreController.deleteSong)
router.put('/song/:id/listen', StoreController.addSongListen)
router.get('/user/profile-picture', StoreController.getUserProfilePictureByEmail)

module.exports = router