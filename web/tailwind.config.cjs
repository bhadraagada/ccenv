/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(217 15% 20%)',
        input: 'hsl(222 40% 10%)',
        ring: 'hsl(45 93% 47%)',
        background: 'hsl(222 47% 5%)',
        foreground: 'hsl(210 40% 98%)',
        primary: {
          DEFAULT: 'hsl(38 92% 54%)',
          foreground: 'hsl(222 47% 5%)',
        },
        secondary: {
          DEFAULT: 'hsl(222 40% 13%)',
          foreground: 'hsl(210 40% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(222 40% 13%)',
          foreground: 'hsl(215 20% 65%)',
        },
        card: {
          DEFAULT: 'hsl(222 47% 5%)',
          foreground: 'hsl(210 40% 98%)',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
}
