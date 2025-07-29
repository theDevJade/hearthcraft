import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar              from '@/components/NavBar.jsx';
import HomePage            from '@/components/HomePage.jsx';
import HearthcraftViewer   from '@/components/CardViewer.jsx';
import WikiList            from '@/components/WikiList.jsx';
import WikiPage            from '@/components/WikiPage.jsx';

export default function App() {
    return (
        <Router>
            <Navbar />

            <Routes>
                {/* home */}
                <Route path="/" element={<HomePage />} />

                {/* your card viewer */}
                <Route path="/cards" element={<HearthcraftViewer />} />

                {/* wiki list + detail nested under /wiki */}
                <Route path="/wiki">
                    <Route index element={<WikiList />} />
                    <Route path=":id" element={<WikiPage />} />
                </Route>

                {/* catch‑all: redirect back home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
