import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'cat-orange': '#FF8C42',
        'cat-cream': '#FFF4E6',
        'cat-gray': '#8E8E93',
        'cat-dark': '#2C2C2E',
        'cat-light': '#F8F9FA',
        'cat-success': '#34D399',
        'cat-error': '#EF4444',
        'cat-warning': '#F59E0B',
      },
      fontFamily: {
        'kid-friendly': ['Comic Neue', 'Comic Sans MS', 'cursive'],
        'sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'cat-bounce': 'bounce 1s infinite',
        'paw-wiggle': 'wiggle 1s ease-in-out infinite',
        'cat-float': 'float 3s ease-in-out infinite',
        'cat-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        'cat': '20px',
        'cat-lg': '30px',
      },
      fontSize: {
        'cat-xl': ['2rem', { lineHeight: '2.5rem' }],
        'cat-2xl': ['2.5rem', { lineHeight: '3rem' }],
        'cat-3xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      spacing: {
        'cat': '1.25rem',
        'cat-lg': '2rem',
      },
      boxShadow: {
        'cat': '0 10px 25px -5px rgba(255, 140, 66, 0.3)',
        'cat-hover': '0 15px 35px -5px rgba(255, 140, 66, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;