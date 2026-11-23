/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Academic SaaS Palette
        canvas: {
          DEFAULT: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        card: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          hover: '#CBD5E1',
          strong: '#94A3B8',
        },
        slate: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        brand: {
          DEFAULT: '#4F46E5', // Electric Indigo
          hover: '#4338CA',
          light: '#EEF2FF',
          border: '#C7D2FE',
        },
        emerald: {
          DEFAULT: '#059669', // Student & Success Accent
          hover: '#047857',
          light: '#ECFDF5',
          border: '#A7F3D0',
        },
        amber: {
          DEFAULT: '#D97706', // Needs Review & Warning Accent
          hover: '#B45309',
          light: '#FFFBEB',
          border: '#FDE68A',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'brand': '0 4px 14px 0 rgba(79, 70, 229, 0.25)',
        'emerald': '0 4px 14px 0 rgba(5, 150, 105, 0.25)',
        'dropdown': '0 10px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem', // 12px for cards
        'lg': '0.5rem',  // 8px for buttons/inputs
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
