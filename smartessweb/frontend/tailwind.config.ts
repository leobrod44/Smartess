import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-sequel-sans)'],
        'sequel-sans-light': ['var(--font-sequel-sans-light-disp)'],
        'sequel-sans-regular': ['var(--font-sequel-sans-roman)'],
        'sequel-sans-medium': ['var(--font-sequel-sans-medium)'],
        'sequel-sans-bold': ['var(--font-sequel-sans-bold)'],
        'sequel-sans-black': ['var(--font-sequel-sans-black-disp)'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
