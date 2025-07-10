import React, { useState, useRef } from 'react';
import AdminPanel from './components/AdminPanel';
import RecordPanel from './components/RecordPanel';

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [videoStarted, setVideoStarted] = useState(false);
    const [showRecord, setShowRecord] = useState(false);
    const videoRef = useRef(null);

    const handleStart = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setVideoStarted(true);
        }
    };

    const handleVideoEnd = () => {
        setShowSplash(false);
    };

    return (
        <div className="App">
            {showSplash ? (
                <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
                    {!videoStarted && (
                        <button
                            onClick={handleStart}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                padding: '12px 24px',
                                fontSize: '18px',
                                zIndex: 10,
                                cursor: 'pointer'
                            }}
                        >
                            ▶️ PRAJNA
                        </button>
                    )}

                    <video
                        ref={videoRef}
                        onEnded={handleVideoEnd}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none'
                        }}
                    >
                        <source src="/intro.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowRecord(true)}
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            padding: '6px 12px',
                            zIndex: 1000
                        }}
                    >
                        📁 Record
                    </button>
                    <AdminPanel />
                    {showRecord && <RecordPanel onClose={() => setShowRecord(false)} />}
                </div>
            )}
        </div>
    );
}

export default App;
