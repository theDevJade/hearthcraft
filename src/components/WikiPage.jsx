// src/components/WikiPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { getWikiPages } from '@/utils/wiki.js';

export default function WikiPage() {
    const { id } = useParams();
    const pages = getWikiPages();
    const entry = pages.find(p => p.id === id);
    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        let isCancelled = false;
        async function load() {
            if (entry?.md) {
                try {
                    const url = new URL(`../data/wiki/${entry.md}`, import.meta.url);
                    const res = await fetch(url);
                    const txt = await res.text();
                    if (!isCancelled) setMarkdown(txt);
                } catch (_) {
                    if (!isCancelled) setMarkdown('');
                }
            } else {
                setMarkdown('');
            }
        }
        load();
        return () => { isCancelled = true; };
    }, [entry?.md]);

    if (!entry) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <p className="text-2xl mb-4">❓ Entry not found</p>
                <Link to="/wiki" className="text-blue-400 underline">
                    Back to Wiki List
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-10">
                <motion.h1 className="text-4xl font-bold mb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {entry.title}
                </motion.h1>
                <div className="flex flex-wrap gap-2 mb-6">
                    {(entry.tags || []).map(t => (
                        <Link key={t} to={`/wiki?tag=${encodeURIComponent(t)}`} className="text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full text-gray-300 hover:bg-gray-700 transition">
                            #{t}
                        </Link>
                    ))}
                </div>

                {markdown ? (
                    <div className="bg-gray-800/60 rounded-xl p-6 leading-relaxed">
                        <ReactMarkdown>{markdown}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="space-y-4 text-lg leading-relaxed">
                        {entry.content.map((line, i) => (
                            <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                {line}
                            </motion.p>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <Link to="/wiki" className="text-blue-400 hover:underline">
                        ← Back to all entries
                    </Link>
                </div>
            </div>
        </div>
    );
}
