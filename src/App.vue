
<template>
  <v-app>
    <!-- Barra superior -->
    <v-app-bar color="primary" elevation="2">
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
    </v-app-bar>

    <!-- Contenido de las páginas -->
    <v-main>
      <router-view />
    </v-main>
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
