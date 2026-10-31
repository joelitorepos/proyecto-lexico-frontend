
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import RegistroView from '../views/RegistroView.vue'
import LoginView from '../views/LoginView.vue'
import AnalisisView from '../views/AnalisisView.vue'

// Estado temporal mientras se desarrolla el backend.
// Nunca debe cambiarse a true sin verificar
// una sesión real con el servidor.
function usuarioAutenticado() {
  return false
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'inicio',
      component: HomeView,
    },
    {
      path: '/registro',
      name: 'registro',
      component: RegistroView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/analisis',
      name: 'analisis',
      component: AnalisisView,
      meta: {
        requiereAutenticacion: true,
      },
    },
  ],
})

// Protección de navegación
router.beforeEach((to) => {
  if (
    to.meta.requiereAutenticacion &&
    !usuarioAutenticado()
  ) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
})

export default router
