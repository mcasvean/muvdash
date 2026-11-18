<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const mobileNavigationOpen = ref(false)

function closeMobileNavigation() {
  mobileNavigationOpen.value = false
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
