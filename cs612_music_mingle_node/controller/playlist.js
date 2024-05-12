import connection from '../db/index.js';

export const createNewPlaylist = (req, res) => {
    const { playlistName } = req.body;
    const userId = req.userId; // Extract user ID from the JWT token

    if (!playlistName) {
        res.status(400).json({ error: "Playlist name is required" });
    } else {
        // Using parameterized queries to prevent SQL injection
        connection.query('SELECT * FROM playlists WHERE playlistName = ? AND userId = ?', [playlistName, userId], (err, result) => {
            if (err) {
                res.status(500).json({ error: "Error checking playlist existence" });
            } else {
                if (result.length > 0) {
                    res.status(400).json({ error: "Playlist name already exists" });
                } else {
                    // Create a new playlist
                    connection.query('INSERT INTO playlists (playlistName, userId) VALUES (?, ?)', [playlistName, userId], (err, result) => {
                        if (err) {
                            res.status(500).json({ error: "Error creating new playlist" });
                        } else {
                            res.status(200).json({ message: "Playlist created successfully" });
                        }
                    });
                }
            }
        });
    }
};

export const addSongToPlayList = (req, res) => {
    const playlistId = req.params.playlistId;
    const song = req.body.song;
    const userId = req.userId; // Extract user ID from the JWT token

    // Extract song details
    const songId = song.id;
    const songName = song.name;
    const previewUrl = song.preview_url;
    const imageUrl = song.album.images[0].url;
    const artistName = song.album.artists[0].name;

    // Check if the playlist belongs to the user
    connection.query('SELECT * FROM playlists WHERE id = ? AND userId = ?', [playlistId, userId], (err, playlists) => {
        if (err) {
            console.error("Error checking playlist ownership:", err);
            res.status(500).json({ error: "Error adding song to playlist" });
        } else {
            if (playlists.length === 0) {
                res.status(403).json({ error: "You don't have permission to add songs to this playlist" });
            } else {
                // Insert the song into the playlist
                connection.query('INSERT INTO playlist_songs (playlistId, songId, songName, previewUrl, imageUrl, artistName) VALUES (?, ?, ?, ?, ?, ?)',
                    [playlistId, songId, songName, previewUrl, imageUrl, artistName], (err, result) => {
                        if (err) {
                            console.error("Error adding song to playlist:", err);
                            res.status(500).json({ error: "Error adding song to playlist" });
                        } else {
                            res.status(200).json({ message: "Song added to playlist successfully" });
                        }
                    });
            }
        }
    });
};


export const getAllPlaylist = (req, res) => {
    const userId = req.userId; // Extract user ID from the JWT token

    connection.query('SELECT * FROM playlists WHERE userId = ?', [userId], (err, playlistsResult) => {
        if (err) {
            console.error("Error fetching playlists:", err);
            res.status(500).json({ error: "Error fetching playlists" });
        } else {
            const playlists = playlistsResult.map(playlist => {
                return {
                    id: playlist.id,
                    playlistName: playlist.playlistName,
                    songs: []
                };
            });

            // Fetch songs for each playlist
            let promises = playlists.map(playlist => {
                return new Promise((resolve, reject) => {
                    connection.query('SELECT * FROM playlist_songs WHERE playlistId = ?', [playlist.id], (err, songsResult) => {
                        if (err) {
                            console.error("Error fetching songs for playlist:", err);
                            reject(err);
                        } else {
                            playlist.songs = songsResult.map(song => {
                                return {
                                    songId: song.songId,
                                    name: song.songName,
                                    preview_url: song.previewUrl,
                                    album: {
                                        images: [{ url: song.imageUrl }],
                                        artists: [{ name: song.artistName }]
                                    }
                                };
                            });
                            resolve();
                        }
                    });
                });
            });

            // Wait for all promises to resolve
            Promise.all(promises)
                .then(() => {
                    res.status(200).json({ playlists: playlists });
                })
                .catch(() => {
                    res.status(500).json({ error: "Error fetching playlist songs" });
                });
        }
    });
};


export const getAllPlaylistBySongId = async (req, res) => {
    try {
        const songId = req.params.songId;
        const userId = req.userId; // Extract user ID from the JWT token

        // Query to get all playlists and mark availability of the song
        const query = `
            SELECT playlists.id, playlists.playlistName,
                CASE WHEN COUNT(playlist_songs.id) > 0 THEN true ELSE false END AS isSongAvailable
            FROM playlists
            LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlistId AND playlist_songs.songId = ?
            WHERE playlists.userId = ?
            GROUP BY playlists.id, playlists.playlistName;
        `;

        connection.query(query, [songId, userId], (err, results) => {
            if (err) {
                console.error("Error fetching playlists:", err);
                res.status(500).json({ error: "Error fetching playlists" });
            } else {
                res.status(200).json({ playlists: results });
            }
        });
    } catch (error) {
        console.error("Error fetching playlists by song ID:", error);
        res.status(500).json({ error: "Error fetching playlists by song ID" });
    }
};

export const removeSongFromPlayList = (req, res) => {
    const playlistId = req.params.playlistId;
    const songId = req.params.songId;
    const userId = req.userId; // Extract user ID from the JWT token

    // Check if the playlist belongs to the user
    connection.query('SELECT * FROM playlists WHERE id = ? AND userId = ?', [playlistId, userId], (err, playlists) => {
        if (err) {
            console.error("Error checking playlist ownership:", err);
            res.status(500).json({ error: "Error removing song from playlist" });
        } else {
            if (playlists.length === 0) {
                res.status(403).json({ error: "You don't have permission to remove songs from this playlist" });
            } else {
                // Query to delete the song from the playlist
                const query = 'DELETE FROM playlist_songs WHERE playlistId = ? AND songId = ?';

                connection.query(query, [playlistId, songId], (err, result) => {
                    if (err) {
                        console.error("Error removing song from playlist:", err);
                        res.status(500).json({ error: "Error removing song from playlist" });
                    } else {
                        if (result.affectedRows > 0) {
                            res.status(200).json({ message: "Song removed from playlist successfully" });
                        } else {
                            res.status(404).json({ error: "Song not found in playlist" });
                        }
                    }
                });
            }
        }
    });
};


export const getSongsByPlaylistId = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const userId = req.userId; // Extract user ID from the JWT token

        // Check if the playlist belongs to the user
        const playlist = await getPlaylistByIdFromDB(playlistId, userId);
        if (!playlist) {
            return res.status(403).json({ error: "You don't have permission to access this playlist" });
        }

        // Get songs by playlist ID from the database
        const songs = await getSongsByPlaylistIdFromDB(playlistId);

        // Send the songs as a JSON response
        res.status(200).json({ songs });
    } catch (error) {
        console.error("Error fetching songs by playlist ID:", error);
        res.status(500).json({ error: "Error fetching songs by playlist ID" });
    }
};

// Helper function to get playlist by ID and user ID
const getPlaylistByIdFromDB = (playlistId, userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM playlists WHERE id = ? AND userId = ?', [playlistId, userId], (err, playlists) => {
            if (err) {
                reject(err);
            } else {
                if (playlists.length === 0) {
                    resolve(null); // Playlist doesn't exist or doesn't belong to the user
                } else {
                    resolve(playlists[0]); // Return the playlist
                }
            }
        });
    });
};

// Helper function to get songs by playlist ID
const getSongsByPlaylistIdFromDB = (playlistId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM playlist_songs WHERE playlistId = ?', [playlistId], (err, songs) => {
            if (err) {
                reject(err);
            } else {
                resolve(songs);
            }
        });
    });
};





