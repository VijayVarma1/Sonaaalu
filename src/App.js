import React, { useState, useRef } from 'react';
import AdminPanel from './components/AdminPanel';
import RecordPanel from './components/RecordPanel';
import DashboardPanel from './components/DashboardPanel'; // Importing DashboardPanel to support charts

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [videoStarted, setVideoStarted] = useState(false);
    const [showRecord, setShowRecord] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false); // This is a good place to control the dashboard panel. Ensure the bar chart rendering logic is implemented inside DashboardPanel.
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

    const handlePaperGenerated = ({ zipData, numPapers, config }) => {
        const timestamp = new Date().toLocaleString();
        const existing = JSON.parse(localStorage.getItem('paperRecords') || '[]');
        const newRecord = {
            timestamp,
            numPapers,
            zipData,
            stats: {
                fillBlanks: config.fillBlanks.count || 0,
                objective: config.objective.count || 0,
                trueFalse: config.trueFalse.count || 0,
                descriptive: config.descriptive.count || 0
            }
        };
        localStorage.setItem('paperRecords', JSON.stringify([...existing, newRecord]));
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
                            ▶️ Welcome to Prajña
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
                    <button
                        onClick={() => setShowDashboard(true)}
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 100,
                            padding: '6px 12px',
                            zIndex: 1000
                        }}
                    >
                        📊 Dashboard
                    </button>
                    <AdminPanel onPaperGenerated={handlePaperGenerated} />
                    {showRecord && <RecordPanel onClose={() => setShowRecord(false)} />}
                    {showDashboard && <DashboardPanel onClose={() => setShowDashboard(false)} />}
                </div>
            )}
        </div>
    );
}

export default App;
