<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar color="background" flat>
      <v-app-bar-title class="brand">MuvDash</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<style scoped>
.brand {
  color: rgb(var(--v-theme-secondary));
  font-weight: 700;
}
</style>
