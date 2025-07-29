// src/components/WikiList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import wikiData from '@/data/wiki.json';

export default function WikiList() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold mb-6">Wiki Entries</h2>
                <ul className="space-y-4">
                    {wikiData.pages.map(({ id, title, summary }) => (
                        <li key={id}>
                            <Link
                                to={`/wiki/${id}`}
                                className="block bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                            >
                                <h3 className="text-xl font-semibold">{title}</h3>
                                <p className="text-gray-400">{summary}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
