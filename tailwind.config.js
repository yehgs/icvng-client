/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-200': '#C69C6D', // Rich caramel (buttons, accents)
        'primary-100': '#D9A87C', // Light caramel (hover states, highlights)
        'secondary-200': '#4B2E2B', // Deep espresso brown (text, headers, strong accents)
        'secondary-100': '#6D4C41', // Mocha brown (UI elements, backgrounds)
        'background-100': '#EDE0D4', // Creamy latte (main background)
        'accent-100': '#9B2226', // Coffee cherry red (call-to-action, promotions)
      },
    },
  },
  plugins: [],
};
