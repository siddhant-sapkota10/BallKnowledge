/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bk: {
          ink: '#05080f',
          navy: '#08111f',
          panel: '#0d1828',
          line: '#203047',
          green: '#75f94c',
          cyan: '#31d7ff',
          red: '#ff4d61',
          cream: '#f4f7f2',
          muted: '#91a0b5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 35px rgba(117, 249, 76, 0.18)',
        panel: '0 24px 80px rgba(0, 0, 0, 0.42)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(49,215,255,.14), transparent 38%), radial-gradient(circle at 85% 75%, rgba(117,249,76,.08), transparent 30%)',
      },
    },
  },
  plugins: [],
}
