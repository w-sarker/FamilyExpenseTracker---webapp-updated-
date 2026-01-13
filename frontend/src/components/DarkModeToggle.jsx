import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const shape = document.getElementById('shape');

        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            if (shape) shape.classList.add('active');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            if (shape) shape.classList.remove('active');
        }
    }, [isDark]);

    return (
        <div
            onClick={() => setIsDark(!isDark)}
            className={`toggle-container ${isDark ? 'active' : ''}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <div className="toggle-circle">
                <i className="toggle-icon icon-moon">
                    <ion-icon name="cloudy-night-outline"></ion-icon>
                </i>
                <i className="toggle-icon icon-sun">
                    <ion-icon name="partly-sunny-outline"></ion-icon>
                </i>
            </div>
        </div>
    );
}
