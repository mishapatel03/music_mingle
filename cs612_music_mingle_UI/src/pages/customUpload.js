import React, { useEffect, useRef, useState } from 'react'
import Card from '../components/Card';
import { BackendUrl, LamdaFunUrl } from '../constants';
import { Button, Modal } from 'react-bootstrap';
import Loader from '../components/loader';

const CustomUpload = ({ handleContentChange, handleFolderPlusClick }) => {
    const [allSongs, setAllSongs] = useState([]);
    const [songName, setSongName] = useState('');
    const [artistName, setArtistName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [songFile, setSongFile] = useState(null);
    const [isCustomUploadModalShow, setCustomUploadModalShow] = useState(false);
    const songFileInputRef = useRef(null);
    const imageFileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCustomMusicList();
    }, []);

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

    const playCurrentSong = (song) => {
        const data = convertToNewFormat(song);
        handleContentChange(data);
    }

    const fetchCustomMusicList = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage

            const response = await fetch(`${BackendUrl}/api/custom-songs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const jsonData = await response.json();
            setAllSongs(jsonData.customSongs);

        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    }


    const handleSubmit = async (event) => {
        event.preventDefault();
        let imageUploadUrl;
        let songFileUploadUrl;
        setIsLoading(true);

        if (imageFile) {
            try {
                const result = await fetch(LamdaFunUrl).then(res => res.json());
                if (result.uploadURL) {
                    const response = await fetch(result.uploadURL, {
                        method: "PUT",
                        body: imageFile,
                    });
                    imageUploadUrl = response?.url?.split('?')[0];
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }

        if (songFile) {
            try {
                const result = await fetch(LamdaFunUrl).then(res => res.json());
                if (result.uploadURL) {
                    const response = await fetch(result.uploadURL, {
                        method: "PUT",
                        body: songFile,
                    });
                    songFileUploadUrl = response?.url?.split('?')[0];
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }

        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const params = {
            songName: songName,
            artistName: artistName,
            imageUrl: imageUploadUrl,
            songUrl: songFileUploadUrl,
        }

        // Set up request headers with the token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            await fetch(`${BackendUrl}/api/custom-songs`, {
                method: "POST",
                body: JSON.stringify(params),
                headers: headers // Include the token in the request headers
            });
            resetForm();
            handleClose();
            await fetchCustomMusicList();
        } catch (error) {
            console.error("Error posting custom song:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleClose = () => setCustomUploadModalShow(false);

    const resetForm = () => {
        setSongName('');
        setArtistName('');
        setSongFile(null);
        songFileInputRef.current.value = '';
        imageFileInputRef.current.value = '';
        setImageFile(null);
    }

    const handleShow = () => { setCustomUploadModalShow(true); };

    const handleFolderClickChange = (element) => {
        const data = convertToNewFormat(element);
        handleFolderPlusClick(data);
    }

    return (
        <React.Fragment>
            <Loader loading={isLoading} />
            <div className="row">
                <div>
                    <Button variant="outline-light" className="btn btn-outline-light mx-1 mt-2 mb-2"
                        style={{ position: 'relative', left: '89%' }} onClick={handleShow}>
                        <i className="bi bi-cloud-upload"></i>
                        <span className='m-2'>Upload New Music</span>
                    </Button>
                </div>
                <div className="row">
                    {allSongs && allSongs.length ? <React.Fragment> {allSongs.map((element, index) => {
                        return <Card onFolderPlusClick={() => handleFolderClickChange(element)}
                            onButtonClick={() => playCurrentSong(element)} key={element.id} element={element} />;
                    })}</React.Fragment>
                        : <div className="col" style={{ marginTop: '10%' }}>
                            <h3 className="py-5 text-center color-common">
                                You don't have any custom music yet!
                            </h3>
                            <div className="text-center color-common">
                                <i className="bi bi-emoji-frown fs-1"></i>{" "}
                            </div>
                        </div>}
                </div>

                <Modal show={isCustomUploadModalShow} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Custom songs upload
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit} className="song-form">
                            <div className="form-group">
                                <label htmlFor="songName">Song Name:</label>
                                <input
                                    type="text"
                                    placeholder='Enter Name'
                                    id="songName"
                                    value={songName}
                                    onChange={(e) => setSongName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="artistName">Artist Name:</label>
                                <input
                                    type="text"
                                    placeholder='Enter Artist'
                                    id="artistName"
                                    value={artistName}
                                    onChange={(e) => setArtistName(e.target.value)}
                                    required
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="imageFile">Image Upload (JPEG/JPG):</label>
                                <input
                                    type="file"
                                    id="imageFile"
                                    accept="image/jpeg, image/jpg"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    required
                                    className="form-control"
                                    ref={imageFileInputRef}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="songFile">Song File Upload (MP3):</label>
                                <input
                                    type="file"
                                    id="songFile"
                                    accept="audio/mp3"
                                    onChange={(e) => setSongFile(e.target.files[0])}
                                    required
                                    className="form-control"
                                    ref={songFileInputRef}
                                />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className="btn btn-main" onClick={handleClose}>
                            Close
                        </button>
                        <button className="btn btn-main" onClick={handleSubmit}>
                            Submit
                        </button>
                    </Modal.Footer>
                </Modal>

            </div>
        </React.Fragment>
    )
}

export default CustomUpload;
