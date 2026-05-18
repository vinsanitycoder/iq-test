import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['var(--font-nunito)', 'sans-serif'],
      },
      colors: {
        fynlo: {
          teal:   '#0084AD',
          terra:  '#BC3F1D',
          lime:   '#D4FF98',
          dark:   '#003B4C',
          bg:     '#F7F7F3',
          body:   '#4A6572',
          subtle: '#8A9DA6',
          statbg: '#F9F9F9',
        },
      },
      borderRadius: {
        card: '20px',
        btn:  '14px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,132,173,0.10)',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
}

export default config
