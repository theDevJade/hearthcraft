import React, { useState, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import gameCards from '../data/gameCards.json';
import useFuzzySearch from '@/hooks/useFuzzySearch.js';

// Rarity configurations
const rarityConfig = {
    common:   { color: '#FFFFFF', displayName: 'Common' },
    uncommon: { color: '#55FF55', displayName: 'Uncommon' },
    rare:     { color: '#5555FF', displayName: 'Rare' },
    epic:     { color: '#AA00AA', displayName: 'Epic' },
    legendary: {
        color: 'legendary', // Special handling for rainbow
        displayName: 'Legendary',
        rainbow: [
            '#FF5555','#FFAA00','#FFFF55',
            '#55FF55','#55FFFF','#5555FF',
            '#AA00AA','#FF55FF'
        ]
    }
};

// Card Item Component
const CardItem = ({ card }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const erroredRef = useRef(false);

    const handleMouseMove = e => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const rarity = rarityConfig[card.rarity];

    const resolvedSrc = useMemo(() => {
        const src = (card.image || '').trim();
        if (!src) return '/mc-placeholder.svg';
        try {
            // if absolute URL
            if (/^https?:\/\//i.test(src)) return src;
            // else treat as public path
            return src.startsWith('/') ? src : `/${src}`;
        } catch {
            return '/mc-placeholder.svg';
        }
    }, [card.image]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Card Slot */}
            <div className="w-20 h-20 bg-[#2a2a2a] hover:bg-[#333] border border-[#111] p-2 cursor-pointer transition-all duration-150 flex items-center justify-center shadow-inner">
                <img
                    src={resolvedSrc}
                    alt={card.name}
                    className="w-16 h-16 object-contain pixelated"
                    onError={e => {
                        if (!erroredRef.current) {
                            erroredRef.current = true;
                            e.target.src = '/mc-placeholder.svg';
                        }
                    }}
                />
            </div>

            {/* Tooltip */}
            {isHovered && (
                <div
                    className="mc-tooltip"
                    style={{
                        position: 'fixed',
                        left: mousePos.x + 12,
                        top:  mousePos.y + 12,
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    {/* Title */}
                    {card.rarity === 'legendary' ? (
                        <div className="flex text-[14px] mb-1">
                            <span className="rainbow-text">{card.name}</span>
                            <span className="text-gray-500"> [</span>
                            <span className="rainbow-text">Legendary</span>
                            <span className="text-gray-500">]</span>
                        </div>
                    ) : (
                        <div
                            className="text-[14px] font-bold mb-1"
                            style={{ color: rarity.color }}
                        >
                            {card.name} [{rarity.displayName}]
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-[2px] bg-[#2A2A2A] my-1"></div>

                    {/* Stats */}
                    <div className="text-[12px] leading-tight">
                        <div><span className="text-[#55FFFF]">⭐ MANA:</span> {card.mana}</div>
                        {card.type === 'mob' && (
                            <>
                                <div><span className="text-[#FF5555]">⚔ ATK:</span> {card.attack}</div>
                                <div><span className="text-[#FF5555]">❤ HP:</span>  {card.health}</div>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    {card.description?.length > 0 && (
                        <div className="text-[12px] mt-1 leading-tight">
                            {card.description.map((line,i) => <div key={i}>{line}</div>)}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-2 pt-1 border-t border-[#2A2A2A] text-[11px]">
                        <div className="uppercase text-gray-400">
                            {card.tags.map(t => t.toUpperCase()).join(' ')} {card.type.toUpperCase()} CARD
                        </div>
                        <div className="italic text-gray-500">
                            Minecraft{card.author ? ` • By ${card.author}` : ''}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App Component
export default function HearthcraftViewer() {
    const [searchTerm,   setSearchTerm]   = useState('');
    const [filterType,   setFilterType]   = useState('all');
    const [selectedTags, setSelectedTags] = useState([]);

    const cards = gameCards;

    const allTags = useMemo(() => {
        const s = new Set();
        cards.forEach(c => c.tags.forEach(t => s.add(t)));
        return Array.from(s).sort();
    }, [cards]);

    const { results: searchResults } = useFuzzySearch(cards, searchTerm, {
        keys: [
            { name: 'name', weight: 0.6 },
            { name: 'description', weight: 0.25 },
            { name: 'tags', weight: 0.15 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
    });

    const baseList = searchTerm.trim() ? searchResults : cards;

    const filteredCards = useMemo(() => {
        return baseList.filter(card => {
            const matchesType = filterType === 'all' || card.type === filterType;
            const matchesTags = selectedTags.length === 0 || selectedTags.every(t => card.tags.includes(t));
            return matchesType && matchesTags;
        });
    }, [baseList, filterType, selectedTags]);

    const toggleTag = tag => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&family=Silkscreen&display=swap');
        .pixelated { image-rendering: pixelated; }
        .mc-tooltip {
          background: rgba(16,0,16,0.94);
          border: 3px solid #5000FF;
          outline: 2px solid #28007F;
          padding: 8px;
          font-family: 'Silkscreen','VT323',monospace;
          white-space: nowrap;
          box-shadow: 0 0 20px rgba(0,0,0,0.8);
        }
        .rainbow-text {
          background: linear-gradient(to right,
            #FF5555,#FFAA00,#FFFF55,
            #55FF55,#55FFFF,#5555FF,
            #AA00AA,#FF55FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
        }
      `}</style>

            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">HearthCraft Card Catalog</h1>
                    <p className="text-gray-400 text-base sm:text-lg mb-4 transition-opacity duration-500 ease-out">
                        {filteredCards.length} / {cards.length} cards
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="bg-gray-800 rounded-lg p-4 sm:p-5 mb-5">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search cards…"
                            className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Card Type</label>
                            <select
                                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="mob">Mob Cards</option>
                                <option value="trick">Trick Cards</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Tags (click to toggle)</label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-md border text-sm font-medium ${
                                            selectedTags.includes(tag)
                                                ? 'bg-blue-600 border-blue-500 text-white'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-gray-800 rounded-lg p-4 sm:p-5">
                    {filteredCards.length > 0 ? (
                        <div className="bg-gray-700 p-2">
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-10 gap-1 sm:gap-2">
                                {filteredCards.map(card => (
                                    <CardItem key={card.id} card={card} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No cards found</p>
                            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>

                <div className="mt-5 text-center text-gray-500 text-sm">
                    Hover over cards to see details
                </div>
            </div>
        </div>
    );
}
