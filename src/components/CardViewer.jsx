import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import gameCards from '../data/gameCards.json';
import communityCards from '../data/communityCards.json';

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

    const handleMouseMove = e => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const rarity = rarityConfig[card.rarity];

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Card Slot */}
            <div className="w-20 h-20 bg-gray-700 hover:bg-gray-600 border border-gray-800 p-2 cursor-pointer transition-all duration-150 flex items-center justify-center">
                <img
                    src={card.image}
                    alt={card.name}
                    className="w-16 h-16 object-contain pixelated"
                    onError={e => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23444" rx="4"/%3E%3Ctext x="32" y="32" font-family="Arial" font-size="24" fill="%23888" text-anchor="middle" dominant-baseline="middle"%3E?%3C/text%3E%3C/svg%3E'; }}
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
    const [showCommunity,setShowCommunity]= useState(false);

    // pick data
    const cards = showCommunity ? communityCards : gameCards;

    // recompute tags whenever cards changes
    const allTags = useMemo(() => {
        const s = new Set();
        cards.forEach(c => c.tags.forEach(t => s.add(t)));
        return Array.from(s).sort();
    }, [cards]);

    // recompute filtered list whenever any input or cards changes
    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const text = searchTerm.toLowerCase();
            const matchesSearch =
                card.name.toLowerCase().includes(text) ||
                card.tags.some(t => t.toLowerCase().includes(text)) ||
                card.description?.some(d => d.toLowerCase().includes(text));
            const matchesType = filterType === 'all' || card.type === filterType;
            const matchesTags = selectedTags.length === 0 ||
                selectedTags.every(t => card.tags.includes(t));
            return matchesSearch && matchesType && matchesTags;
        });
    }, [searchTerm, filterType, selectedTags, cards]);

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

            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">HearthCraft Card Catalog</h1>
                    <p className="text-gray-400 text-lg mb-6">
                        {cards.length} cards in collection
                    </p>
                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
            <span className={!showCommunity ? 'text-white' : 'text-gray-500'}>
              Game Cards
            </span>
                        <button
                            onClick={() => {
                                setShowCommunity(c => !c);
                                setSelectedTags([]);        // optional: clear tags on switch
                                setSearchTerm('');          // optional: clear search too
                                setFilterType('all');       // optional: reset type
                            }}
                            className="relative w-16 h-8 bg-gray-700 rounded-full transition-colors"
                            style={{ backgroundColor: showCommunity ? '#3B82F6' : '#4B5563' }}
                        >
              <span
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform"
                  style={{ transform: showCommunity ? 'translateX(32px)' : 'translateX(0)' }}
              />
                        </button>
                        <span className={showCommunity ? 'text-white' : 'text-gray-500'}>
              Community Suggestions
            </span>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search cards…"
                            className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
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
                            <label className="block text-gray-300 mb-2">
                                Tags (click to toggle)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium ${
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
                    {selectedTags.length > 0 && (
                        <div className="mt-4 text-gray-400">
                            Active tags: <span className="text-white">{selectedTags.join(', ')}</span>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="mb-4 text-gray-400">
                    Showing <span className="text-white font-bold">{filteredCards.length}</span> of {cards.length} cards
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    {filteredCards.length > 0 ? (
                        <div className="inline-block bg-gray-700 p-2">
                            <div className="grid grid-cols-9 gap-0">
                                {filteredCards.map(card => (
                                    <CardItem key={card.id} card={card} />
                                ))}
                                {[...Array((9 - (filteredCards.length % 9)) % 9)].map((_,i) => (
                                    <div key={i} className="w-20 h-20 bg-gray-700 border border-gray-800" />
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

                <div className="mt-8 text-center text-gray-500 text-sm">
                    Hover over cards to see details
                </div>
            </div>
        </div>
    );
}
