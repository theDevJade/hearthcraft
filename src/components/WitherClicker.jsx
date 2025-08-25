// src/components/WitherClicker.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setCookie, getCookieJSON, getLocalJSON, setLocalJSON } from '@/utils/cookies.js';
import gameCards from '@/data/gameCards.json';
import communityCards from '@/data/communityCards.json';

const rarityWeights = { common: 45, uncommon: 30, rare: 15, epic: 8, legendary: 2 };
const rarityCps =      { common: 0.2, uncommon: 0.4, rare: 0.8, epic: 1.6, legendary: 3.2 };

const upgradesList = [
    { id: 'coal', name: 'Coal', baseCost: 10,  inc: 1 },
    { id: 'char', name: 'Charcoal', baseCost: 50, inc: 5 },
    { id: 'blaze', name: 'Blaze Rod', baseCost: 200, inc: 20 },
    { id: 'nether_quartz', name: 'Nether Quartz', baseCost: 800, inc: 60 },
    { id: 'redstone_block', name: 'Redstone Block', baseCost: 2500, inc: 180 },
    { id: 'diamond', name: 'Diamond', baseCost: 6000, inc: 400 },
    { id: 'netherite', name: 'Netherite Ingot', baseCost: 20000, inc: 1400 },
];
const autosList = [
    { id: 'spark', name: 'Spark', baseCost: 100, rate: 0.5 },
    { id: 'ember', name: 'Ember', baseCost: 500, rate: 2 },
    { id: 'furnace', name: 'Auto-Furnace', baseCost: 1800, rate: 6 },
    { id: 'smelter', name: 'Super Smelter', baseCost: 6000, rate: 20 },
    { id: 'wither_farm', name: 'Wither Farm', baseCost: 22000, rate: 70 },
    { id: 'blaze_factory', name: 'Blaze Factory', baseCost: 80000, rate: 220 },
    { id: 'hopper', name: 'Hopper Array', baseCost: 140000, rate: 400 },
    { id: 'beacon', name: 'Beacon', baseCost: 260000, rate: 700 },
    { id: 'ender_port', name: 'Ender Port', baseCost: 420000, rate: 1100 },
    { id: 'quantum', name: 'Quantum Minecart', baseCost: 780000, rate: 2000 },
];

let achieveDefs = [
    { id: 'first10', name: 'Sprout', desc: 'Collect 10 roses', type: 'score', goal: 10 },
    { id: 'first100', name: 'Bloom', desc: 'Collect 100 roses', type: 'score', goal: 100 },
    { id: 'first1k', name: 'Bloom II', desc: 'Collect 1,000 roses', type: 'score', goal: 1000 },
    { id: 'first10k', name: 'Bloom III', desc: 'Collect 10,000 roses', type: 'score', goal: 10000 },
    { id: 'click100', name: 'Tapper I', desc: 'Click 100 times', type: 'clicks', goal: 100 },
    { id: 'click1k', name: 'Tapper II', desc: 'Click 1,000 times', type: 'clicks', goal: 1000 },
    { id: 'passive100', name: 'Idle I', desc: 'Earn 100 passively', type: 'passive', goal: 100 },
    { id: 'passive5k', name: 'Idle II', desc: 'Earn 5,000 passively', type: 'passive', goal: 5000 },
    { id: 'burnhot', name: 'Running Hot', desc: 'Reach heat level 50+', type: 'heat_peak', goal: 50 },
    { id: 'cooloff', name: 'Cool Off', desc: 'Reduce heat to 0 from 80+', type: 'cool', goal: 1 },
    { id: 'firstLegend', name: 'Shiny!', desc: 'Draw a legendary card', type: 'legend', goal: 1 },
    { id: 'collector10', name: 'Collector I', desc: 'Own 10 card copies', type: 'collection', goal: 10 },
    { id: 'collector50', name: 'Collector II', desc: 'Own 50 card copies', type: 'collection', goal: 50 },
    { id: 'autos5', name: 'Automation I', desc: 'Own 5 automations', type: 'autos', goal: 5 },
    { id: 'autos15', name: 'Automation II', desc: 'Own 15 automations', type: 'autos', goal: 15 },
    { id: 'upgrade5', name: 'Upgrade I', desc: 'Buy 5 upgrades', type: 'upgrades', goal: 5 },
    { id: 'upgrade15', name: 'Upgrade II', desc: 'Buy 15 upgrades', type: 'upgrades', goal: 15 },
    { id: 'prestige1', name: 'Reborn', desc: 'Prestige once', type: 'prestige', goal: 1 },
    { id: 'prestige3', name: 'Phoenix', desc: 'Prestige three times', type: 'prestige', goal: 3 },
    { id: 'frenzy', name: 'Frenzied', desc: 'Trigger a Frenzy', type: 'frenzy', goal: 1 },
    { id: 'golden', name: 'Golden Touch', desc: 'Click a Golden Rose', type: 'golden', goal: 1 },
    { id: 'packs10', name: 'Pack Opener I', desc: 'Open 10 packs', type: 'packs', goal: 10 },
    { id: 'packs50', name: 'Pack Opener II', desc: 'Open 50 packs', type: 'packs', goal: 50 },
    { id: 'melt', name: 'Melt Down', desc: 'Survive an overheat meltdown', type: 'meltdown', goal: 1 },
];

