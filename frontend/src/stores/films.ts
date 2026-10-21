import { defineStore } from 'pinia'
import { fetchFilms, type Film } from '../services/filmService'

export const useFilmsStore = defineStore('films', {
  state: () => ({
    catalog: [] as Film[],
    isLoading: false,
    requestError: false,
  }),
  actions: {
    async loadFilms() {
      this.isLoading = true
      this.requestError = false

      try {
        const films = await fetchFilms()
        this.catalog = films
        this.requestError = films.length === 0
      } catch {
        this.catalog = []
        this.requestError = true
      } finally {
        this.isLoading = false
      }
    },
  },
})