/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        court:       '#1A6B4A',
        'court-dark':'#0D4A32',
        'court-light':'#2A8A5E',
        sky:         '#1E7BB5',
        gold:        '#F59E0B',
        silver:      '#94A3B8',
        bronze:      '#C2692A',
        danger:      '#DC2626',
        slate:       '#1E293B',
        muted:       '#64748B',
        line:        '#E2E8F0',
        bg:          '#F1F5F0',
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        sans:  ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
      },
    },
  },
  plugins: [],
}
