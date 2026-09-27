import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  // Aquí agregarán las demás rutas: /login, /registro, /dashboard, etc.
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router