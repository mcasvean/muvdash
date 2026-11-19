<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FilmCard from '../components/FilmCard.vue'
import ContextualTooltip from '../components/ContextualTooltip.vue'
import { fetchRelatedFilmData, type Film, type RelatedFilmData } from '../services/filmService'
import { useFilmsStore } from '../stores/films'

const filmsStore = useFilmsStore()
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const isSearchCompact = ref(false)
const orientation = ref<'portrait' | 'landscape'>('portrait')
const selectedFilm = ref<Film | null>(null)
const isDetailsOpen = ref(false)
const isRelatedDetailsLoading = ref(false)
const hasRelatedDetailsError = ref(false)
const relatedFilmData = ref<RelatedFilmData | null>(null)
let relatedRequestVersion = 0

const filmDetails = computed(() => {
  const film = selectedFilm.value
  if (!film) return []

  const fields = [
    { label: 'Description', value: film.description },
    { label: 'Director', value: film.director },
    { label: 'Producer', value: film.producer },
    { label: 'Release date', value: film.release_date },
    {
      label: 'Running time',
      value: film.running_time ? `${film.running_time} minutes` : film.running_time,
    },
    { label: 'Score', value: film.rt_score ? `${film.rt_score}%` : film.rt_score },
  ]

  return fields.filter(
    (field): field is { label: string; value: string } =>
      typeof field.value === 'string' && field.value.trim().length > 0,
  )
})

const relatedSections = computed(() => {
  const data = relatedFilmData.value
  if (!data) return []

  return [
    { key: 'people', title: 'People', items: data.people },
    { key: 'species', title: 'Species', items: data.species },
    { key: 'locations', title: 'Locations', items: data.locations },
    { key: 'vehicles', title: 'Vehicles', items: data.vehicles },
  ].filter((section) => section.items.length > 0)
})

const filteredFilms = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return filmsStore.catalog

  const searchableFields = ['title', 'release_date', 'producer', 'director', 'description'] as const
  return filmsStore.catalog.filter((film) =>
    searchableFields.some((field) => film[field]?.toLowerCase().includes(query)),
  )
})

const retryCatalog = () => {
  if (filmsStore.isLoading) return
  void filmsStore.loadFilms()
}

function updateSearchCompactState() {
  isSearchCompact.value = window.scrollY > 24
}

function clearSearch() {
  searchQuery.value = ''
  searchInput.value?.focus()
}

function toggleOrientation() {
  orientation.value = orientation.value === 'portrait' ? 'landscape' : 'portrait'
}

async function showFilmDetails(film: Film) {
  const requestVersion = ++relatedRequestVersion
  selectedFilm.value = film
  relatedFilmData.value = null
  hasRelatedDetailsError.value = false
  isRelatedDetailsLoading.value = true
  isDetailsOpen.value = true

  try {
    const data = await fetchRelatedFilmData(film)
    if (requestVersion === relatedRequestVersion) relatedFilmData.value = data
  } catch {
    if (requestVersion === relatedRequestVersion) {
      relatedFilmData.value = null
      hasRelatedDetailsError.value = true
    }
  } finally {
    if (requestVersion === relatedRequestVersion) isRelatedDetailsLoading.value = false
  }
}

function closeFilmDetails() {
  isDetailsOpen.value = false
}

function clearFilmDetails() {
  if (isDetailsOpen.value) return

  selectedFilm.value = null
  relatedFilmData.value = null
  isRelatedDetailsLoading.value = false
  hasRelatedDetailsError.value = false
}

watch(
  isDetailsOpen,
  (isOpen) => {
    if (!isOpen) relatedRequestVersion += 1
  },
  { flush: 'sync' },
)

onMounted(() => {
  updateSearchCompactState()
  window.addEventListener('scroll', updateSearchCompactState, { passive: true })
  void filmsStore.loadFilms()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateSearchCompactState)
})
</script>

