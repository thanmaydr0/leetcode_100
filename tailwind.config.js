/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                forge: {
                    black: '#0a0a0a',
                    dark: '#111111',
                    gray: '#1a1a1a',
                    muted: '#222222',
                    border: '#2a2a2a',
                    text: '#888888',
                    light: '#cccccc',
                    green: '#00ff41',
                    'green-dim': '#00cc33',
                    amber: '#ffb000',
                    'amber-dim': '#cc8c00',
                    red: '#ff3333',
                    'red-dim': '#cc2929',
                    blue: '#00bfff',
                    'blue-dim': '#0099cc',
                    cyan: '#00ffff',
                    purple: '#bf5af2',
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'blink': 'blink 1s step-end infinite',
                'scanline': 'scanline 8s linear infinite',
                'fadeIn': 'fadeIn 0.3s ease-out',
                'slideUp': 'slideUp 0.3s ease-out',
                'slideIn': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                'blink': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                'scanline': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                'fadeIn': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slideUp': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slideIn': {
                    '0%': { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
            boxShadow: {
                'glow-green': '0 0 10px rgba(0, 255, 65, 0.3), 0 0 20px rgba(0, 255, 65, 0.1)',
                'glow-amber': '0 0 10px rgba(255, 176, 0, 0.3), 0 0 20px rgba(255, 176, 0, 0.1)',
                'glow-red': '0 0 10px rgba(255, 51, 51, 0.3), 0 0 20px rgba(255, 51, 51, 0.1)',
                'glow-blue': '0 0 10px rgba(0, 191, 255, 0.3), 0 0 20px rgba(0, 191, 255, 0.1)',
            },
        },
    },
    plugins: [],
}
