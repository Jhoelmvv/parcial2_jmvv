import { createRouter, createWebHistory } from 'vue-router'
import EventosView from '../views/EventosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: EventosView,
    },
  ],
})

export default router