achieveDefs = achieveDefs.concat([
    { id: 'score50k', name: 'Garden I', desc: 'Total 50,000 roses', type: 'score', goal: 50000 },
    { id: 'score250k', name: 'Garden II', desc: 'Total 250,000 roses', type: 'score', goal: 250000 },
    { id: 'score1m', name: 'Garden III', desc: 'Total 1,000,000 roses', type: 'score', goal: 1000000 },
    { id: 'click10k', name: 'Tapper III', desc: 'Click 10,000 times', type: 'clicks', goal: 10000 },
    { id: 'passive50k', name: 'Idle III', desc: 'Earn 50,000 passively', type: 'passive', goal: 50000 },
    { id: 'autos25', name: 'Automation III', desc: 'Own 25 automations', type: 'autos', goal: 25 },
    { id: 'upgrades30', name: 'Upgrade III', desc: 'Buy 30 upgrades', type: 'upgrades', goal: 30 },
    { id: 'prestige5', name: 'Phoenix II', desc: 'Prestige five times', type: 'prestige', goal: 5 },
    { id: 'packs100', name: 'Pack Master', desc: 'Open 100 packs', type: 'packs', goal: 100 },
    { id: 'meltdown3', name: 'Fire Walker', desc: 'Survive 3 meltdowns', type: 'meltdown', goal: 3 },
    { id: 'legend3', name: 'Shinier!', desc: 'Own 3 legendaries', type: 'legend_multi', goal: 3 },
    { id: 'night5', name: 'Night Owl', desc: 'Play at night 5 minutes', type: 'play_night', goal: 300 },
    { id: 'play30', name: 'Session I', desc: 'Play 30 minutes total', type: 'play_time', goal: 1800 },
    { id: 'frenzy5', name: 'Hype Train', desc: 'Trigger 5 Frenzies', type: 'frenzy_count', goal: 5 },
    { id: 'golden5', name: 'Alchemist', desc: 'Click 5 Golden Roses', type: 'golden_count', goal: 5 },
    { id: 'heat0', name: 'Chill', desc: 'Keep heat under 10 for 60s', type: 'chill', goal: 60 },
    { id: 'beacon1', name: 'Beacon Online', desc: 'Buy a Beacon', type: 'own_auto', goal: 'beacon' },
    { id: 'quantum1', name: 'Quantum Leap', desc: 'Buy a Quantum Minecart', type: 'own_auto', goal: 'quantum' },
    { id: 'combo', name: 'Combo!', desc: 'Click 20 times in 5s', type: 'combo', goal: 20 },
]);

const COOKIE_KEY = 'wither_clicker_state_v1';

