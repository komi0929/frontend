/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PRD v2.2 配色
        'bg-main': '#F5F1E8',
        'bg-card': '#FFFFFF',
        'bg-error': '#FFE8D6',
        'border-error': '#FFB88C',
        
        'text-primary': '#5A5A5A',
        'text-secondary': '#8B8B8B',
        'text-translated': '#6B9080',
        'text-white': '#FFFFFF',
        'text-footer': '#999999',
        
        'accent-primary': '#7FCDCD',
        'accent-secondary': '#A8D5BA',
        
        'bar-customer': '#7FCDCD',
        'bar-staff': '#EAA89A',
        
        'status-listening': '#EAA89A',
        'status-idle': '#B8C5D0',
        
        // 言語カード色
        'card-english-start': '#5EB8B8',
        'card-english-end': '#4A9E9E',
        'card-korean-start': '#D98A7A',
        'card-korean-end': '#C76E5E',
        'card-chinese-start': '#D085AD',
        'card-chinese-end': '#BE6F9B',
      },
      fontSize: {
        // PRD v2.1 フォントサイズ
        'logo': ['36px', '1.2'],
        'welcome-body': ['18px', '1.5'],
        'button': ['32px', '1.2'],
        'status': ['18px', '1.5'],
        'guide': ['24px', '1.5'],
        'language': ['24px', '1.5'],
        'original': ['32px', '1.5'],
        'translated': ['40px', '1.4'],
      },
      spacing: {
        'message-gap': '24px',
        'within-message': '16px',
      },
      width: {
        'bar': '6px',
      },
      height: {
        'button': '80px',
      },
      borderRadius: {
        'button': '12px',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'blink': 'blink 1s ease-in-out infinite',
        'highlight-flash': 'highlight-flash 0.3s ease-out',
        'fade-out': 'fadeOut 0.5s ease-out 3s forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'highlight-flash': {
          '0%': { background: '#FAFAF8' },
          '50%': { background: '#FFF4E6' },
          '100%': { background: '#FAFAF8' },
        },
        fadeOut: {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}