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
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.get('/playlist/:id', auth.verify, StoreController.getPlaylistById)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)
router.get('/playlists', auth.verify, StoreController.getPlaylists)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.put('/playlist/:id/add-song', auth.verify, StoreController.addSongToPlaylist)
router.post('/song', auth.verify, StoreController.addSong)
router.get('/songs', auth.verify, StoreController.getSongs)
router.put('/song/:id', auth.verify, StoreController.updateSong)
router.delete('/song/:id', auth.verify, StoreController.deleteSong)

module.exports = router