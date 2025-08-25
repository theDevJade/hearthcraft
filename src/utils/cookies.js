// src/utils/cookies.js
export function setCookie(name, value, days = 365) {
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        const val = encodeURIComponent(typeof value === 'string' ? value : JSON.stringify(value));
        document.cookie = `${name}=${val}; Expires=${expires}; Path=/; SameSite=Lax`;
    } catch {}
}

export function getCookie(name) {
    try {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1];
    } catch {
        return undefined;
    }
}

export function getCookieJSON(name, fallback) {
    const raw = getCookie(name);
    if (!raw) return fallback;
    try {
        const decoded = decodeURIComponent(raw);
        return JSON.parse(decoded);
    } catch {
        return fallback;
    }
}

export function deleteCookie(name) {
    document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
}

// Local storage helpers
export function setLocalJSON(key, value) {
    try {
        const str = JSON.stringify(value);
        window.localStorage.setItem(key, str);
    } catch {}
}

export function getLocalJSON(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
} 