import React, { useState, useEffect } from 'react';
import { Plus, Trash, ChevronRight } from 'lucide-react';
import { CoinInsertScreen } from './CoinInsertScreen.jsx';
import { PlayerStats } from './PlayerStats.jsx';
import { ScoreNumber } from './ScoreNumber.jsx';
import '../styles/arcade.css';

const ArcadeLeaderboard = ({ endpoint }) => {
    const [coinInserted, setCoinInserted] = useState(false);
    const [bootupAnimation, setBootupAnimation] = useState(true);
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Fetch data from server
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            let allScores = [...(data.scores || [])];
            // Sort descending by score
            allScores.sort((a, b) => b.score - a.score);
            // Assign rank
            allScores = allScores.map((score, index) => ({ ...score, rank: index + 1 }));
            setScores(allScores);

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load leaderboard data');
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to refetch data
    useEffect(() => {
        if (coinInserted) fetchData();
    }, [endpoint, coinInserted, refreshKey]);

    // Simulate bootup
    useEffect(() => {
        if (coinInserted) {
            const timer = setTimeout(() => setBootupAnimation(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [coinInserted]);

    // Refresh leaderboard
    const refreshLeaderboard = () => setRefreshKey((prev) => prev + 1);

    // Add Player
    const handleAddPlayer = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const initials = formData.get('initials');
        const score = parseInt(formData.get('score'), 10) || 0;

        if (!name || !initials) {
            alert('Name and initials are required');
            return;
        }
        try {
            const response = await fetch(`${endpoint}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, initials, score }),
            });
            if (!response.ok) throw new Error('Failed to add player');
            await response.json();
            setShowAddPlayerForm(false);
            refreshLeaderboard();
        } catch (error) {
            console.error('Error adding player:', error);
            alert('Error adding player');
        }
    };

    // Delete player
    const handleDeletePlayer = async (player) => {
        if (!window.confirm(`Are you sure you want to delete ${player.name}?`)) return;
        try {
            const response = await fetch(`${endpoint}/players/${player.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete player');
            refreshLeaderboard();
        } catch (err) {
            console.error(err);
            alert('Error deleting player');
        }
    };

    // 1) Coin Insert Screen
    if (!coinInserted) {
        return <CoinInsertScreen onInsertCoin={() => setCoinInserted(true)} />;
    }

    // 2) Loading / Bootup Screen
    if (bootupAnimation) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
                <div className="retro-text text-green-400 animate-typewriter">LOADING SYSTEM...</div>
            </div>
        );
    }

    // 3) Error Screen
    if (error) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
                <div className="retro-text text-red-400 text-center">
                    SYSTEM ERROR
                    <br />
                    <span className="text-sm mt-4 block">{error}</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-4 py-2 border border-red-400 hover:bg-red-400/20"
                    >
                        RETRY
                    </button>
                </div>
            </div>
        );
    }

    // 4) Main Leaderboard
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">
            {/* Fancy Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="bg-scanlines w-full h-full opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-purple-900/10 to-blue-900/10"></div>
            </div>

            {/* Admin Toggle */}
            <button onClick={() => setIsAdmin((prev) => !prev)} className="admin-toggle">
                {isAdmin ? 'Admin Mode: ON' : 'Admin Mode: OFF'}
            </button>

            {/* Content */}
            <div className={`w-full max-w-4xl p-8 relative z-10 ${isAdmin ? 'admin-mode' : ''}`}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
                    <h1 className="text-6xl font-bold retro-text animate-glow">HIGH SCORES</h1>
                    <button
                        onClick={() => setShowAddPlayerForm(true)}
                        className="mt-4 sm:mt-0 flex items-center space-x-1 bg-green-600 px-3 py-1 rounded hover:bg-green-700 retro-text text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Player</span>
                    </button>
                </div>

                {/* Leaderboard Container */}
                <div className="bg-blue-900/20 rounded p-6 border border-blue-500/50 shadow-glow animate-fade-in max-h-[500px] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {scores.map((score, index) => (
                                <div
                                    key={score.id}
                                    className="relative group bg-blue-900/30 rounded p-4 transition-all duration-300 hover:bg-blue-800/40 border border-blue-500/30 hover:border-cyan-400/50 transform hover:translate-x-2 shadow-glow-sm"
                                    style={{ animation: `slideIn 0.5s ease-out ${index * 0.1}s both` }}
                                >
                                    <div className="flex items-center justify-between retro-text">
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`text-2xl font-bold ${
                                                    index === 0
                                                        ? 'text-yellow-400 animate-pulse'
                                                        : index === 1
                                                            ? 'text-cyan-400'
                                                            : index === 2
                                                                ? 'text-purple-400'
                                                                : 'text-blue-400'
                                                }`}
                                            >
                                                #{score.rank}
                                            </div>
                                            <div className="text-xl tracking-wider relative group">
                                                <span>{score.initials}</span>
                                                <div className="opacity-0 group-hover:opacity-100 absolute left-0 -top-8 bg-blue-900/95 text-white px-2 py-1 rounded text-sm whitespace-nowrap transform -translate-y-2 transition-all duration-200">
                                                    {score.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <ScoreNumber number={score.score} />
                                            <ChevronRight
                                                className="w-5 h-5 text-cyan-300 cursor-pointer hover:text-cyan-400 transition-colors"
                                                onClick={() =>
                                                    setSelectedPlayer(selectedPlayer?.id === score.id ? null : score)
                                                }
                                            />
                                            {isAdmin && (
                                                <Trash
                                                    className="w-5 h-5 text-red-400 cursor-pointer hover:text-red-600 transition-colors"
                                                    onClick={() => handleDeletePlayer(score)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {selectedPlayer?.id === score.id && (
                                        <PlayerStats
                                            player={score}
                                            onClose={() => setSelectedPlayer(null)}
                                            onPlayerUpdated={refreshLeaderboard}
                                            endpoint={endpoint}
                                            isAdmin={isAdmin}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Player Form Modal */}
            {showAddPlayerForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="bg-blue-900 p-6 rounded shadow-glow max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4 retro-text">Add New Player</h2>
                        <form onSubmit={handleAddPlayer} className="space-y-4">
                            <div>
                                <label className="block text-sm">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full p-2 rounded bg-blue-800 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Initials</label>
                                <input
                                    type="text"
                                    name="initials"
                                    className="w-full p-2 rounded bg-blue-800 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Score</label>
                                <input
                                    type="number"
                                    name="score"
                                    defaultValue="0"
                                    className="w-full p-2 rounded bg-blue-800 text-white"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddPlayerForm(false)}
                                    className="px-4 py-2 border border-gray-400 hover:bg-gray-500/20 retro-text text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 retro-text text-sm rounded"
                                >
                                    Add Player
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArcadeLeaderboard;
