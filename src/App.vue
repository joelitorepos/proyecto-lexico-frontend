
<script setup>
import { ref } from 'vue'

const menuAbierto = ref(false)

const opciones = [
  {
    titulo: 'Inicio',
    icono: 'mdi-home',
    ruta: '/',
  },
  {
    titulo: 'Registro',
    icono: 'mdi-account-plus',
    ruta: '/registro',
  },
  {
    titulo: 'Iniciar sesión',
    icono: 'mdi-login',
    ruta: '/login',
  },
  {
    titulo: 'Análisis léxico',
    icono: 'mdi-file-search',
    ruta: '/analisis',
  },
]
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <!-- Logotipo y nombre -->
      <v-app-bar-title>
        <router-link
          to="/"
          class="titulo-sistema"
        >
          <v-icon
            icon="mdi-code-tags"
            class="mr-2"
          />
          <span class="nombre-completo">
            Sistema de Análisis Léxico
          </span>
          <span class="nombre-corto">
            Análisis Léxico
          </span>
        </router-link>
      </v-app-bar-title>

      <!-- Navegación para computadoras -->
      <div class="menu-escritorio">
        <v-btn
          v-for="opcion in opciones"
          :key="opcion.ruta"
          :to="opcion.ruta"
          variant="text"
          :prepend-icon="opcion.icono"
        >
          {{ opcion.titulo }}
        </v-btn>
      </div>

      <!-- Menú para celulares -->
      <div class="menu-movil">
        <v-menu v-model="menuAbierto">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-menu"
              aria-label="Abrir menú de navegación"
            />
          </template>

          <v-list elevation="4" min-width="220">
            <v-list-item
              v-for="opcion in opciones"
              :key="opcion.ruta"
              :to="opcion.ruta"
              :prepend-icon="opcion.icono"
              :title="opcion.titulo"
              @click="menuAbierto = false"
            />
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Contenido de cada pantalla -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Pie de página -->
    <v-footer
      color="primary"
      class="text-center py-4"
    >
      <div class="w-100">
        <p class="text-body-2">
          Sistema de Análisis Léxico
        </p>
        <p class="text-caption">
          Proyecto académico - Vue 3 y Vuetify
        </p>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.titulo-sistema {
  color: white;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  font-size: 17px;
}

.nombre-corto {
  display: none;
}

.menu-escritorio {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.menu-movil {
  display: none;
}

@media (max-width: 1100px) {
  .menu-escritorio {
    display: none;
  }

  .menu-movil {
    display: block;
    margin-right: 8px;
  }
}

@media (max-width: 600px) {
  .nombre-completo {
    display: none;
  }

  .nombre-corto {
    display: inline;
  }

  .titulo-sistema {
    font-size: 15px;
  }
}
</style>
