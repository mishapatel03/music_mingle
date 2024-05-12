import React, { useContext, useEffect, useState } from "react";
import Card from "./Card";
import { MusicContext } from "../Context";
import { BackendUrl } from "../constants";

function LikedMusic({ handleContentChange, handleFolderPlusClick }) {
  const musicContext = useContext(MusicContext);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  useEffect(() => {
    loadFavoriteSongs();
  }, []);

  const handleFolderClickChange = (element) => {
    let data = element;
    if (element.songName) {
      data = convertToNewFormat(element);
    }
    handleFolderPlusClick(data);
  }

  const loadFavoriteSongs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch(`${BackendUrl}/api/favorite-songs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to load favorite songs');
        return;
      }

      const data = await response.json();

      setFavoriteSongs(data.favoriteSongs);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleFavClickChange = (element) => {
    let data = element;
    if (element.songName) {
      data = convertToNewFormat(element);
    }
    handleContentChange(data);
  }

  const convertToNewFormat = (song) => {
    const newFormat = {
      id: song.id.toString(),
      name: song.songName,
      preview_url: song.songUrl,
      album: {
        images: [
          {
            url: song.imageUrl
          }
        ],
        artists: [
          {
            name: song.artistName
          }
        ]
      }
    };
    return newFormat;
  }

  return (
    <div>
      {favoriteSongs.length === 0 ? (
        <div className="col" style={{ marginTop: '10%' }}>
          <h3 className="py-5 text-center color-common">
            You don't have any favorite music!
          </h3>
          <div className="text-center color-common">
            <i className="bi bi-emoji-frown fs-1"></i>{" "}
          </div>
        </div>
      ) : null}

      <div className="container">
        <div className="row">
          {favoriteSongs.map((element, index) => {
            return <Card onFolderPlusClick={() => handleFolderClickChange(element)}
              onButtonClick={() => handleContentChange(element)} key={element.id} element={element} loadFavoriteSongs={loadFavoriteSongs} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default LikedMusic;
