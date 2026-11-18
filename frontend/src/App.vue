<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useThemeStore, type ThemePreference } from './stores/theme'

const mobileNavigationOpen = ref(false)
const themeStore = useThemeStore()

themeStore.initializeTheme()

function closeMobileNavigation() {
  mobileNavigationOpen.value = false
}

function selectTheme(preference: ThemePreference) {
  themeStore.setTheme(preference)
}
</script>

<template>
  <v-app>
    <v-app-bar color="background" flat class="app-header">
      <div class="header-content">
        <RouterLink class="brand" :to="{ name: 'home' }" aria-label="MuvDash home">
          MuvDash
        </RouterLink>

        <nav class="desktop-nav d-none d-sm-flex" aria-label="Primary navigation">
          <RouterLink class="nav-link" :to="{ name: 'home' }">Home</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'contact' }">Contact</RouterLink>
          <RouterLink class="nav-link" :to="{ name: 'about' }">About</RouterLink>
        </nav>

        <div class="header-actions">
          <div class="theme-control" role="group" aria-label="Theme">
            <button
              type="button"
              class="theme-control__option"
              :class="{ 'theme-control__option--active': themeStore.preference === 'light' }"
              :aria-pressed="themeStore.preference === 'light'"
              aria-label="Use light theme"
              @click="selectTheme('light')"
            >
              <v-icon icon="mdi-white-balance-sunny" aria-hidden="true" />
              <span>Light</span>
            </button>
            <button
              type="button"
              class="theme-control__option"
              :class="{ 'theme-control__option--active': themeStore.preference === 'dark' }"
              :aria-pressed="themeStore.preference === 'dark'"
              aria-label="Use dark theme"
              @click="selectTheme('dark')"
            >
              <v-icon icon="mdi-weather-night" aria-hidden="true" />
              <span>Dark</span>
            </button>
          </div>

          <v-btn
            class="mobile-menu-trigger d-sm-none"
            icon="mdi-menu"
            variant="text"
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            :aria-expanded="mobileNavigationOpen"
            @click="mobileNavigationOpen = true"
          />
        </div>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-model="mobileNavigationOpen"
      class="mobile-navigation"
      color="surface"
      id="mobile-navigation"
      location="right"
      temporary
      width="280"
      aria-label="Mobile navigation"
      :aria-hidden="!mobileNavigationOpen"
    >
      <div class="mobile-navigation__content">
        <v-btn
          class="mobile-navigation__close"
          variant="text"
          prepend-icon="mdi-close"
          aria-label="Close navigation menu"
          @click="closeMobileNavigation"
        >
          Close
        </v-btn>
        <RouterLink
          class="nav-link mobile-navigation__link"
          :to="{ name: 'home' }"
          @click="closeMobileNavigation"
        >
          Home
        </RouterLink>
        <RouterLink
          class="nav-link mobile-navigation__link"
          :to="{ name: 'contact' }"
          @click="closeMobileNavigation"
        >
          Contact
        </RouterLink>
        <RouterLink
          class="nav-link mobile-navigation__link"
          :to="{ name: 'about' }"
          @click="closeMobileNavigation"
        >
          About
        </RouterLink>
      </div>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
.app-header {
  z-index: 1006;
}

:deep(.v-application) {
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.header-content {
  display: flex;
  width: min(100% - 2rem, 80rem);
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  margin-inline: auto;
}

.brand {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  color: rgb(var(--v-theme-secondary));
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.desktop-nav {
  height: 100%;
  align-items: center;
  gap: 0.5rem;
}

.header-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.5rem;
}

.theme-control {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-background), 0.3);
  border-radius: 0.375rem;
  background: rgb(var(--v-theme-surface));
}

.theme-control__option {
  display: inline-flex;
  min-width: 2.75rem;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 0;
  padding-inline: 0.5rem;
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

.theme-control__option--active {
  box-shadow: inset 0 0 0 2px rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-secondary));
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.theme-control__option:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: -4px;
}

.nav-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: rgb(var(--v-theme-on-background));
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
}

.nav-link.router-link-active {
  color: rgb(var(--v-theme-secondary));
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.3rem;
}

.brand:focus-visible,
.nav-link:focus-visible,
.mobile-menu-trigger:focus-visible,
.mobile-navigation__close:focus-visible {
  outline: 2px solid rgb(var(--v-theme-secondary));
  outline-offset: 3px;
}

.mobile-navigation__content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
}

.mobile-navigation__close {
  min-height: 2.75rem;
  align-self: flex-end;
  color: rgb(var(--v-theme-on-surface));
}

.mobile-navigation__link {
  justify-content: flex-start;
  color: rgb(var(--v-theme-on-surface));
}

.mobile-menu-trigger {
  min-width: 2.75rem;
  min-height: 2.75rem;
  color: rgb(var(--v-theme-on-background));
}

@media (prefers-reduced-motion: reduce) {
  :deep(.v-application),
  .mobile-navigation,
  :deep(.v-navigation-drawer__scrim),
  :deep(.v-overlay__scrim),
  :deep(.v-overlay__content) {
    animation-duration: 0ms !important;
    transition-delay: 0ms !important;
    transition-duration: 0ms !important;
  }
}
</style>
