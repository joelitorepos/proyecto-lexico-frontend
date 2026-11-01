
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import RegistroView from '../views/RegistroView.vue'
import LoginView from '../views/LoginView.vue'
import AnalisisView from '../views/AnalisisView.vue'

// Comprobación temporal para pruebas del frontend.
// NO sustituye una sesión autenticada por el backend.
function usuarioAutenticado() {
  try {
    const datos = sessionStorage.getItem('usuarioLexico')

    if (!datos) {
      return false
    }

    const usuario = JSON.parse(datos)

    return (
      Number.isInteger(usuario.idUsuario) &&
      usuario.idUsuario > 0 &&
      typeof usuario.nickname === 'string' &&
      usuario.nickname.length > 0
    )
  } catch {
    return false
  }
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

// Protección temporal de navegación para desarrollo
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
