<script setup lang="ts">
import { computed } from 'vue'
import type { Film } from '../services/filmService'

const props = defineProps<{
  film: Film
  orientation: 'portrait' | 'landscape'
}>()

const imageSource = computed(() =>
  props.orientation === 'landscape' ? props.film.movie_banner : props.film.image,
)

const emit = defineEmits<{
  openDetails: [film: Film]
}>()
</script>

<template>
  <v-card class="film-card" height="100%" rounded="lg" elevation="2">
    <div class="film-card__image-frame" :class="`film-card__image-frame--${orientation}`">
      <v-img
        v-if="imageSource"
        :src="imageSource ?? undefined"
        :alt="
          film.title
            ? `${orientation === 'landscape' ? 'Banner' : 'Poster'} for ${film.title}`
            : orientation === 'landscape'
              ? 'Film banner'
              : 'Film poster'
        "
        cover
        class="film-card__image"
      />
    </div>
    <v-card-text class="film-card__content">
      <h2 v-if="film.title" class="film-card__title">{{ film.title }}</h2>
      <p v-if="film.description" class="film-card__description">{{ film.description }}</p>
    </v-card-text>
    <v-card-actions class="film-card__actions">
      <v-btn
        class="film-card__details-action"
        color="secondary"
        variant="text"
        :aria-label="`View details${film.title ? ` for ${film.title}` : ''}`"
        @click="emit('openDetails', film)"
      >
        View details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.film-card {
  display: flex;
  width: 100%;
  max-width: 18rem;
  max-height: 36rem;
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

.film-card__image-frame--landscape {
  aspect-ratio: 16 / 9;
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

.film-card__actions {
  min-height: 3.25rem;
  padding: 0 0.5rem 0.5rem;
}

.film-card__details-action {
  min-width: 2.75rem;
  min-height: 2.75rem;
}

.film-card__details-action:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 2px;
}
</style>
