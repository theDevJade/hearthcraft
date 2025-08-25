// src/hooks/useFuzzySearch.js
import { useMemo } from 'react';
import Fuse from 'fuse.js';

export default function useFuzzySearch(items, searchTerm, options) {
    const fuse = useMemo(() => {
        const list = Array.isArray(items) ? items : [];
        const fuseOptions = {
            includeScore: true,
            threshold: 0.38,
            ignoreLocation: true,
            minMatchCharLength: 2,
            keys: [
                { name: 'title', weight: 0.5 },
                { name: 'summary', weight: 0.25 },
                { name: 'content', weight: 0.15 },
                { name: 'tags', weight: 0.1 },
            ],
            ...options,
        };
        return new Fuse(list, fuseOptions);
    }, [items, options]);

    const results = useMemo(() => {
        const q = (searchTerm || '').trim();
        if (!q) return [];
        try {
            return fuse.search(q).map(r => r.item);
        } catch (e) {
            return [];
        }
    }, [fuse, searchTerm]);

    return { results, fuse };
} 