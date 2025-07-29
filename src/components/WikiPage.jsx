// src/components/WikiPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import wikiData from '@/data/wiki.json';

export default function WikiPage() {
    const { id } = useParams();
    const entry = wikiData.pages.find(p => p.id === id);

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
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-6">{entry.title}</h1>
                <div className="space-y-4 text-lg leading-relaxed">
                    {entry.content.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
                <div className="mt-8">
                    <Link to="/wiki" className="text-blue-400 hover:underline">
                        ← Back to all entries
                    </Link>
                </div>
            </div>
        </div>
    );
}
