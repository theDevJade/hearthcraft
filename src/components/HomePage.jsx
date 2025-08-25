// src/components/HomePage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';

import { getWikiPages } from '@/utils/wiki.js';
import useFuzzySearch from '@/hooks/useFuzzySearch.js';
import WitherClicker from '@/components/WitherClicker.jsx';
import { getCookieJSON, setCookie, getLocalJSON, setLocalJSON } from '@/utils/cookies.js';

export default function HomePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [feedCount, setFeedCount] = useState(0);
    const [titleText, setTitleText] = useState('HearthCraft');
    const [reward, setReward] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [showClicker, setShowClicker] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [secretProgress, setSecretProgress] = useState(0);
    const controls = useAnimation();
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const pages = getWikiPages();
    const fuseOptions = useMemo(() => ({
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
            { name: 'title', weight: 0.6 },
            { name: 'summary', weight: 0.2 },
            { name: 'content', weight: 0.15 },
            { name: 'tags', weight: 0.05 },
        ],
    }), []);
    const { results } = useFuzzySearch(pages, searchTerm, fuseOptions);
    const suggestions = useMemo(() => (searchTerm.trim() ? results.slice(0, 5) : []), [results, searchTerm]);

    // restore unlock from storage or cookie
    useEffect(() => {
        const state = getLocalJSON('wither_clicker_unlock_v1', null) ?? getCookieJSON('wither_clicker_unlock_v1', {});
        if (state?.unlocked) setUnlocked(true);
    }, []);

    // Flashier incineration w/ particles
    useEffect(() => {
        const run = async () => {
            await controls.start({
                opacity: [1, 0.92, 1, 0.85, 1],
                textShadow: [
                    '0 0 10px #ff7a18',
                    '0 0 14px #ff4500',
                    '0 0 8px #a11',
                    '0 0 16px #ff7a18',
                ],
                transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
            });
        };
        run();
    }, [controls]);

    // Konami Code Easter Egg + secret combo with progress
    useEffect(() => {
        const secretWord = 'witherrose';
        const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
        let idx = 0;
        let typed = '';
        const handler = (e) => {
            const k = e.key.toLowerCase();
            // konami
            const expected = seq[idx].toLowerCase();
            if (k === expected) {
                idx += 1;
                if (idx === seq.length) {
                    setUnlocked(true);
                    const payload = { unlocked: true };
                    setLocalJSON('wither_clicker_unlock_v1', payload);
                    setCookie('wither_clicker_unlock_v1', payload, 365);
                    idx = 0;
                }
            } else {
                idx = 0;
            }
            // secret word progress
            if (k.length === 1 && /[a-z0-9]/.test(k)) {
                typed = (typed + k).slice(-secretWord.length);
                // compute longest prefix of secretWord that is a suffix of typed
                let match = 0;
                for (let i = 1; i <= Math.min(secretWord.length, typed.length); i++) {
                    if (typed.slice(-i) === secretWord.slice(0, i)) match = i;
                }
                setSecretProgress(match);
                if (match === secretWord.length) {
                    setUnlocked(true);
                    const payload = { unlocked: true };
                    setLocalJSON('wither_clicker_unlock_v1', payload);
                    setCookie('wither_clicker_unlock_v1', payload, 365);
                    typed = '';
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const triggerSearch = id => {
        navigate(`/wiki/${id}`);
    };

    const handleKey = e => {
        if (e.key === 'Enter' && suggestions.length) {
            triggerSearch(suggestions[0].id);
        }
    };

    const handleRevive = async () => {
        setFeedCount(c => {
            const next = c + 1;
            if (next === 3) setReward('Unlocked: 🔥 Ember Title Glow');
            if (next === 7) setReward('Unlocked: ✨ Sparkle Search Field');
            if (next === 12) setReward('Unlocked: 🎉 The soup of mango.');
            return next;
        });
        if (Math.random() < 0.12 && feedCount < 99 && titleText.length > 1) {
            const i = Math.floor(Math.random() * titleText.length);
            setTitleText(t => t.slice(0, i) + t.slice(i + 1));
        }
        await controls.start({
            scale: [1, 1.05, 1],
            opacity: [1, 0.98, 1],
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        });
    };

    // simple particle layer
    const particles = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-gray-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 opacity-80" />

            {/* particles */}
            <div className="pointer-events-none absolute inset-0">
                {particles.map(i => (
                    <motion.span
                        key={i}
                        className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-40"
                        initial={{ x: Math.random() * window.innerWidth, y: Math.random() * 160 + 40, scale: Math.random() * 0.8 + 0.6 }}
                        animate={{
                            y: [-10, -80 - Math.random() * 60],
                            x: ['+=0', `+=${(Math.random() - 0.5) * 40}`],
                            opacity: [0.5, 0],
                        }}
                        transition={{ duration: 2 + Math.random() * 1.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: Math.random() * 1.2 }}
                        style={{ left: 0, top: 0 }}
                    />
                ))}
            </div>

            {/* confetti */}
            {showConfetti && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="text-3xl">
                        🎊
                    </motion.div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-4xl px-6 pt-24 pb-12 flex flex-col items-center">
                <div className="bg-gray-800 bg-opacity-90 backdrop-blur-md px-8 py-8 rounded-2xl shadow-xl text-center">
                    <motion.h1
                        className="text-5xl font-extrabold mb-3 tracking-wide"
                        animate={controls}
                        initial={{opacity: 1}}
                    >
                        {titleText}
                    </motion.h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-300">
                        Oopsies, looks like the title got incinerated. Try feeding it.
                    </p>
                </div>

                {reward && (
                    <motion.div className="mt-3 text-sm text-green-300" initial={{opacity: 0, y: -4}}
                                animate={{opacity: 1, y: 0}} transition={{duration: 0.4, ease: [0.22, 1, 0.36, 1]}}>
                        {reward}
                    </motion.div>
                )}

                <div className="h-10"/>

                {/* search box */}
                <div className="relative w-full max-w-xl mb-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6"/>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search guides, cards, wiki entries..."
                        className={`w-full bg-gray-800 text-white pl-14 pr-4 py-3 rounded-full border ${reward.includes('Sparkle') ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.35)]' : 'border-gray-700'} focus:border-blue-500 outline-none text-lg transition`}
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
                                    <div className="flex items-center justify-between">
                                        <span>{item.title}</span>
                                        <div className="flex gap-1">
                                            {(item.tags || []).slice(0, 3).map(t => (
                                                <span key={t}
                                                      className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {!unlocked && (
                    <motion.div className="mb-3 text-sm text-gray-400 flex items-center gap-2" initial={{opacity: 0}}
                                animate={{opacity: 0.9}}>
                        <span>Hint:</span>
                        <span className="italic">Some secrets bloom when you type a certain flower...</span>
                        <span className="text-gray-500">(
                            {Array.from({length: 10}).map((_, i) => (
                                <span key={i}
                                      className={`mx-0.5 ${i < secretProgress ? 'text-yellow-300' : 'text-gray-600'}`}>•</span>
                            ))}
                            )</span>
                    </motion.div>
                )}
                <div style={{marginBottom: '16px'}}></div>
                {/* features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
                    {[
                        {to: '/cards', title: 'Explore Cards', desc: 'Browse hundreds of fan‑made cards.'},
                        {to: '/wiki', title: 'Read Guides', desc: 'In‑depth tutorials & how‑tos.'},
                        {to: '/community', title: 'Join Community', desc: 'Share your creations.'}
                    ].map((feat, i) => (
                        <motion.div
                            key={feat.to}
                            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
                            initial={{opacity: 0, y: 20}}
                            whileHover={{y: -2, scale: 1.01}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1]}}
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
                        <FaDiscord className="w-8 h-8 hover:text-gray-300 transition"/>
                    </a>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRevive}
                            className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-full text-white font-semibold transition"
                        >
                            🌹 Feed the title a Wither Rose!
                        </button>
                        {unlocked && (
                            <button
                                onClick={() => setShowClicker(true)}
                                className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-full text-white font-semibold transition"
                            >
                                ▶️ Play Clicker
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-400">
                        Fed <span className="font-medium">{feedCount}</span> times.
                    </p>
                </div>
            </div>

            {showClicker && <WitherClicker onClose={() => setShowClicker(false)} />}
        </div>
    );
}
