<script setup lang="ts">
import { onMounted } from 'vue'
import FilmCard from '../components/FilmCard.vue'
import { useFilmsStore } from '../stores/films'

const filmsStore = useFilmsStore()

const retryCatalog = () => {
  if (filmsStore.isLoading) return
  void filmsStore.loadFilms()
}

onMounted(() => {
  void filmsStore.loadFilms()
})
</script>

<template>
  <v-container class="home-shell">
    <h1>Studio Ghibli films</h1>

    <section class="catalog" aria-label="Film catalog" :aria-busy="filmsStore.isLoading">
      <p v-if="filmsStore.isLoading" class="visually-hidden" role="status">Loading films</p>

      <v-row v-if="filmsStore.isLoading" class="film-grid" aria-hidden="true">
        <v-col v-for="skeleton in 12" :key="skeleton" cols="6" sm="3" md="3" lg="2">
          <article class="film-skeleton">
            <div class="film-skeleton__image" />
            <div class="film-skeleton__content">
              <div class="film-skeleton__title" />
              <div class="film-skeleton__description" />
            </div>
          </article>
        </v-col>
      </v-row>

      <v-card
        v-else-if="filmsStore.requestError"
        class="catalog-unavailable"
        rounded="lg"
        elevation="2"
      >
        <div class="catalog-unavailable__content">
          <div role="status">
            <p class="catalog-unavailable__title">Unable to load films</p>
            <p class="catalog-unavailable__message">Please try again.</p>
          </div>
          <v-btn
            type="button"
            class="catalog-unavailable__button"
            color="secondary"
            variant="flat"
            size="large"
            aria-label="Retry loading films"
            @click="retryCatalog"
          >
            Retry loading films
          </v-btn>
        </div>
      </v-card>

      <v-row v-else class="film-grid">
        <v-col v-for="film in filmsStore.catalog" :key="film.id" cols="6" sm="3" md="3" lg="2">
          <FilmCard :film="film" />
        </v-col>
      </v-row>
    </section>
  </v-container>
</template>

<style scoped>
.home-shell {
  padding-block: 1.5rem 3rem;
}

h1 {
  margin-bottom: 1.25rem;
  color: rgb(var(--v-theme-secondary));
  font-size: 1.5rem;
  font-weight: 700;
}

.film-grid {
  row-gap: 0;
}

.catalog-unavailable {
  max-width: 32rem;
  margin: 0 auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.catalog-unavailable__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1.5rem;
}

.catalog-unavailable__title {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem;
  font-weight: 700;
}

.catalog-unavailable__message {
  margin: 0;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.95rem;
}

.catalog-unavailable__button {
  min-block-size: 2.75rem;
  min-inline-size: 10rem;
}

.catalog-unavailable__button:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 2px;
}

.film-skeleton {
  overflow: hidden;
  border-radius: 0.5rem;
  background: rgb(var(--v-theme-surface));
}

.film-skeleton__image {
  aspect-ratio: 2 / 3;
  background: rgb(var(--v-theme-primary));
}

.film-skeleton__content {
  display: grid;
  min-height: 7rem;
  align-content: start;
  gap: 0.75rem;
  padding: 0.9rem;
}

.film-skeleton__title,
.film-skeleton__description {
  border-radius: 0.25rem;
  background: rgba(var(--v-theme-on-surface), 0.14);
  animation: skeleton-pulse 1.8s ease-in-out infinite alternate;
}

.film-skeleton__title {
  width: 75%;
  height: 1.1rem;
}

.film-skeleton__description {
  width: 100%;
  height: 2.25rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes skeleton-pulse {
  to {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .film-skeleton__title,
  .film-skeleton__description {
    animation: none;
  }
}
</style>
