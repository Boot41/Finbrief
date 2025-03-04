// tailwind.config.js
export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Adjust this to match your project structure
    ],
    theme: {
      extend: {
        animation: {
          'fade-in-down': 'fade-in-down 0.5s ease-out',
          'fade-in-up': 'fade-in-up 0.5s ease-out',
        },
        keyframes: {
          'fade-in-down': {
            '0%': {
              opacity: '0',
              transform: 'translateY(-20px)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0)',
            },
          },
          'fade-in-up': {
            '0%': {
              opacity: '0',
              transform: 'translateY(20px)',
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0)',
            },
          },
        },
      },
    },
    variants: {
      extend: {
        animation: ['responsive', 'hover', 'focus'],
      },
    },
    plugins: [],
  };