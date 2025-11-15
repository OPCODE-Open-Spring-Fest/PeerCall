
import React from 'react';

type Participant = {
    id: string;
    name: string;
    avatar?: string | null; 
    videoEnabled: boolean;
    // optionally: stream?: MediaStream
};

export const CallTile: React.FC<{ participant: Participant }> = ({ participant }) => {
    return (
        <div style={{ width: 240, height: 180, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#111' }}>
            {participant.videoEnabled ? (
                <video
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                    <img src={participant.avatar ?? '/default-avatars/default.png'} alt={participant.name}
                        style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }} />
                </div>
            )}

            <div style={{ position: 'absolute', left: 8, bottom: 8, color: 'white', fontSize: 12, background: 'rgba(0,0,0,0.5)', padding: '4px 6px', borderRadius: 6 }}>
                {participant.name}
            </div>
        </div>
    );
};
