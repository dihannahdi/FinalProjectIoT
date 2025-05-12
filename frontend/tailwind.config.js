module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Custom colors can be added here if needed
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  variants: {
    extend: {
      brightness: ['hover', 'active'],
      scale: ['active', 'hover'],
      opacity: ['disabled'],
    },
  },
  plugins: [],
} 