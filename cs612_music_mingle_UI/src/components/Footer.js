import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons';

var phantom = {
    display: 'block',
    padding: '20px',
    height: '60px',
    width: '100%',
}

export const Footer = ({ currentMusic, currMusicIndex, tracks, setCurrMusic, setCurrMusicIndex, isPlayMusic }) => {
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (currentMusic && currentMusic.name && isPlayMusic) {            
            audioRef.current.src = currentMusic.preview_url || 'https://p.scdn.co/mp3-preview/6288521777e9d6f237b311484806e1522ac32c8d?cid=a77073181b7d48eb90003e3bb94ff88a';
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(error => {
                    console.error('Failed to start audio playback:', error);
                });
        }
        if(!isPlayMusic){
            setIsPlaying(false);
        }
    }, [currentMusic]);

    const updateProgress = (e) => {
        const { duration, currentTime } = e.target;
        const progressPercent = (currentTime / duration) * 100;
        progressRef.current.style.width = `${progressPercent}%`;
        if (progressPercent === 100) {
            nextSong();
        }
    }

    const setProgress = (e) => {
        const width = e.target.clientWidth;
        const clickX = e.nativeEvent.offsetX;
        const duration = audioRef.current.duration;
        audioRef.current.currentTime = (clickX / width) * duration;
    };

    const playPauseHandler = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    const nextSong = () => {
        // Find the index of the current song
        const currentIndex = currMusicIndex;
        // Check if there's a next song in the tracks array
        if (currentIndex < tracks.length - 1) {
            // Play the next song
            const nextIndex = currentIndex + 1;
            const nextSong = tracks[nextIndex];
            setCurrMusic(nextSong);
            setCurrMusicIndex(nextIndex);
        } else {
            // If there's no next song, loop back to the first song
            const nextIndex = 0;
            const nextSong = tracks[nextIndex];
            setCurrMusic(nextSong);
            setCurrMusicIndex(nextIndex);
        }
    };

    const prevSong = () => {
        // Find the index of the current song
        const currentIndex = currMusicIndex;
        // Check if there's a previous song in the tracks array
        if (currentIndex > 0) {
            // Play the previous song
            const prevIndex = currentIndex - 1;
            const prevSong = tracks[prevIndex];
            setCurrMusic(prevSong);
            setCurrMusicIndex(prevIndex);
        } else {
            // If there's no previous song, loop to the last song
            const prevIndex = tracks.length - 1;
            const prevSong = tracks[prevIndex];
            setCurrMusic(prevSong);
            setCurrMusicIndex(prevIndex);
        }
    };


    return (
        <div>
            <div style={phantom} />
            <div className='footer-main'>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '300px', maxWidth: '400px' }}>
                        <div>
                            <img alt='https://thumbs.dreamstime.com/b/vector-musical-notes-music-gray-background-illustration-eps-141771086.jpg' className='border-round' src={currentMusic?.album?.images[0].url || 'https://thumbs.dreamstime.com/b/vector-musical-notes-music-gray-background-illustration-eps-141771086.jpg'}
                                width={60} height={60} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 10 }}>
                            <div className="song-name">
                                {currentMusic.name}
                            </div>
                            <div style={{
                                textAlign: 'left'
                            }}>
                                {currentMusic?.album?.artists[0]?.name}
                            </div>
                        </div>
                    </div>
                    <div className="navigation">
                        <div>
                            <button id="prev" className="action-btn" onClick={prevSong}>
                                <FontAwesomeIcon icon={faStepBackward} />
                            </button>
                            <button id="play" className="action-btn action-btn-big" onClick={playPauseHandler}>
                                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                            </button>
                            <button id="next" className="action-btn" onClick={nextSong}>
                                <FontAwesomeIcon icon={faStepForward} />
                            </button>
                        </div>

                        <div className="progress-container" id="progress-container" onClick={setProgress}>
                            <div className="progress" ref={progressRef} id="progress"></div>
                        </div>
                        <audio src={currentMusic?.preview_url}
                            id="audio" ref={audioRef} onTimeUpdate={updateProgress}></audio>
                    </div>

                </div>
            </div>
        </div >
    )
}
