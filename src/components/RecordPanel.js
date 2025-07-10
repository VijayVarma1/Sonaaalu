import React from 'react';
import { saveAs } from 'file-saver';

const RecordPanel = ({ onClose }) => {
    const records = JSON.parse(localStorage.getItem('paperRecords') || '[]');

    const downloadZip = (base64, timestamp) => {
        fetch(base64)
            .then(res => res.blob())
            .then(blob => {
                saveAs(blob, `PRAJNA_Paper_${timestamp.replace(/[: ]/g, '_')}.zip`);
            });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                width: '80%',
                maxHeight: '80%',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <h2>📁 Generated Paper Records</h2>
                <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10 }}>❌</button>
                {records.length === 0 ? (
                    <p>No records found.</p>
                ) : (
                    <ul>
                        {records.map((rec, index) => (
                            <li key={index} style={{ marginBottom: '15px' }}>
                                <strong>{rec.timestamp}</strong> – {rec.numPapers} paper(s)
                                <button
                                    onClick={() => downloadZip(rec.zipData, rec.timestamp)}
                                    style={{ marginLeft: '20px' }}
                                >
                                    ⬇️ Download
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RecordPanel;
