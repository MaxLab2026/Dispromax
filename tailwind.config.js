/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',   // Azul profesional
        secondary: '#f59e0b', // Naranja para acentos
      }
    }
  },
  plugins: []
}
