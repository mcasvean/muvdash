import { defineStore } from 'pinia'
import { vuetify } from '../plugins/vuetify'

export type ThemePreference = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'muvdash-theme'

function themeName(theme: ThemePreference) {
  return theme === 'light' ? 'muvdashLight' : 'muvdashDark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    preference: 'dark' as ThemePreference,
  }),
  actions: {
    initializeTheme() {
      let storedPreference: string | null = null
      try {
        storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY)
      } catch {
        storedPreference = null
      }
      const preference: ThemePreference =
        storedPreference === 'light' || storedPreference === 'dark'
          ? storedPreference
          : 'dark'

      this.applyTheme(preference)
    },
    setTheme(preference: ThemePreference) {
      this.applyTheme(preference)
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference)
      } catch {
        // The selected theme remains active for the session if storage is unavailable.
      }
    },
    applyTheme(preference: ThemePreference) {
      this.preference = preference
      vuetify.theme.global.name.value = themeName(preference)
    },
  },
})
