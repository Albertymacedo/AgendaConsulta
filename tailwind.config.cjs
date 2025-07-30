/** @type {import('tailwindcss').Config} */
module.exports = {
  //  tailwind escaneia as classes aqui para gerar o CSS
  content: [
    "./index.html",              
    "./src/**/*.{js,jsx,ts,tsx}", // todos os componentes React
  ],
  theme: { extend: {} },
  plugins: [],
};
