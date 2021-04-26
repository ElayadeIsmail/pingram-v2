module.exports = {
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    animation: {
      'bounce-fast': 'bounce .3s infinite',
    },
    extend: {
      zIndex: {
        '-10': '-10',
      },
      spacing: {
        88: '22rem',
        22: '5.5rem',
        84: '21rem',
      },
      minHeight: {
        'full-min-nav': 'calc(100vh - 6.5rem)',
        32: '32rem',
      },
      height: {
        '9/10': '90%',
        99: '32rem',
      },
      inset: {
        '2/5': '36.3%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
