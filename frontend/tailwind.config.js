/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',       // Blue
        secondary: '#6B7280',     // Gray
        accent: '#10B981',        // Green
        'neutral-light': '#F9FAFB', // Very Light Gray (Backgrounds)
        'neutral-dark': '#1F2937',  // Dark Gray (Primary text)
        'neutral-border': '#E5E7EB',// Border/Divider
        'neutral-placeholder': '#D1D5DB', // Placeholder text/Disabled states
        'status-success': '#10B981', // Green (same as accent)
        'status-warning': '#F59E0B', // Amber
        'status-error': '#EF4444',   // Red
        'bg-white': '#FFFFFF',
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        DEFAULT: '0.5rem', // 8px
      }
    },
  },
  plugins: [],
}