export default function WitherClicker({ onClose }) {
    const [score, setScore] = useState(0);
    const [clickPower, setClickPower] = useState(1);
    const [upgrades, setUpgrades] = useState({});
    const [autos, setAutos] = useState({});
    const [cards, setCards] = useState({});
    const [heat, setHeat] = useState(0);
    const [achievements, setAchievements] = useState({});
    const [prestige, setPrestige] = useState(0);
    const [tab, setTab] = useState('shop');
    const [stats, setStats] = useState({ clicks: 0, passive: 0, heatPeak: 0, cooled: false, upgrades: 0, autos: 0, legends: 0, packs: 0, meltdowns: 0 });
    const [frenzy, setFrenzy] = useState({ active: false, until: 0 });
    const [golden, setGolden] = useState(null);
    const [floaters, setFloaters] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [reveal, setReveal] = useState(null);
    const [maintenance, setMaintenance] = useState({});
    const [overheat, setOverheat] = useState({ active: false, until: 0 });
    const [autoTip, setAutoTip] = useState(null);

    const multiplier = useMemo(() => 1 + prestige * 0.2, [prestige]);

    const dbPool = useMemo(() => {
        const normalize = (c, source) => {
            const rarity = String(c.rarity || 'common').toLowerCase();
            const mana = Number(c.mana || 0);
            const cps = (rarityCps[rarity] || 0.2) + Math.max(0, mana) * 0.05;
            const key = `${source}_${c.id}:${rarity}`;
            return { key, name: c.name, rarity, cps };
        };
        return [
            ...gameCards.map(c => normalize(c, 'g')),
            ...communityCards.map(c => normalize(c, 'c')),
        ];
    }, []);

    useEffect(() => {
        const saved = getLocalJSON(COOKIE_KEY, null) ?? getCookieJSON(COOKIE_KEY, null);
        if (saved) {
            setScore(saved.score || 0);
            setClickPower(saved.clickPower || 1);
            setUpgrades(saved.upgrades || {});
            setAutos(saved.autos || {});
            setCards(saved.cards || {});
            setHeat(saved.heat || 0);
            setAchievements(saved.achievements || {});
            setPrestige(saved.prestige || 0);
            if (saved.stats) setStats(saved.stats);
            if (saved.frenzy) setFrenzy(saved.frenzy);
            if (saved.maintenance) setMaintenance(saved.maintenance);
        }
    }, []);
    useEffect(() => {
        const iv = setInterval(() => {
            const payload = { score, clickPower, upgrades, autos, cards, heat, achievements, prestige, stats, frenzy, maintenance };
            setLocalJSON(COOKIE_KEY, payload);
            setCookie(COOKIE_KEY, payload, 365);
        }, 1000);
        return () => clearInterval(iv);
    }, [score, clickPower, upgrades, autos, cards, heat, achievements, prestige, stats, frenzy, maintenance]);

    const night = useMemo(() => {
        const h = new Date().getHours();
        return h >= 20 || h < 6;
    }, []);
    const frenzyMult = frenzy.active ? 2 : 1;

    useEffect(() => {
        const iv = setInterval(() => {
            if ((autos.smelter || 0) > 0 && Math.random() < 0.1) {
                const until = Date.now() + 10000;
                setMaintenance(m => ({ ...m, smelter: until }));
                pushToast('Smelter maintenance: -Smelter CPS 10s');
            }
        }, 12000);
        return () => clearInterval(iv);
    }, [autos.smelter]);

    useEffect(() => {
        const iv = setInterval(() => {
            const qty = autos.wither_farm || 0;
            if (qty > 0) {
                const gain = qty * 5 * multiplier;
                setScore(s => s + gain);
                setStats(st => ({ ...st, passive: st.passive + gain }));
                pushToast(`Wither spike +${gain}`);
            }
        }, 7000);
        return () => clearInterval(iv);
    }, [autos.wither_farm, multiplier]);

    useEffect(() => {
        const iv = setInterval(() => {
            const qty = autos.blaze_factory || 0;
            if (qty > 0) setHeat(h => Math.min(100, h + Math.min(1.5, qty * 0.15)));
        }, 1500);
        return () => clearInterval(iv);
    }, [autos.blaze_factory]);

    useEffect(() => {
        const iv = setInterval(() => {
            const cool = 4 + Math.min(6, (autos.furnace || 0) * 0.5);
            setHeat(h => Math.max(0, h - cool));
        }, 1000);
        return () => clearInterval(iv);
    }, [autos.furnace]);

    useEffect(() => {
        if (!overheat.active && heat >= 99) {
            const until = Date.now() + 8000;
            setOverheat({ active: true, until });
            setTimeout(() => setOverheat({ active: false, until: 0 }), 8000);
            setStats(st => ({ ...st, meltdowns: (st.meltdowns || 0) + 1 }));
            pushToast('Overheat meltdown! Passive -50% for 8s');
        }
    }, [heat, overheat.active]);

    const passiveRateBase = useMemo(() => {
        const autosRate = Object.entries(autos).reduce((sum, [id, qty]) => {
            const def = autosList.find(a => a.id === id);
            if (!def) return sum;
            const maintPenalty = id === 'smelter' && maintenance.smelter && maintenance.smelter > Date.now() ? 0 : 1;
            return sum + def.rate * qty * maintPenalty;
        }, 0);
        const cardsRate = Object.entries(cards).reduce((sum, [key, qty]) => {
            const def = dbPool.find(c => c.key === key);
            return sum + (def ? def.cps * qty : 0);
        }, 0);
        return autosRate + cardsRate;
    }, [autos, cards, dbPool, maintenance]);

    const passiveRate = useMemo(() => {
        let total = passiveRateBase * multiplier;
        const penaltyHeat = heat > 40 ? Math.max(0.5, 1 - (heat - 40) / 120) : 1;
        const nightBonus = night ? 1.1 : 1;
        const frenzyBonus = frenzyMult;
        const overheatPenalty = overheat.active ? 0.5 : 1;
        return total * penaltyHeat * nightBonus * frenzyBonus * overheatPenalty;
    }, [passiveRateBase, multiplier, heat, night, frenzyMult, overheat.active]);

    const packCost = useMemo(() => {
        // Scale with current income and progression; stays affordable but relevant
        const base = passiveRate * 30 + clickPower * 5;
        const scaled = Math.max(75, Math.floor(base * (1 + prestige * 0.1)));
        // Quantum Minecart discounts up to 50%
        const q = autos.quantum || 0;
        const discount = 1 - Math.min(0.5, q * 0.03);
        const scaledDiscounted = Math.floor(scaled * discount);
        // Cap so it's never more than 5% of current score (when rich)
        const cap = Math.max(75, Math.floor((score * 0.05) || 0));
        return Math.min(scaledDiscounted, cap > 0 ? cap : scaledDiscounted);
    }, [passiveRate, clickPower, prestige, score, autos.quantum]);

    useEffect(() => {
        const iv = setInterval(() => {
            const earned = passiveRate;
            setScore(s => s + earned);
            setStats(st => ({ ...st, passive: st.passive + earned }));
        }, 1000);
        return () => clearInterval(iv);
    }, [passiveRate]);

    useEffect(() => {
        const iv = setInterval(() => {
            const enderBonus = Math.min(0.27, (autos.ender_port || 0) * 0.01);
            const chance = 0.08 + enderBonus;
            if (Math.random() < chance && !golden) {
                setGolden({ x: Math.random() * 90 + 5, y: Math.random() * 40 + 10, until: Date.now() + 2500 });
                setTimeout(() => setGolden(null), 2600);
            }
        }, 3000);
        return () => clearInterval(iv);
    }, [golden, autos.ender_port]);

    const startFrenzy = () => {
        setFrenzy({ active: true, until: Date.now() + 8000 });
        setTimeout(() => setFrenzy({ active: false, until: 0 }), 8000);
        setStats(st => ({ ...st, frenzy: (st.frenzy || 0) + 1 }));
        pushToast('Frenzy! x2 for 8s');
    };

    const handleGoldenClick = () => {
        if (!golden) return;
        setGolden(null);
        setScore(s => s + 250 * multiplier);
        setStats(st => ({ ...st, golden: (st.golden || 0) + 1 }));
        pushToast('Golden Rose! +250');
    };

    useEffect(() => {
        setStats(st => ({ ...st, heatPeak: Math.max(st.heatPeak || 0, heat) }));
        if ((stats.heatPeak || 0) >= 80 && heat === 0 && !stats.cooled) {
            setStats(st => ({ ...st, cooled: true }));
        }
    }, [heat]);

    const pushToast = (msg) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(t => [...t, { id, msg }]);
        setTimeout(() => {
            setToasts(t => t.filter(x => x.id !== id));
        }, 4000);
    };

    const buyUpgrade = (u) => {
        const owned = upgrades[u.id] || 0;
        const cost = Math.floor(u.baseCost * Math.pow(1.25, owned));
        if (score >= cost) {
            setScore(s => s - cost);
            setUpgrades(prev => ({ ...prev, [u.id]: owned + 1 }));
            setClickPower(p => p + u.inc);
            setStats(st => ({ ...st, upgrades: st.upgrades + 1 }));
            pushToast(`Bought ${u.name} (+${u.inc}/click)`);
        }
    };

    const buyAuto = (a) => {
        const owned = autos[a.id] || 0;
        const cost = Math.floor(a.baseCost * Math.pow(1.3, owned));
        if (score >= cost) {
            setScore(s => s - cost);
            setAutos(prev => ({ ...prev, [a.id]: owned + 1 }));
            setStats(st => ({ ...st, autos: st.autos + 1 }));
            pushToast(`Hired ${a.name} (+${a.rate}/s)`);
        }
    };

    const rollCard = () => {
        const cost = packCost;
        if (score < cost || reveal) return;
        setScore(s => s - cost);
        const bag = [];
        dbPool.forEach(c => {
            const w = rarityWeights[c.rarity] || 1;
            for (let i = 0; i < w; i++) bag.push(c);
        });
        const pick = bag[Math.floor(Math.random() * bag.length)];
        setReveal({ stage: 'pack', card: pick });
        setTimeout(() => {
            setReveal({ stage: 'flip', card: pick });
            setCards(prev => ({ ...prev, [pick.key]: (prev[pick.key] || 0) + 1 }));
            setStats(st => ({ ...st, packs: (st.packs || 0) + 1 }));
            pushToast(`Card: ${pick.name} [${pick.rarity}] (+${pick.cps.toFixed(2)}/s)`);
            setTimeout(() => setReveal(null), 900);
        }, 900);
    };

    const handleClick = (e) => {
        const sparkCritBonus = Math.min(0.15, (autos.spark || 0) * 0.002);
        const emberMult = 1 + Math.min(0.5, (autos.ember || 0) * 0.005);
        const hopperChance = Math.min(0.35, (autos.hopper || 0) * 0.02);
        const critBase = Math.min(0.35, 0.05 + heat / 400 + sparkCritBonus) + ((upgrades.diamond || 0) * 0.002);
        const crit = Math.random() < critBase;
        const gain = clickPower * (crit ? 2 : 1) * emberMult * multiplier * frenzyMult * (night ? 1.1 : 1);
        const hopperProc = Math.random() < hopperChance;
        const extraFromHopper = hopperProc ? gain : 0;
        const id = Math.random().toString(36).slice(2);
        const rect = e.currentTarget.getBoundingClientRect();
        const jitterX = (Math.random() - 0.5) * 40;
        const jitterY = (Math.random() - 0.5) * 16;
        const x = rect.width / 2 + jitterX;
        const y = rect.height / 2 + jitterY;
        setFloaters(f => [...f, { id, text: `+${Math.floor(gain + extraFromHopper)}${crit ? '!!' : ''}${hopperProc ? ' (H)' : ''}`, x, y }]);
        setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== id)), 900);
        setScore(s => s + gain + extraFromHopper);
        const heatReduction = Math.min(1.5, (autos.beacon || 0) * 0.2);
        setHeat(h => Math.min(100, h + 2 - heatReduction));
        setStats(st => ({ ...st, clicks: (st.clicks || 0) + 1 }));
        if (crit) pushToast('Critical!');
        if (hopperProc) pushToast('Hopper duplicated your click!');
    };

    useEffect(() => {
        const progress = (def) => {
            switch (def.type) {
                case 'score': return Math.min(1, score / def.goal);
                case 'clicks': return Math.min(1, (stats.clicks || 0) / def.goal);
                case 'passive': return Math.min(1, (stats.passive || 0) / def.goal);
                case 'heat_peak': return Math.min(1, (stats.heatPeak || 0) / def.goal);
                case 'cool': return stats.cooled ? 1 : 0;
                case 'legend': return Object.keys(cards).some(k => k.includes(':legendary')) ? 1 : 0;
                case 'collection': return Math.min(1, Object.values(cards).reduce((a,b)=>a+(b||0),0) / def.goal);
                case 'autos': return Math.min(1, Object.values(autos).reduce((a,b)=>a+(b||0),0) / def.goal);
                case 'upgrades': return Math.min(1, (stats.upgrades || 0) / def.goal);
                case 'prestige': return Math.min(1, prestige / def.goal);
                case 'frenzy': return (stats.frenzy || 0) >= def.goal ? 1 : 0;
                case 'golden': return (stats.golden || 0) >= def.goal ? 1 : 0;
                case 'packs': return Math.min(1, (stats.packs || 0) / def.goal);
                case 'meltdown': return (stats.meltdowns || 0) >= def.goal ? 1 : 0;
                default: return 0;
            }
        };
        const toUnlock = achieveDefs.filter(a => !achievements[a.id] && progress(a) >= 1);
        if (toUnlock.length) {
            setAchievements(prev => {
                const next = { ...prev };
                toUnlock.forEach(a => { next[a.id] = true; });
                return next;
            });
            toUnlock.forEach(a => pushToast(`Achievement: ${a.name}`));
        }
    }, [score, stats, cards, autos, achievements, prestige]);

    const canPrestige = useMemo(() => score >= 5000 || Object.values(cards).reduce((a,b)=>a+(b||0),0) >= 50, [score, cards]);
    const doPrestige = () => {
        if (!canPrestige) return;
        setPrestige(p => p + 1);
        setScore(0);
        setClickPower(1);
        setUpgrades({});
        setAutos({});
        setCards({});
        setHeat(0);
        pushToast('Prestiged! +20% global multiplier');
    };

    const followerUnits = useMemo(() => {
        const units = [];
        const entries = Object.entries(autos);
        let count = 0;
        entries.forEach(([id, qty]) => {
            for (let i = 0; i < qty; i++) {
                units.push({ id: `${id}_${i}`, type: id });
                count++;
                if (count >= 48) break;
            }
        });
        return units;
    }, [autos]);

    const shake = heat >= 60 ? { rotate: [-0.4, 0.4, -0.2, 0.2, 0], transition: { duration: 0.3, ease: 'easeInOut' } } : {};

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 space-y-3 z-50">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div key={t.id} initial={{ y: -10, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="px-4 py-2.5 rounded bg-gray-800 border border-gray-700 text-base text-gray-100 shadow-lg">
                            {t.msg}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="bg-gray-900 border border-gray-700 rounded-2xl w-[min(98vw,1200px)] h-[min(92vh,820px)] p-6 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button className={`px-3 py-1.5 rounded ${tab==='shop'?'bg-gray-800':'bg-gray-700'}`} onClick={()=>setTab('shop')}>Play</button>
                        <button className={`px-3 py-1.5 rounded ${tab==='ach'?'bg-gray-800':'bg-gray-700'}`} onClick={()=>setTab('ach')}>Achievements</button>
                    </div>
                    <div className="flex items-center gap-3">
                        {frenzy.active ? <span className="text-yellow-300 text-sm">Frenzy x2</span> : <button onClick={startFrenzy} className="text-sm bg-yellow-700 hover:bg-yellow-600 px-2 py-1 rounded" title="Double income for a short time">Trigger Frenzy</button>}
                        {night && <span className="text-blue-300 text-sm">Night +10%</span>}
                        {overheat.active && <span className="text-red-300 text-sm">Overheat!</span>}
                        <button onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
                    </div>
                </div>

                {tab === 'shop' && (
                    <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                        {/* left: automation panel */}
                        <div className="col-span-3 bg-gray-800 rounded-lg p-4 overflow-auto custom-scrollbar">
                            <div className="mb-2 text-gray-300 font-semibold">Automation</div>
                            <div className="grid grid-cols-1 gap-2 mb-1">
                                {autosList.map(a => {
                                    const owned = autos[a.id] || 0;
                                    const cost = Math.floor(a.baseCost * Math.pow(1.3, owned));
                                    const maint = a.id === 'smelter' && maintenance.smelter && maintenance.smelter > Date.now();
                                    let effect = '';
                                    switch (a.id) {
                                        case 'spark': effect = 'Small crit chance boost to clicks'; break;
                                        case 'ember': effect = 'Clicks earn slightly more'; break;
                                        case 'furnace': effect = 'Cools heat faster'; break;
                                        case 'smelter': effect = maint ? 'Under maintenance: output halted' : 'Steady passive income'; break;
                                        case 'wither_farm': effect = 'Periodic wither spikes'; break;
                                        case 'blaze_factory': effect = 'Raises heat over time'; break;
                                        case 'hopper': effect = 'Chance to duplicate click'; break;
                                        case 'beacon': effect = 'Reduces heat gained on clicks'; break;
                                        case 'ender_port': effect = 'More Golden Rose spawns'; break;
                                        case 'quantum': effect = 'Card packs cost less'; break;
                                        default: effect = '';
                                    }
                                    const tipTitle = a.name;
                                    const tipBody = `${maint ? 'Under maintenance: output halted' : `+${a.rate}/s`} • ${effect}`;
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => buyAuto(a)}
                                            className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-md px-3 py-2 flex items-center justify-between"
                                            onMouseEnter={(e) => setAutoTip({ title: tipTitle, body: tipBody, x: e.clientX + 12, y: e.clientY + 12 })}
                                            onMouseMove={(e) => setAutoTip(prev => prev ? { ...prev, x: e.clientX + 12, y: e.clientY + 12 } : null)}
                                            onMouseLeave={() => setAutoTip(null)}
                                        >
                                            <span>{a.name}{maint && <span className="ml-2 text-xs text-yellow-300">Maint</span>}</span>
                                            <span className="text-sm text-gray-300">{cost} 🌹 | {owned}x</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* center: clicker arena with followers */}
                        <div className="col-span-6 bg-gray-800/60 rounded-xl p-4 relative overflow-hidden">
                            {golden && (
                                <motion.div onClick={handleGoldenClick} className="absolute cursor-pointer" style={{ left: `${golden.x}%`, top: `${golden.y}%` }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} title="Golden Rose: instant roses">
                                    🌟
                                </motion.div>
                            )}
                            {/* follower orbit overlay */}
                            <motion.div className="absolute inset-0 pointer-events-none" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 50, ease: 'linear' }}>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[260px] rounded-full border border-gray-700/50" />
                                {followerUnits.length === 0 && (
                                    <div className="absolute left-1/2 top-[58%] -translate-x-1/2 text-xs text-gray-500">Buy automation to add followers</div>
                                )}
                                {followerUnits.map((u, idx) => {
                                    const total = Math.max(1, followerUnits.length);
                                    const angle = (idx / total) * Math.PI * 2;
                                    const radiusX = 125;
                                    const radiusY = 75;
                                    const x = 50 + (Math.cos(angle) * radiusX) / 2.4;
                                    const y = 50 + (Math.sin(angle) * radiusY) / 3.8;
                                    const icon = u.type === 'spark' ? '✨' : u.type === 'ember' ? '🔥' : u.type === 'furnace' ? '🧱' : u.type === 'smelter' ? '⚙️' : u.type === 'wither_farm' ? '💀' : '🏭';
                                    const tip = u.type.replace('_', ' ');
                                    return (
                                        <div key={u.id} className="absolute text-base opacity-80" style={{ left: `${x}%`, top: `${y}%` }} title={tip}>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </motion.div>
                            <div className="flex items-center justify-center h-full">
                                <motion.button whileTap={{ scale: 0.98 }} animate={shake} onClick={handleClick} className="relative w-[440px] max-w-full aspect-square rounded-full bg-gradient-to-br from-green-700 to-green-500 shadow-xl flex flex-col items-center justify-center text-white select-none" title="Click to collect roses">
                                    <div className="text-5xl font-extrabold">{Math.floor(score)}</div>
                                    <div className="mt-1 text-sm opacity-90">roses</div>
                                    <div className="mt-1 text-xs opacity-90">+{passiveRate.toFixed(1)}/s passive</div>
                                    <div className="absolute inset-0 pointer-events-none">
                                        <AnimatePresence>
                                            {floaters.map(f => (
                                                <motion.span key={f.id} className="absolute text-yellow-300 text-sm font-bold drop-shadow" initial={{ x: f.x, y: f.y, opacity: 0 }} animate={{ y: f.y - 28, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: [0.22,1,0.36,1] }}>
                                                    {f.text}
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>
                            </div>
                            <div className="absolute left-4 right-4 bottom-4">
                                <div className="text-sm text-gray-300">Heat: {Math.round(heat)}/100</div>
                                <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                                    <motion.div className="h-full bg-orange-500" animate={{ width: `${heat}%` }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} />
                                </div>
                            </div>
                            <div className="absolute left-4 right-4 top-4 bg-gray-900/50 rounded-lg p-2">
                                <div className="text-xs text-gray-400">Collection</div>
                                <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
                                    {Object.keys(cards).length === 0 && (
                                        <div className="text-xs text-gray-500">No cards yet. Draw some packs!</div>
                                    )}
                                    {Object.entries(cards).slice(0, 20).map(([key, qty]) => {
                                        const def = dbPool.find(c => c.key === key);
                                        if (!def) return null;
                                        return (
                                            <div key={key} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 whitespace-nowrap" title={`${def.name} [${def.rarity}] x${qty}`}>
                                                {def.name} <span className="text-gray-400">[{def.rarity}]</span> ×{qty}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* right: upgrades, booster, prestige */}
                        <div className="col-span-3 grid grid-rows-[auto_auto_auto_1fr] gap-4 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="mb-2 text-gray-300 font-semibold">Upgrades</div>
                                <div className="grid grid-cols-1 gap-2">
                                    {upgradesList.map(u => {
                                        const owned = upgrades[u.id] || 0;
                                        const cost = Math.floor(u.baseCost * Math.pow(1.25, owned));
                                        return (
                                            <button key={u.id} onClick={() => buyUpgrade(u)} className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-md px-3 py-2 flex items-center justify-between" title={`+${u.inc}/click`}>
                                                <span>{u.name}</span>
                                                <span className="text-sm text-gray-300">{cost} 🌹 | {owned}x</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="mb-2 text-gray-300 font-semibold">Card Booster</div>
                                <button onClick={rollCard} className="w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-md" title="Open a random card from the database">Draw Random Card ({packCost} 🌹)</button>
                                <div className="mt-2 text-xs text-gray-400">Scales with your income.</div>
                            </div>

                            <div className="bg-gray-800 rounded-lg p-4">
                                <div className="text-gray-300 font-semibold">Prestige</div>
                                <div className="text-sm text-gray-400 mb-2">Resets progress for +20% multiplier (x{multiplier.toFixed(2)}).</div>
                                <button onClick={doPrestige} disabled={!canPrestige} className={`w-full px-3 py-2 rounded-md ${canPrestige ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-700 cursor-not-allowed'} text-white`}>
                                    {canPrestige ? 'Prestige Now' : 'Need 5000 roses or 50 cards'}
                                </button>
                            </div>

                            {/* Tips panel removed per request */}
                        </div>
                    </div>
                )}

                {tab === 'ach' && (
                    <div className="flex-1 overflow-auto grid grid-cols-1 gap-2 pr-1">
                        {achieveDefs.map(a => {
                            const prog = (() => {
                                switch (a.type) {
                                    case 'score': return Math.min(1, score / a.goal);
                                    case 'clicks': return Math.min(1, (stats.clicks || 0) / a.goal);
                                    case 'passive': return Math.min(1, (stats.passive || 0) / a.goal);
                                    case 'heat_peak': return Math.min(1, (stats.heatPeak || 0) / a.goal);
                                    case 'cool': return stats.cooled ? 1 : 0;
                                    case 'legend': return Object.keys(cards).some(k => k.includes(':legendary')) ? 1 : 0;
                                    case 'collection': return Math.min(1, Object.values(cards).reduce((x,y)=>x+(y||0),0) / a.goal);
                                    case 'autos': return Math.min(1, Object.values(autos).reduce((x,y)=>x+(y||0),0) / a.goal);
                                    case 'upgrades': return Math.min(1, (stats.upgrades || 0) / a.goal);
                                    case 'prestige': return Math.min(1, prestige / a.goal);
                                    case 'frenzy': return (stats.frenzy || 0) >= a.goal ? 1 : 0;
                                    case 'golden': return (stats.golden || 0) >= a.goal ? 1 : 0;
                                    case 'packs': return Math.min(1, (stats.packs || 0) / a.goal);
                                    case 'meltdown': return (stats.meltdowns || 0) >= a.goal ? 1 : 0;
                                    default: return 0;
                                }
                            })();
                            const pct = Math.floor(prog * 100);
                            const unlocked = achievements[a.id];
                            return (
                                <div key={a.id} className={`p-3 rounded border ${unlocked ? 'bg-green-900/30 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <div className="font-medium">{a.name}</div>
                                            <div className="text-xs text-gray-400">{a.desc}</div>
                                        </div>
                                        <div className={`text-xs ${unlocked ? 'text-green-300' : 'text-gray-400'}`}>{unlocked ? 'Unlocked' : `${pct}%`}</div>
                                    </div>
                                    {!unlocked && (
                                        <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                                            <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <AnimatePresence>
                    {reveal && (
                        <motion.div className="absolute inset-0 flex items-center justify-center bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }} className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center shadow-xl">
                                {reveal.stage === 'pack' && <div className="text-xl">✨ A mysterious pack appears...</div>}
                                {reveal.stage === 'flip' && <div className="text-xl">🎴 {reveal.card.name}</div>}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            {/* Automation tooltip overlay */}
            {autoTip && (
                <div
                    className="pointer-events-none fixed"
                    style={{ left: autoTip.x, top: autoTip.y, zIndex: 1000 }}
                >
                    <div className="bg-gray-900/95 border border-purple-700 rounded-md px-3 py-2 shadow-xl min-w-[220px]">
                        <div className="text-sm font-semibold text-gray-100">{autoTip.title}</div>
                        <div className="text-xs text-gray-300 mt-0.5">{autoTip.body}</div>
                    </div>
                </div>
            )}
        </div>
    );
} 