import React, { useContext, useEffect } from "react";
import { MusicContext } from "../Context";
import { BackendUrl } from "../constants";

function Card({ element, onButtonClick, onFolderPlusClick, isPlaylistPage, selectedPlayList, getSongsFromPlayList, loadFavoriteSongs }) {
  const musicContext = useContext(MusicContext);
  const likedMusic = musicContext.likedMusic;
  const setlikedMusic = musicContext.setLikedMusic;

  const handleLike = async () => {
    let likedMusic = localStorage.getItem("likedMusic");
    likedMusic = JSON.parse(likedMusic);
    let updatedLikedMusic = [];
    if (likedMusic.some((item) => item.id === element.id)) {
      updatedLikedMusic = likedMusic.filter((item) => item.id !== element.id);
      setlikedMusic(updatedLikedMusic);
      localStorage.setItem("likedMusic", JSON.stringify(updatedLikedMusic));
      await deleteFavoriteSong(element.id);
      if(loadFavoriteSongs){
        await loadFavoriteSongs();
      }
    } else {
      updatedLikedMusic = likedMusic;
      updatedLikedMusic.push(element);
      setlikedMusic(updatedLikedMusic);
      localStorage.setItem("likedMusic", JSON.stringify(updatedLikedMusic));
      addFavoriteSong(element);
    }
  };

  const addFavoriteSong = async (newSong) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    let params = {};

    if (newSong.songName) {
      params = {
        "id": newSong.id,
        "name": newSong.songName,
        "preview_url": newSong.songUrl,
        "album": {
          "images": [
            {
              "url": newSong.imageUrl
            }
          ],
          "artists": [
            {
              "name": newSong.artistName
            }
          ]
        }
      }
    } else {
      params = newSong;
    }

    try {
      const response = await fetch(`${BackendUrl}/api/favorite-songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        console.error('Failed to add favorite song');
        return;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteFavoriteSong = async (songId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${BackendUrl}/api/favorite-songs/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to delete favorite song');
        return;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    const localLikedMusic = JSON.parse(localStorage.getItem("likedMusic"));
    setlikedMusic(localLikedMusic);
  }, [setlikedMusic]);

  const RemoveSongFromPlaylist = async (item) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BackendUrl}/api/playlists/${selectedPlayList.id}/removesong/${element.songId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error removing song from playlist');
      }

      const data = await response.json();
      await getSongsFromPlayList(selectedPlayList.id);
      return data;
    } catch (error) {
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  };


  return (
    <div key={element.id} className="col-lg-3 col-md-6 py-2">
      <div className="card">
        <div onClick={() => onButtonClick(element)} className="cursor-pointer ratio ratio-1x1 bg-secondary bg-opacity-25">
          <img
            src={element?.album?.images[0]?.url || element.imageUrl || 'https://thumbs.dreamstime.com/b/vector-musical-notes-music-gray-background-illustration-eps-141771086.jpg'}
            className="card-img-top"
            alt="..."
          />
        </div>
        <div className="card-body">
          <h5 className="card-title d-flex justify-content-between mb-0">
            <p className="text-elipsis">{element.name || element.songName}</p>
            <div className="add-options d-flex align-items-start">
              {isPlaylistPage ? (<button
                type="button"
                onClick={() => RemoveSongFromPlaylist(element)}
                className="btn btn-outline-dark mx-1"
              >
                <i className="bi bi-trash"></i>
              </button>) : <button
                type="button"
                onClick={() => onFolderPlusClick(element)}
                className="btn btn-outline-dark mx-1"
              >
                <i className="bi bi-folder-plus"></i>
              </button>}
              <button onClick={() => handleLike()} className={`btn btn-outline-dark ${likedMusic.some(item => item.id === element.id) ? 'text-danger' : ''}`}>
                <i className={`bi bi-heart${likedMusic.some(item => item.id === element.id) ? '-fill' : ''}`}></i>
              </button>
            </div>

          </h5>
          <p className="card-text">Artist: {element?.album?.artists[0]?.name || element.artistName}</p>
        </div>
      </div >
    </div >
  );
}

export default Card;
