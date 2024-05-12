## Installation

To run this project locally, follow these steps:

1. Install dependencies using `npm install`

2. Setup the database by creating below table

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlistName VARCHAR(255) NOT NULL
);

CREATE TABLE playlist_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlistId INT,
    songId VARCHAR(255) NOT NULL,
    songName VARCHAR(255) NOT NULL,
    previewUrl VARCHAR(255) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    artistName VARCHAR(255) NOT NULL,
    FOREIGN KEY (playlistId) REFERENCES playlists(id)
);

CREATE TABLE IF NOT EXISTS custom_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    songName VARCHAR(255) NOT NULL,
    artistName VARCHAR(255) NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    songUrl VARCHAR(255) NOT NULL
);

3. update .env file and add below code and replace the username and password with your credentials.

MYSQL_HOST=127.0.0.1
MYSQL_USERNAME=username
MYSQL_PASSWORD=password
MYSQL_DATABASE=cs612_music_mingle.

4. Now start the app. `npm start`


