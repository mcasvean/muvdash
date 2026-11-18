import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import HomeView from '../views/HomeView.vue'

export function createMuvdashRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/contact',
        name: 'contact',
        component: ContactView,
      },
      {
        path: '/about',
        name: 'about',
        component: AboutView,
      },
    ],
  })
}
