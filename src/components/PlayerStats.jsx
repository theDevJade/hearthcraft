import React, { useState } from 'react';

export const PlayerStats = ({ player, onClose, onPlayerUpdated, endpoint, isAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState({
        name: player.name,
        initials: player.initials,
        score: player.score,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedPlayer((prev) => ({
            ...prev,
            [name]: name === 'score' ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${endpoint}/players/${player.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedPlayer),
            });
            if (!response.ok) throw new Error('Failed to update player');
            await response.json();
            setIsEditing(false);
            onPlayerUpdated();
        } catch (err) {
            console.error(err);
            setError('Error updating player');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-blue-800 p-4 mt-2 rounded animate-popdown">
            <div className="mb-2 text-white retro-text text-sm flex justify-between items-center">
                <strong>Player Details:</strong>
                {isAdmin && (
                    <button
                        onClick={() => setIsEditing((prev) => !prev)}
                        className="px-2 py-1 border border-white hover:bg-blue-700 rounded text-xs"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                )}
            </div>
            {isEditing ? (
                <div className="text-white text-sm space-y-2">
                    <div>
                        <label className="block">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={editedPlayer.name}
                            onChange={handleChange}
                            className="w-full p-1 rounded bg-blue-600"
                        />
                    </div>
                    <div>
                        <label className="block">Initials:</label>
                        <input
                            type="text"
                            name="initials"
                            value={editedPlayer.initials}
                            onChange={handleChange}
                            className="w-full p-1 rounded bg-blue-600"
                        />
                    </div>
                    <div>
                        <label className="block">Score:</label>
                        <input
                            type="number"
                            name="score"
                            value={editedPlayer.score}
                            onChange={handleChange}
                            className="w-full p-1 rounded bg-blue-600"
                        />
                    </div>
                    {error && <div className="text-red-400">{error}</div>}
                    <div className="flex space-x-2 mt-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedPlayer({
                                    name: player.name,
                                    initials: player.initials,
                                    score: player.score,
                                });
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-white text-sm">
                    <p>Name: {player.name}</p>
                    <p>Initials: {player.initials}</p>
                    <p>Score: {player.score}</p>
                </div>
            )}
            <button
                onClick={onClose}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 retro-text text-xs mt-4"
            >
                Close
            </button>
        </div>
    );
};
