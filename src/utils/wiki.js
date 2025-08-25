// src/utils/wiki.js
import wikiData from '@/data/wiki.json';

export function getWikiPages() {
    const pages = (wikiData && Array.isArray(wikiData.pages) ? wikiData.pages : []).map((raw) => {
        const contentArray = Array.isArray(raw.content) ? raw.content : (typeof raw.content === 'string' ? [raw.content] : []);
        const tagsArray = Array.isArray(raw.tags) ? raw.tags : [];
        return {
            id: String(raw.id ?? ''),
            title: String(raw.title ?? ''),
            summary: String(raw.summary ?? ''),
            content: contentArray,
            tags: tagsArray,
            md: raw.md ? String(raw.md) : undefined,
            searchText: [raw.title, raw.summary, contentArray.join(' '), tagsArray.join(' ')].filter(Boolean).join(' '),
        };
    });
    return pages;
}

export function getAllTags(pages) {
    const tagSet = new Set();
    pages.forEach(p => {
        (p.tags || []).forEach(t => tagSet.add(String(t)));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
} 