// src/components/WikiList.jsx
import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getWikiPages, getAllTags } from '@/utils/wiki.js';
import useFuzzySearch from '@/hooks/useFuzzySearch.js';

export default function WikiList() {
    const [params, setParams] = useSearchParams();
    const initialTag = params.get('tag');

    const [search, setSearch] = useState('');
    const [activeTags, setActiveTags] = useState(initialTag ? [initialTag] : []);

    const pages = useMemo(() => getWikiPages(), []);
    const allTags = useMemo(() => getAllTags(pages), [pages]);

    const filteredByTags = useMemo(() => {
        if (!activeTags.length) return pages;
        return pages.filter(p => activeTags.every(t => (p.tags || []).includes(t)));
    }, [pages, activeTags]);

    const { results } = useFuzzySearch(filteredByTags, search, undefined);
    const list = search.trim() ? results : filteredByTags;

    const toggleTag = (tag) => {
        setActiveTags(prev => {
            const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
            if (next.length) params.set('tag', next[0]); else params.delete('tag');
            setParams(params, { replace: true });
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold mb-6">Wiki Entries</h2>

                <div className="flex flex-col gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search titles, content, and tags..."
                        className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700 focus:border-blue-500 outline-none transition"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 rounded-full text-sm border ${activeTags.includes(tag) ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-700'} transition`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>

                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.map(({ id, title, summary, tags }, idx) => (
                        <motion.li
                            key={id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 * idx }}
                        >
                            <Link
                                to={`/wiki/${id}`}
                                className="block bg-gray-800 p-5 rounded-lg hover:bg-gray-700 transition"
                            >
                                <h3 className="text-xl font-semibold mb-1">{title}</h3>
                                <p className="text-gray-400 mb-2">{summary}</p>
                                <div className="flex flex-wrap gap-2">
                                    {(tags || []).map(t => (
                                        <span key={t} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-300">#{t}</span>
                                    ))}
                                </div>
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
