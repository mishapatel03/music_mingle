import express from 'express';
import { login, register } from '../controller/userAuth.js';
import { addSongToPlayList, createNewPlaylist, getAllPlaylist, getAllPlaylistBySongId, getSongsByPlaylistId, removeSongFromPlayList } from '../controller/playlist.js';
import { addFavoriteSong, getAllCustomSongs, getFavoriteSongs, removeFavoriteSong, uploadCustomSong } from '../controller/customUpload.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token == null) return res.status(401).json({ message: 'Unauthorized' });
    token = req.headers['authorization'].split(' ')[1];

    jwt.verify(token, 'bf80b6c614347fca6b4d7b16b547d0b5fb08e43a8496d45bf45ec545d77c81c4', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.userId = decoded.userId;
        next();
    });
};

// Auth Routes
router.post('/api/login', login);
router.post('/api/register', register);

router.use(authenticateToken);

// Playlist Routes
router.post('/api/playlists', createNewPlaylist);
router.post('/api/playlists/:playlistId/add-song', addSongToPlayList);
router.get('/api/playlists', getAllPlaylist);
router.get('/api/playlists/:playlistId/songs', getSongsByPlaylistId);

router.get('/api/playlists/availability/:songId', getAllPlaylistBySongId);
router.delete('/api/playlists/:playlistId/removesong/:songId', removeSongFromPlayList);

// Custom song routes
router.post('/api/custom-songs', uploadCustomSong);
router.get('/api/custom-songs', getAllCustomSongs)

// Favorite songs routes
router.post('/api/favorite-songs', addFavoriteSong);
router.get('/api/favorite-songs', getFavoriteSongs);
router.delete('/api/favorite-songs/:songId', removeFavoriteSong);


export default router;
