import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'muvdashDark',
    themes: {
      muvdashDark: {
        dark: true,
        colors: {
          background: '#1F1B2C',
          surface: '#2E2343',
          primary: '#2E2343',
          secondary: '#7FE0D2',
          accent: '#E7A15B',
          error: '#E57373',
          info: '#7FE0D2',
          success: '#80CBC4',
          warning: '#E7A15B',
        },
      },
      muvdashLight: {
        dark: false,
        colors: {
          background: '#EAF8F6',
          surface: '#F7F3FF',
          primary: '#2E2343',
          secondary: '#1E5D61',
          accent: '#C76E1D',
          error: '#B3261E',
          info: '#1E5D61',
          success: '#2E6B57',
          warning: '#8A4B08',
        },
      },
    },
  },
})