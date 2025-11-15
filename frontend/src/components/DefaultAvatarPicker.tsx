import React from 'react';

type Props = {
  userId: string;
  choices: string[]; // e.g. ['robot1','robot2']
  onUpdated?: (avatarUrl: string) => void;
};

export const DefaultAvatarPicker: React.FC<Props> = ({ userId, choices, onUpdated }) => {
  async function select(choice: string) {
    try {
      const res = await fetch(`/api/users/${userId}/avatar/default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      onUpdated?.(json.avatar);
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {choices.map(c => (
        <button key={c} onClick={() => select(c)} style={{ border: 'none', background: 'transparent' }}>
          <img src={`/default-avatars/${c}.png`} alt={c} style={{ width: 72, height: 72, borderRadius: 12 }} />
        </button>
      ))}
    </div>
  );
};
