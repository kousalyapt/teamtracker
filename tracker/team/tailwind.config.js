/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto Condensed', 'sans-serif'], // Add the font here
      },
      spacing: {
        '100': '25rem',   // Custom padding for pl-100 (e.g., 400px)
        '120': '30rem',   // Custom padding for pl-120 (e.g., 480px)
        '140': '35rem',
        '160': '40rem'
        // Add more custom spacing values if needed
      }
    },
  },
  plugins: [],
}

