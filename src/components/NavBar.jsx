import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
                    <Link to="/" className="text-2xl font-bold" title="psst... try the Konami code on Home">
                        HearthCraft
                    </Link>
                </motion.div>

                {/* desktop links */}
                <div className="hidden md:flex space-x-6 items-center">
                    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                        <Link to="/" className="flex items-center hover:text-blue-400">
                            <Home className="mr-1 w-5 h-5"/> Home
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                        <Link to="/cards" className="flex items-center hover:text-blue-400">
                            <BookOpen className="mr-1 w-5 h-5"/> Cards
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                        <Link to="/wiki" className="flex items-center hover:text-blue-400">
                            <BookOpen className="mr-1 w-5 h-5"/> Wiki
                        </Link>
                    </motion.div>
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
                <motion.div className="md:hidden bg-gray-700" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                    <Link to="/" className="block px-6 py-3 hover:bg-gray-600">Home</Link>
                    <Link to="/cards" className="block px-6 py-3 hover:bg-gray-600">Cards</Link>
                    <Link to="/wiki" className="block px-6 py-3 hover:bg-gray-600">Wiki</Link>
                </motion.div>
            )}
        </nav>
    );
}
