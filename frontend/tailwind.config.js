/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bootcamp: {
          sidebar: '#083B50',
          primary: '#128293',
          background: '#F3F6F8',
          surface: '#FFFFFF',
          textDark: '#1F2937',
          textLight: '#9CA3AF'
        }
      }
    },
  },
  plugins: [],
};

export default config;
