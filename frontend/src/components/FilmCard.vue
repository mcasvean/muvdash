<script setup lang="ts">
import type { Film } from '../services/filmService'

defineProps<{
  film: Film
}>()
</script>

<template>
  <v-card class="film-card" height="100%" rounded="lg" elevation="2">
    <div class="film-card__image-frame">
      <v-img
        v-if="film.image"
        :src="film.image"
        :alt="film.title ? `Poster for ${film.title}` : ''"
        cover
        class="film-card__image"
      />
    </div>
    <v-card-text class="film-card__content">
      <h2 v-if="film.title" class="film-card__title">{{ film.title }}</h2>
      <p v-if="film.description" class="film-card__description">{{ film.description }}</p>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.film-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.film-card__image-frame {
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: rgb(var(--v-theme-primary));
}

.film-card__image {
  height: 100%;
}

.film-card__content {
  display: flex;
  min-height: 7rem;
  flex: 1;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.9rem;
}

.film-card__title,
.film-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.film-card__title {
  min-height: 2.7em;
  color: rgb(var(--v-theme-secondary));
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  -webkit-line-clamp: 2;
}

.film-card__description {
  min-height: 2.8em;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.875rem;
  line-height: 1.4;
  -webkit-line-clamp: 2;
}
</style>