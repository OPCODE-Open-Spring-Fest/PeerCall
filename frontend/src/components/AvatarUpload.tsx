import React, { useState, FormEvent } from 'react';

type Props = {
    userId: string;
    currentAvatar?: string | null; 
    onUpdated?: (avatarUrl: string) => void;
};

export const AvatarUpload: React.FC<Props> = ({ userId, currentAvatar, onUpdated }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(currentAvatar || null);
    const [loading, setLoading] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        if (f) setPreview(URL.createObjectURL(f));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!file) return alert('Pick a file');
        setLoading(true);
        const fd = new FormData();
        fd.append('avatar', file);

        try {
            const res = await fetch(`/api/users/${userId}/avatar`, {
                method: 'POST',
                body: fd,
                credentials: 'include', 
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Upload failed');
            onUpdated?.(json.avatar);
            setPreview(json.avatar);
            alert('Uploaded');
        } catch (err: any) {
            alert(err.message || 'Upload error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={preview ?? '/default-avatars/default.png'} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    <button type="submit" disabled={!file || loading}>{loading ? 'Uploading...' : 'Upload avatar'}</button>
                </div>
            </div>
        </form>
    );
};