<template>
  <v-container class="home-shell">
    <form
      v-if="!filmsStore.isLoading && !filmsStore.requestError"
      class="catalog-search"
      :class="{ 'catalog-search--compact': isSearchCompact }"
      role="search"
      @submit.prevent
    >
      <label class="visually-hidden" for="film-search">Search films</label>
      <input
        id="film-search"
        ref="searchInput"
        v-model="searchQuery"
        class="catalog-search__input"
        type="search"
        placeholder="Search by title, date, producer, director, or description"
      />
      <button
        v-if="searchQuery"
        class="catalog-search__clear"
        type="button"
        aria-label="Clear search"
        @click="clearSearch"
      >
        Clear search
      </button>
      <div class="card-orientation-desktop d-none d-md-flex">
        <ContextualTooltip
          message="Switch between portrait and landscape card images"
          trigger-mode="hover"
          v-slot="{ activatorProps }"
        >
          <v-btn
            v-bind="activatorProps"
            type="button"
            class="card-orientation-toggle"
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-aspect-ratio"
            :aria-label="`Card orientation: ${orientation}`"
            :aria-pressed="orientation === 'landscape'"
            @click="toggleOrientation"
          >
            {{ orientation }}
          </v-btn>
        </ContextualTooltip>
      </div>
      <div class="card-orientation-mobile d-inline-flex d-md-none">
        <v-btn
          type="button"
          class="card-orientation-toggle"
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-aspect-ratio"
          :aria-label="`Card orientation: ${orientation}`"
          :aria-pressed="orientation === 'landscape'"
          @click="toggleOrientation"
        >
          {{ orientation }}
        </v-btn>
        <ContextualTooltip
          message="Switch between portrait and landscape card images"
          trigger-mode="click"
          v-slot="{ activatorProps }"
        >
          <v-btn
            v-bind="activatorProps"
            type="button"
            class="contextual-help-trigger"
            icon="mdi-information-outline"
            variant="text"
            aria-label="Help: card orientation"
          />
        </ContextualTooltip>
      </div>
    </form>

    <h1>Studio Ghibli films</h1>

    <section class="catalog" aria-label="Film catalog" :aria-busy="filmsStore.isLoading">
      <p v-if="filmsStore.isLoading" class="visually-hidden" role="status">Loading films</p>

      <div v-if="filmsStore.isLoading" class="film-grid" aria-hidden="true">
        <article v-for="skeleton in 12" :key="skeleton" class="film-skeleton">
          <div class="film-skeleton__image" />
          <div class="film-skeleton__content">
            <div class="film-skeleton__title" />
            <div class="film-skeleton__description" />
          </div>
        </article>
      </div>

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

      <div v-else-if="filteredFilms.length === 0" class="no-search-results" role="status">
        <p class="no-search-results__title">No films found</p>
        <p class="no-search-results__message">
          Try a different search, or clear it to see the full catalog.
        </p>
        <button
          class="catalog-search__clear"
          type="button"
          aria-label="Clear search"
          @click="clearSearch"
        >
          Clear search
        </button>
      </div>

      <div v-else class="film-grid">
        <FilmCard
          v-for="film in filteredFilms"
          :key="film.id"
          :film="film"
          :orientation="orientation"
          @open-details="showFilmDetails"
        />
      </div>
    </section>

    <v-dialog
      v-model="isDetailsOpen"
      class="film-details-dialog"
      max-width="42rem"
      scrollable
      transition="dialog-transition"
      @after-leave="clearFilmDetails"
    >
      <v-card
        v-if="selectedFilm"
        class="film-details"
        rounded="lg"
        elevation="3"
        :aria-labelledby="
          !hasRelatedDetailsError && !isRelatedDetailsLoading && selectedFilm.title
            ? 'film-details-title'
            : undefined
        "
        :aria-label="
          hasRelatedDetailsError
            ? 'Film details unavailable'
            : isRelatedDetailsLoading
              ? 'Loading film details'
              : selectedFilm.title
                ? undefined
                : 'Film details'
        "
      >
        <v-btn
          class="film-details__close"
          type="button"
          icon="mdi-close"
          variant="text"
          aria-label="Close film details"
          @click="closeFilmDetails"
        />
        <p v-if="hasRelatedDetailsError" class="film-details__error-message" role="status">
          Oops, the details are not available right now. Please try again later.
        </p>
        <p v-else-if="isRelatedDetailsLoading" class="film-details__loading-message" role="status">
          Gathering this film’s related information…
        </p>
        <template v-else>
          <div v-if="selectedFilm.image" class="film-details__image-frame">
            <v-img
              :src="selectedFilm.image"
              :alt="selectedFilm.title ? `Poster for ${selectedFilm.title}` : 'Film poster'"
              class="film-details__image"
              contain
            />
          </div>
          <h2 v-if="selectedFilm.title" id="film-details-title" class="film-details__title">
            {{ selectedFilm.title }}
          </h2>
          <v-card-text class="film-details__content">
            <dl v-if="filmDetails.length" class="film-details__fields">
              <div v-for="field in filmDetails" :key="field.label" class="film-details__field">
                <dt>{{ field.label }}</dt>
                <dd>{{ field.value }}</dd>
              </div>
            </dl>
            <section
              v-for="section in relatedSections"
              :key="section.key"
              class="film-details__related-category"
              :aria-label="section.title"
            >
              <h3>{{ section.title }}</h3>
              <ul class="film-details__related-list">
                <li
                  v-for="(entity, index) in section.items"
                  :key="`${section.key}-${index}`"
                  class="film-details__related-entity"
                >
                  <h4 v-if="entity.name" class="film-details__related-name">
                    {{ entity.name }}
                  </h4>
                  <dl v-if="entity.fields.length" class="film-details__related-fields">
                    <div v-for="field in entity.fields" :key="field.label">
                      <dt>{{ field.label }}</dt>
                      <dd>{{ field.value }}</dd>
                    </div>
                  </dl>
                </li>
              </ul>
            </section>
          </v-card-text>
        </template>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.home-shell {
  width: min(calc(100% - 2rem), 80rem);
  max-width: none;
  margin-inline: auto;
  padding: 1.5rem 0 3rem;
}

