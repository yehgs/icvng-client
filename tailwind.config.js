/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Brand colours read CSS variables (RGB channels) so an active seasonal campaign can re-skin every
      // page. The fallback values are the original palette, so with no campaign nothing changes.
      // See src/utils/campaignTheme.js for how the variables are derived (with contrast guarantees).
      colors: {
        'primary-200': 'rgb(var(--brand-primary-200, 198 156 109) / <alpha-value>)', // Rich caramel (buttons, accents)
        'primary-100': 'rgb(var(--brand-primary-100, 217 168 124) / <alpha-value>)', // Light caramel (hover states, highlights)
        'secondary-200': 'rgb(var(--brand-secondary-200, 75 46 43) / <alpha-value>)', // Deep espresso brown (text, headers)
        'secondary-100': 'rgb(var(--brand-secondary-100, 109 76 65) / <alpha-value>)', // Mocha brown (UI elements)
        'background-100': 'rgb(var(--brand-background-100, 237 224 212) / <alpha-value>)', // Creamy latte (main background)
        'accent-100': 'rgb(var(--brand-accent-100, 155 34 38) / <alpha-value>)', // Coffee cherry red (call-to-action)
      },
    },
  },
  plugins: [],
};
