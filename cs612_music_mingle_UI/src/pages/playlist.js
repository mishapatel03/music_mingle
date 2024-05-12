import React, { useEffect, useState } from 'react'
import Card from '../components/Card';
import Loader from '../components/loader';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { BackendUrl } from '../constants';

const Playlist = ({ handleContentChange }) => {
    const [playListname, setPlayListName] = useState([]);
    const [isDetailsPlayListOpen, setDetailsPlaylistOpen] = useState(false)
    const [selectedPlayList, setSelectedPlaylist] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState({});
    const [newPlaylist, setNewPlayList] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage

            const params = {
                playlistName: newPlaylist
            }

            // Set up request headers with the token
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${BackendUrl}/api/playlists`, {
                method: "POST",
                body: JSON.stringify(params),
                headers: headers
            });

            if (response.ok) {
                await getAllPlayList();
                setNewPlayList('')
                handleClose();
            } else {
                const data = await response.json();

                console.log(data);
                if (data.error) {
                    setErrorMsg(data.error);
                }
            }
        } catch (error) {
            console.error("Error fetching playlists", error);
            throw error;
        }
    }


    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => { setShow(true); setNewPlayList(''); setErrorMsg('') };

    const getSongsFromPlayList = async (playlistId) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage

            const requestOptions = {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                redirect: "follow"
            };

            const response = await fetch(`${BackendUrl}/api/playlists/${playlistId}/songs`, requestOptions);
            const data = await response.json();
            setSelectedPlaylist(data);
            return data;
        } catch (error) {
            console.error("Error fetching songs by playlist ID:", error);
            throw error;
        }
    }


    useEffect(() => {
        getAllPlayList();
    }, [])

    const convertToNewFormat = (song) => {
        const newFormat = {
            id: song.id.toString(),
            name: song.songName,
            preview_url: song.songUrl || song.previewUrl,
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

    const playCurrentSong = (song) => {
        const data = convertToNewFormat(song);
        handleContentChange(data);
    }

    const getAllPlayList = async () => {
        try {
            setLoading(true);

            // Retrieve the token from localStorage
            const token = localStorage.getItem('token');

            // Set up request headers with the token
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Make the fetch request with the headers
            const response = await fetch(`${BackendUrl}/api/playlists`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const jsonData = await response.json();
            setLoading(false);

            if (jsonData?.playlists?.length > 0) {
                setPlayListName(jsonData.playlists);
            }

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    }

    return (
        <React.Fragment>
            <Loader loading={isLoading} />
            <div className="row">

                <div>
                    <Button variant="outline-light" className="btn btn-outline-light mx-1 mt-2 mb-2"
                        style={{ position: 'relative', left: '89%' }} onClick={handleShow}>
                        <i className="bi bi-plus-lg"></i>
                        <span className='m-2'>Create New</span>
                    </Button>
                </div>

                {!isDetailsPlayListOpen && playListname && playListname.length &&
                    playListname.map((item, key) => {
                        return (
                            <div className='mt-2' key={key}>
                                <div className='bg-trans-ppl cursor-pointer' onClick={() => {
                                    setDetailsPlaylistOpen(true);
                                    setCurrentPlaylist(item);
                                    getSongsFromPlayList(item.id);
                                }}>
                                    <img width={50} height={50}
                                        src='https://media.istockphoto.com/id/1362829608/vector/music-notes-isolated-vector-illustration.jpg?s=612x612&w=0&k=20&c=NJB6lI60iQRN8tneYfnl8FCGknOyMf6ocD1eiBl_Ers=' />
                                    <span className='ml-2 text-white'>{item.playlistName}</span>
                                </div>
                            </div>
                        )
                    })}

                {!playListname.length && (
                    <div className="col" style={{ marginTop: '10%' }}>
                        <h3 className="py-5 text-center color-common">
                            Your playlist is currently empty!
                        </h3>
                        <div className="text-center color-common">
                            <i className="bi bi-emoji-frown fs-1"></i>{" "}
                        </div>
                    </div>
                )}

                {isDetailsPlayListOpen && (
                    <React.Fragment>
                        <div className='ml-4'>
                            <div className='playlist-header'>
                                <span className='text-white cursor-pointer back-btn' onClick={() => setDetailsPlaylistOpen(false)}>
                                    <i className="bi bi-arrow-left mr-2"></i>BACK
                                </span>
                                <h1 style={{ textTransform: 'uppercase' }} className='color-common playlist-name'>
                                    {currentPlaylist?.playlistName}
                                </h1>
                            </div>

                            {selectedPlayList && (
                                <div>
                                    <div className="container">
                                        <div className="row">
                                            {selectedPlayList.songs && selectedPlayList.songs.length ? selectedPlayList.songs.map((item, index) => {
                                                return (
                                                    <Card key={index}
                                                        selectedPlayList={currentPlaylist}
                                                        getSongsFromPlayList={getSongsFromPlayList}
                                                        isPlaylistPage={true} element={item}
                                                        onButtonClick={() => playCurrentSong(item)} />
                                                )
                                            }) : <div className="col" style={{ marginTop: '10%' }}>
                                                <h3 className="py-5 text-center color-common">
                                                    Your playlist is currently empty!
                                                </h3>
                                                <div className="text-center color-common">
                                                    <i className="bi bi-emoji-frown fs-1"></i>{" "}
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                )}

                <div
                    className="modal fade modal-xl"
                    id="createNewPlaylist"
                    tabIndex={1}
                    aria-labelledby="createNewPlaylist"
                    aria-hidden="true"
                >
                    <div className="modal-dialog">
                        <div className="modal-content bg-common-light">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="createNewPlaylist">
                                    Create New Playlist
                                </h1>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">

                            </div>
                        </div>
                    </div>
                </div>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Playlist
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="form-group">
                            <label htmlFor="playListName" className='mb-2'>Playlist Name</label>
                            <input
                                type="text"
                                placeholder='Enter Name'
                                id="playListName"
                                onChange={(e) => { setNewPlayList(e.target.value); setErrorMsg('') }}
                                required
                                value={newPlaylist}
                                className="form-control"
                            />
                        </div>
                        <div style={{ color: 'red' }}>{errorMsg}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-main" onClick={handleClose}>
                            Close
                        </button>
                        <button className="btn btn-main" onClick={handleSubmit}>
                            Create
                        </button>
                    </Modal.Footer>
                </Modal>


            </div>
        </React.Fragment>
    )
}

export default Playlist;