.catalog-search {
  position: sticky;
  top: 4rem;
  z-index: 1005;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin: -1.5rem 0 1.5rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.12);
  padding: 0.75rem 0;
  background: rgb(var(--v-theme-background));
  transition:
    padding 160ms ease,
    box-shadow 160ms ease;
}

.catalog-search--compact {
  padding-block: 0.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.catalog-search__input {
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  flex: 1;
  border: 1px solid rgba(var(--v-theme-on-background), 0.3);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font: inherit;
}

.catalog-search__input::placeholder {
  color: rgb(var(--v-theme-on-surface));
  opacity: 1;
}

.catalog-search__input:focus-visible,
.catalog-search__clear:focus-visible,
.card-orientation-toggle:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 2px;
}

.card-orientation-toggle {
  min-width: 2.75rem;
  min-height: 2.75rem;
  flex: none;
}

.card-orientation-desktop,
.card-orientation-mobile {
  flex: none;
  align-items: center;
  gap: 0.125rem;
}

.card-orientation-mobile .contextual-help-trigger {
  color: rgb(var(--v-theme-on-background));
}

.card-orientation-mobile .contextual-help-trigger:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: -4px;
}

.catalog-search__clear {
  display: inline-flex;
  min-width: 6rem;
  min-height: 2.75rem;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--v-theme-secondary));
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-secondary));
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

h1 {
  margin-bottom: 1.25rem;
  color: rgb(var(--v-theme-secondary));
  font-size: 1.5rem;
  font-weight: 700;
}

.no-search-results {
  max-width: 32rem;
  margin: 0 auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.no-search-results__title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.no-search-results__message {
  margin: 0 0 1rem;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.95rem;
}

.film-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
  justify-content: start;
  gap: 1rem 0.75rem;
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
  width: 100%;
  max-width: 18rem;
  max-height: 36rem;
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

.film-details {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.film-details__close {
  position: absolute;
  z-index: 1;
  top: 0.5rem;
  right: 0.5rem;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: rgb(var(--v-theme-surface));
}

.film-details__close:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 2px;
}

.film-details__image-frame {
  flex: 0 0 auto;
  block-size: min(40dvh, 22rem);
  min-block-size: 8rem;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
}

.film-details__image {
  width: 100%;
  height: 100%;
}

.film-details__title {
  flex: 0 0 auto;
  margin: 0;
  padding: 1rem 4rem 0.5rem 1rem;
  color: rgb(var(--v-theme-secondary));
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.film-details__content {
  min-height: 0;
  flex: 1 1 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem 1rem 1rem;
}

.film-details__error-message,
.film-details__loading-message {
  margin: 0;
  padding: 1.5rem 4rem 1.5rem 1.5rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  line-height: 1.5;
}

.film-details__related-category {
  margin-top: 1.25rem;
}

.film-details__related-category h3 {
  margin: 0 0 0.65rem;
  color: rgb(var(--v-theme-secondary));
  font-size: 1.1rem;
  font-weight: 700;
}

.film-details__related-list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.film-details__related-entity {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.film-details__related-name {
  margin: 0 0 0.4rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1rem;
  font-weight: 700;
}

.film-details__related-fields {
  display: grid;
  gap: 0.4rem;
  margin: 0;
}

.film-details__related-fields dt {
  color: rgb(var(--v-theme-secondary));
  font-weight: 700;
}

.film-details__related-fields dd {
  margin: 0.1rem 0 0;
  overflow-wrap: anywhere;
}

.film-details__fields {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

.film-details__field dt {
  color: rgb(var(--v-theme-secondary));
  font-weight: 700;
}

.film-details__field dd {
  margin: 0.15rem 0 0;
  overflow-wrap: anywhere;
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

@media (max-width: 480px) {
  .catalog-search {
    gap: 0.5rem;
  }

  .catalog-search__input {
    padding-inline: 0.5rem;
  }

  .catalog-search__clear {
    min-width: auto;
  }
}

@media (max-width: 600px) {
  .film-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 360px) {
  .home-shell {
    width: calc(100% - 1rem);
  }
}

@media (max-width: 600px) {
  .film-details__title {
    font-size: 1.05rem;
  }

  .film-details__content {
    font-size: 0.9rem;
  }

  .film-details__error-message,
  .film-details__loading-message {
    font-size: 0.9rem;
  }
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

  .catalog-search {
    transition: none;
  }

  .card-orientation-toggle {
    transition-duration: 0ms;
  }

  :deep(.film-details-dialog .v-overlay__content) {
    transition-duration: 0ms !important;
  }
}
</style>
