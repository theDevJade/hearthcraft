import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Menu } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold">
                    HearthCraft
                </Link>

                {/* desktop links */}
                <div className="hidden md:flex space-x-6 items-center">
                    <Link to="/" className="flex items-center hover:text-blue-400">
                        <Home className="mr-1 w-5 h-5"/> Home
                    </Link>
                    <Link to="/cards" className="flex items-center hover:text-blue-400">
                        <BookOpen className="mr-1 w-5 h-5"/> Cards
                    </Link>
                    <Link to="/wiki" className="flex items-center hover:text-blue-400">
                        <BookOpen className="mr-1 w-5 h-5"/> Wiki
                    </Link>
                </div>

                {/* mobile hamburger */}
                <button
                    className="md:hidden focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Menu className="w-6 h-6"/>
                </button>
            </div>

            {/* mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-gray-700">
                    <Link to="/" className="block px-6 py-3 hover:bg-gray-600">Home</Link>
                    <Link to="/cards" className="block px-6 py-3 hover:bg-gray-600">Cards</Link>
                    <Link to="/wiki" className="block px-6 py-3 hover:bg-gray-600">Wiki</Link>
                </div>
            )}
        </nav>
    );
}
