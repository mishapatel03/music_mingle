import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import { MusicContext } from '../Context';
import { initializePlaylist } from '../initialize';
import Card from '../components/Card';
import { Footer } from '../components/Footer';
import { faEdit, faFolderPlus, faHeart, faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomUpload from './customUpload';
import Playlist from './playlist';
import LikedMusic from '../components/LikedMusic';
import Loader from '../components/loader';
import Modal from 'react-bootstrap/Modal';
import { BackendUrl } from '../constants';

export const Home = () => {
    const [keyword, setKeyword] = useState("");
    const [message, setMessage] = useState("");
    const [tracks, setTracks] = useState([]);
    const [token, setToken] = useState(null);
    const [currentMusic, setCurrMusic] = useState({});
    const [currMusicIndex, setCurrMusicIndex] = useState(0);
    const location = useLocation();
    const [activeNavItem, setActiveNavItem] = useState('home');
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const musicContext = useContext(MusicContext);
    const setLikedMusic = musicContext.setLikedMusic;
    const setpinnedMusic = musicContext.setPinnedMusic;
    const resultOffset = musicContext.resultOffset;
    const setResultOffset = musicContext.setResultOffset;
    const [playListname, setPlayListName] = useState([]);
    const [currrentSongSelected, setCurrentSongSelected] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isPlayMusic, setPlayMusic] = useState(false);

    useEffect(() => {
        if (location?.pathname === '/') {
            setActiveNavItem('home')
        } else if (location?.pathname === '/favorite') {
            setActiveNavItem('favorites');
        } else if (location?.pathname === '/playlist') {
            setActiveNavItem('playlist');
        } else if (location?.pathname === '/upload') {
            setActiveNavItem('uploads')
        }
    }, []);

    useEffect(() => {
        fetchMusicData();
    }, [resultOffset])

    const fetchPlaylistBySong = async (id) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage

            const requestOptions = {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                redirect: "follow"
            };

            const response = await fetch(`${BackendUrl}/api/playlists/availability/${id}`, requestOptions);
            const data = await response.json();
            setPlayListName(data.playlists);
        } catch (error) {
            console.error("Error fetching songs by playlist ID:", error);
            throw error;
        }
    }

    const handleFolderPlusClick = (item) => {
        setShowPopup(true);
        setCurrentSongSelected(item);
        fetchPlaylistBySong(item.id);
    };

    const fetchMusicData = async (key) => {
        setTracks([]);
        window.scrollTo(0, 0);
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${keyword || "bts"}&type=track&offset=${resultOffset}`,
                {
                    headers: {
                        Authorization: `Bearer ${key || token}`,
                    },
                }
            );
            if (!response.ok) {
                return;
            }
            const jsonData = await response.json();
            setTracks(jsonData.tracks.items);
            if (jsonData.tracks.items && jsonData.tracks.items.length) {
                setCurrMusic(jsonData.tracks.items[0]);
            }

        } catch (error) {
            setMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            setResultOffset(0);
            fetchMusicData();
        }
    };

    const handleContentChange = (newContent, index) => {
        setCurrMusic(newContent);
        setCurrMusicIndex(index);
        setPlayMusic(true);
    };

    useEffect(() => {
        initializePlaylist();
        const fetchToken = async () => {
            try {
                const response = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: "grant_type=client_credentials&client_id=a77073181b7d48eb90003e3bb94ff88a&client_secret=68790982a0554d1a83427e061e371507",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch token");
                }

                const jsonData = await response.json();
                setToken(jsonData.access_token);
                fetchMusicData(jsonData.access_token);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchToken();
        setLikedMusic(JSON.parse(localStorage.getItem("likedMusic")));
        setpinnedMusic(JSON.parse(localStorage.getItem("pinnedMusic")));

    }, [setIsLoading, setLikedMusic, setpinnedMusic]);

    const onChangeSidebar = (tab) => {
        setActiveNavItem(tab);
        if (tab === 'home') {
            navigate('/');
        } else if (tab === 'favorites') {
            navigate('/favorite');
        } else if (tab === 'playlist') {
            navigate('/playlist');
        } else if (tab === 'uploads') {
            navigate('/upload');
        }
    }

    const addToPlayList = async (item) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage

            const params = {
                "song": {
                    "id": currrentSongSelected.id,
                    "name": currrentSongSelected.name,
                    "preview_url": currrentSongSelected.preview_url,
                    "album": {
                        "images": [
                            {
                                "url": currrentSongSelected?.album?.images[0]?.url
                            }
                        ],
                        "artists": [
                            {
                                "name": currrentSongSelected?.album?.artists[0]?.name
                            }
                        ]
                    }
                }
            }

            // Set up request headers with the token
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${BackendUrl}/api/playlists/${item.id}/add-song`, {
                method: "POST",
                body: JSON.stringify(params),
                headers: headers
            });

            if (response.ok) {
                fetchPlaylistBySong(currrentSongSelected.id);
            }
        } catch (error) {
            console.error("Error fetching playlists", error);
            throw error;
        }
    }


    return (
        <React.Fragment>
            <Navbar
                keyword={keyword}
                setKeyword={setKeyword}
                handleKeyPress={handleKeyPress}
                fetchMusicData={fetchMusicData}
            />
            <Loader loading={isLoading} />
            <div className="container container-p m-0 outer-lay">
                <div className="row">
                    <div className="col-md-2 sidebar">
                        <div className="sidebar">
                            <div onClick={() => onChangeSidebar('home')} className={`sidebar-common ${activeNavItem === 'home' ? 'active' : ''}`}><FontAwesomeIcon icon={faHome} /> <span className='ml-2 p-2'>Home</span></div>
                            <div onClick={() => onChangeSidebar('favorites')} className={`sidebar-common ${activeNavItem === 'favorites' ? 'active' : ''}`} ><FontAwesomeIcon icon={faHeart} /> <span className='ml-2 p-2'>Favorites</span></div>
                            <div onClick={() => onChangeSidebar('playlist')} className={`sidebar-common ${activeNavItem === 'playlist' ? 'active' : ''}`}><FontAwesomeIcon icon={faFolderPlus} /> <span className='ml-2 p-2'>Playlist</span></div>
                            <div onClick={() => onChangeSidebar('uploads')} className={`sidebar-common ${activeNavItem === 'uploads' ? 'active' : ''}`}><FontAwesomeIcon icon={faEdit} /> <span className='ml-2 p-2'>Customs</span></div>
                        </div>
                    </div>
                    {activeNavItem === 'home' && <div className="col-md-9 home-items">
                        <div className={`row ${isLoading ? "" : "d-none"}`}>
                            <div className="col-12 py-5 text-center">
                                <div
                                    className="spinner-border"
                                    style={{ width: "3rem", height: "3rem" }}
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            {tracks.map((element, index) => {
                                return <Card onFolderPlusClick={handleFolderPlusClick} onButtonClick={() => handleContentChange(element, index)} key={element.id} element={element} />;
                            })}
                        </div>
                        <div className="row" hidden={tracks.length === 0}>
                            <div className="col">
                                <button
                                    onClick={() => {
                                        setPlayMusic(false);
                                        setResultOffset((previous) => previous - 20);
                                    }}
                                    className="btn btn-outline-light w-100"
                                    disabled={resultOffset === 0}
                                >
                                    Previous Next Page: {resultOffset / 20}
                                </button>
                            </div>
                            <div className="col">
                                <button
                                    onClick={() => {
                                        setPlayMusic(false);
                                        setResultOffset((previous) => previous + 20);
                                    }}
                                    className="btn btn-outline-light w-100"
                                >
                                    Next Page: {resultOffset / 20 + 2}
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <h4 className="text-center text-danger py-2">{message}</h4>
                            </div>
                        </div>
                    </div>}

                    {activeNavItem === 'favorites' &&
                        <div className="col-md-9">
                            <LikedMusic handleFolderPlusClick={handleFolderPlusClick} handleContentChange={handleContentChange} />
                        </div>}

                    {activeNavItem === 'playlist' &&
                        <div className="col-md-9"><Playlist handleContentChange={handleContentChange} /></div>
                    }

                    {activeNavItem === 'uploads' &&
                        <div className="col-md-9">
                            <CustomUpload handleFolderPlusClick={handleFolderPlusClick} handleContentChange={handleContentChange} />
                        </div>}
                </div></div>


            <Modal show={showPopup} onHide={() => setShowPopup(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add to Playlist
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='row'>
                        {playListname && playListname.map((item, key) => {
                            return (
                                <div className='mt-2' key={key}>
                                    <div className='bg-trans-ppl d-flex align-items-center justify-content-between'>
                                        <div className="d-flex align-items-center">
                                            <img width={50} height={50} src='https://media.istockphoto.com/id/1362829608/vector/music-notes-isolated-vector-illustration.jpg?s=612x612&w=0&k=20&c=NJB6lI60iQRN8tneYfnl8FCGknOyMf6ocD1eiBl_Ers=' />
                                            <span className='ml-2'>{item.playlistName}</span>
                                        </div>
                                        {item.isSongAvailable ? (<i className="bi bi-check2 p-2"></i>) : (<i className="bi bi-plus-circle p-2 cursor-pointer" onClick={() => addToPlayList(item)}></i>)
                                        }
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Modal.Body>
            </Modal>
            <Footer setCurrMusic={setCurrMusic}
                setCurrMusicIndex={setCurrMusicIndex}
                currMusicIndex={currMusicIndex}
                currentMusic={currentMusic}
                isPlayMusic={isPlayMusic}
                tracks={tracks} />
        </React.Fragment>
    )
}
