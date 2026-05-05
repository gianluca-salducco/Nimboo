import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        ink: '#1C1814',
        'ink-soft': '#3D3530',
        'ink-muted': '#8C7E75',
        terracotta: '#C4633A',
        'terracotta-light': '#E8845C',
        'terracotta-pale': '#F5E8E0',
        sage: '#7A9E8A',
        amber: '#D4963A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
