// src/components/HomePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

import wikiData from '@/data/wiki.json';

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [feedCount, setFeedCount] = useState(0);
    const [titleText, setTitleText] = useState('HearthCraft');
    const controls = useAnimation();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // core shake/glow/explode sequence
    const crazySequence = async () => {
        await controls.start({
            x: [0, -15, 15, -15, 15, 0],
            rotate: [0, 10, -10, 10, -10, 0],
            transition: { duration: 0.8, ease: 'easeInOut' },
        });
        await controls.start({
            textShadow: [
                '0px 0px 4px #ff9a00,0 0 8px #ff4500,0 0 12px #ff0000',
                '0 0 8px #ffff00,0 0 16px #ff8c00,0 0 24px #ff0000',
                '0px 0px 4px #ff9a00,0 0 8px #ff4500,0 0 12px #ff0000'
            ],
            transition: { duration: 0.6, yoyo: Infinity },
        });
        await controls.start({
            scale: [1, 1.8, 2.5],
            rotate: [0, 360, 720],
            transition: { duration: 0.6, ease: 'easeOut' },
        });
        await controls.start({
            scale: [2.5, 4, 0],
            opacity: [1, 0.5, 0],
            transition: { duration: 1, ease: 'easeIn' },
        });
    };

    // run on mount
    useEffect(() => {
        crazySequence();
    }, []);

    // search logic
    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        setSuggestions(
            term
                ? wikiData.pages.filter(p => p.title.toLowerCase().includes(term)).slice(0, 5)
                : []
        );
    }, [searchTerm]);

    const triggerSearch = id => {
        setSuggestions([]);
        navigate(`/wiki/${id}`);
    };

    const handleKey = e => {
        if (e.key === 'Enter') {
            if (suggestions.length) triggerSearch(suggestions[0].id);
            else {
                const t = searchTerm.trim().toLowerCase();
                const match =
                    wikiData.pages.find(p => p.title.toLowerCase() === t) ||
                    wikiData.pages.find(p => p.title.toLowerCase().includes(t));
                if (match) triggerSearch(match.id);
            }
        }
    };

    // revive & feed handler
    const handleRevive = async () => {
        // increment feed count
        setFeedCount(c => c + 1);

        // 20% chance to drop a random letter (only before 99 feeds)
        if (Math.random() < 0.15 && feedCount < 99 && titleText.length > 1) {
            const i = Math.floor(Math.random() * titleText.length);
            setTitleText(t => t.slice(0, i) + t.slice(i + 1));
        }

        // pop title back if it's vanished
        await controls.start({
            scale: [0, 1.2, 1],
            opacity: [0, 1, 1],
            transition: { duration: 0.6, ease: 'easeOut' },
        });

        // only re‑explode if fed < 99 times
        if (feedCount + 1 < 99) {
            crazySequence();
        }
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gray-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-900 to-blue-900 opacity-70 bg-[length:200%_200%] animate-gradient-slow" />

            <div className="relative z-10 w-full max-w-4xl px-6 pt-24 pb-12 flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg px-10 py-8 rounded-2xl shadow-2xl text-center">
                    <motion.h1
                        className="text-6xl font-extrabold mb-4 inline-block"
                        animate={controls}
                        initial={{ x: 0, rotate: 0, scale: 1, opacity: 1 }}
                    >
                        🔥🔥🔥 {titleText} 🔥🔥🔥
                    </motion.h1>
                    <p className="text-xl max-w-2xl mx-auto leading-relaxed">
                        <span className="text-yellow-400">This title had more than </span>
                        <span className="text-red-500">4 ⚔️</span>
                        <span className="text-yellow-400"> and was </span>
                        <span className="text-red-500">incinerated</span>
                    </p>
                </div>

                <div className="h-16" />

                {/* search box */}
                <div className="relative w-full max-w-xl mb-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search guides, cards, wiki entries..."
                        className="w-full bg-gray-800 text-white pl-14 pr-4 py-3 rounded-full border border-gray-700 focus:border-blue-500 outline-none text-lg transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={handleKey}
                    />
                    <button
                        onClick={() => suggestions[0] && triggerSearch(suggestions[0].id)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-white font-semibold transition"
                    >
                        Go
                    </button>

                    {suggestions.length > 0 && (
                        <ul className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-md max-h-60 overflow-y-auto z-20">
                            {suggestions.map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => triggerSearch(item.id)}
                                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                                >
                                    {item.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
                    {[
                        { to: '/cards', title: 'Explore Cards', desc: 'Browse hundreds of fan‑made cards.' },
                        { to: '/wiki', title: 'Read Guides', desc: 'In‑depth tutorials & how‑tos.' },
                        { to: '/community', title: 'Join Community', desc: 'Share your creations.' }
                    ].map((feat, i) => (
                        <motion.div
                            key={feat.to}
                            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.2 }}
                        >
                            <Link to={feat.to}>
                                <h3 className="text-2xl font-bold mb-2">{feat.title}</h3>
                                <p className="text-gray-400">{feat.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Discord & revive */}
                <div className="flex flex-col items-center space-y-2">
                    <a href="https://discord.gg/YourServer" target="_blank" rel="noopener noreferrer">
                        <FaDiscord className="w-8 h-8 hover:text-gray-300 transition" />
                    </a>
                    <button
                        onClick={handleRevive}
                        className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full text-white font-semibold transition"
                    >
                        🌹 Feed the title a Wither Rose!
                    </button>
                    <p className="text-sm text-gray-400">
                        Fed <span className="font-medium">{feedCount}</span> times.{' '}
                        <span className="italic">Hint: If you feed it 99 times, it may stay (mostly intact).</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-slow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-slow {
                    animation: gradient-slow 30s ease infinite;
                }
            `}</style>
        </div>
    );
}
