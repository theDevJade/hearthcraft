// src/components/ScoreNumber.jsx
import React, { useState, useEffect } from 'react';

export const ScoreNumber = ({ number }) => {
    const [displayNumber, setDisplayNumber] = useState(0);

    useEffect(() => {
        const duration = 1500;
        const steps = 30;
        const increment = number / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                setDisplayNumber(number);
                clearInterval(timer);
            } else {
                setDisplayNumber(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [number]);

    return (
        <span className="font-mono text-green-400 animate-glow tracking-wider">
      {displayNumber.toLocaleString()}
    </span>
    );
};
