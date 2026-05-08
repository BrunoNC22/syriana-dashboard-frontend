/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    darkMode: 'class',
    extend: {
      colors: {
        'surface-container': '#201f1f',
        'on-primary-fixed-variant': '#5a430e',
        'on-primary': '#402d00',
        'on-secondary-fixed': '#271900',
        'on-secondary': '#422c00',
        'error-container': '#93000a',
        tertiary: '#e1c588',
        'surface-container-high': '#2a2a2a',
        'surface-container-low': '#1c1b1b',
        'on-surface-variant': '#d0c5b5',
        'inverse-surface': '#e5e2e1',
        'secondary-fixed': '#ffdeaa',
        'surface-variant': '#353534',
        'on-tertiary-container': '#503e0d',
        primary: '#e5c483',
        'on-primary-container': '#533d07',
        'surface-tint': '#e3c281',
        'tertiary-fixed-dim': '#dfc386',
        'primary-fixed-dim': '#e3c281',
        'on-secondary-container': '#d6b37a',
        'primary-container': '#c8a96a',
        'inverse-on-surface': '#313030',
        'on-background': '#e5e2e1',
        'on-tertiary': '#3e2e00',
        'secondary-container': '#5e4516',
        'surface-container-lowest': '#0e0e0e',
        'on-error-container': '#ffdad6',
        'tertiary-fixed': '#fddf9f',
        error: '#ffb4ab',
        'on-secondary-fixed-variant': '#5b4314',
        surface: '#131313',
        'on-surface': '#e5e2e1',
        'primary-fixed': '#ffdf9f',
        'on-error': '#690005',
        'secondary-fixed-dim': '#e5c187',
        outline: '#998f81',
        'surface-container-highest': '#353534',
        'on-tertiary-fixed-variant': '#574413',
        'surface-bright': '#3a3939',
        'tertiary-container': '#c4aa6f',
        'on-tertiary-fixed': '#251a00',
        background: '#131313',
        'inverse-primary': '#735b24',
        'on-primary-fixed': '#261a00',
        secondary: '#e5c187',
        'surface-dim': '#131313',
        'outline-variant': '#4d463a'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        'card-padding': '24px',
        'stack-lg': '32px',
        'stack-md': '16px',
        'stack-sm': '8px',
        gutter: '24px',
        unit: '8px',
        'container-padding': '32px'
      },
      fontFamily: {
        h1: ['Manrope'],
        'body-md': ['Manrope'],
        'label-caps': ['Space Grotesk'],
        'data-display': ['Space Grotesk'],
        h2: ['Manrope'],
        'body-lg': ['Manrope'],
        h3: ['Manrope']
      },
      fontSize: {
        h1: ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1.0', letterSpacing: '0.1em', fontWeight: '600' }],
        'data-display': ['28px', { lineHeight: '1.1', letterSpacing: '0.02em', fontWeight: '500' }],
        h2: ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600' }]
      }
    }
  },
  plugins: []
}
