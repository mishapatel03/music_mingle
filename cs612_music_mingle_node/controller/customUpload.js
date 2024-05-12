import connection from '../db/index.js';

export const uploadCustomSong = (req, res) => {
    const { songName, artistName, imageUrl, songUrl } = req.body;
    const userId = req.userId; // Extract user ID from the JWT token

    if (!songName || !artistName || !songUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Insert custom song into the database
    connection.query('INSERT INTO custom_songs (songName, artistName, imageUrl, songUrl, userId) VALUES (?, ?, ?, ?, ?)',
        [songName, artistName, imageUrl, songUrl, userId],
        (err, result) => {
            if (err) {
                console.error("Error inserting custom song:", err);
                return res.status(500).json({ error: "Error inserting custom song" });
            }
            res.status(201).json({ message: "Custom song uploaded successfully", id: result.insertId });
        }
    );
};

export const getAllCustomSongs = (req, res) => {
    const userId = req.userId; // Extract user ID from the JWT token

    connection.query('SELECT * FROM custom_songs WHERE userId = ?', [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching custom songs:", err);
            return res.status(500).json({ error: "Error fetching custom songs" });
        }
        res.status(200).json({ customSongs: rows });
    });
};

export const addFavoriteSong = (req, res) => {
    const { id, name, preview_url, album } = req.body;
    const userId = req.userId;

    const songData = {
        songId: id,
        songName: name,
        previewUrl: preview_url,
        imageUrl: album.images[0].url,
        artistName: album.artists[0].name
    };

    connection.query('INSERT INTO favorite_songs (userId, songId, songName, previewUrl, imageUrl, artistName) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, songData.songId, songData.songName, songData.previewUrl, songData.imageUrl, songData.artistName],
        (err, result) => {
            if (err) {
                res.status(500).json({ message: 'Error adding favorite song' });
            } else {
                res.status(200).json({ success: true, message: 'Song added to favorites' });
            }
        });
};

export const getFavoriteSongs = (req, res) => {
    const userId = req.userId;

    connection.query('SELECT * FROM favorite_songs WHERE userId = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error getting favorite songs' });
        } else {
            const formattedSongs = results.map(song => ({
                id: song.songId,
                name: song.songName,
                preview_url: song.previewUrl,
                album: {
                    images: [{ url: song.imageUrl }],
                    artists: [{ name: song.artistName }]
                }
            }));
            res.status(200).json({ success: true, favoriteSongs: formattedSongs });
        }
    });
};


export const removeFavoriteSong = (req, res) => {
    const { songId } = req.params;
    const userId = req.userId;

    connection.query('DELETE FROM favorite_songs WHERE userId = ? AND songId = ?', [userId, songId], (err, result) => {
        if (err) {
            res.status(500).json({ message: 'Error removing favorite song' });
        } else {
            res.status(200).json({ success: true, message: 'Song removed from favorites' });
        }
    });
};

