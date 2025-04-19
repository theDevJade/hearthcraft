import React from 'react';

export const CoinInsertScreen = ({ onInsertCoin }) => {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white">
            <div className="retro-text text-4xl text-yellow-400 mb-6 animate-blink">
                INSERT COIN
            </div>
            <button
                onClick={onInsertCoin}
                className="px-6 py-2 border border-yellow-400 retro-text hover:bg-yellow-400/20 transition"
            >
                PRESS START
            </button>
        </div>
    );
};
