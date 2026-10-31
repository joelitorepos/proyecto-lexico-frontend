
<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-card
          class="pa-8 text-center"
          elevation="4"
          rounded="lg"
        >
          <!-- Icono principal -->
          <v-icon
            icon="mdi-code-tags"
            size="80"
            color="primary"
            class="mb-4"
          />

          <!-- Título -->
          <h1 class="text-h4 mb-4">
            Sistema de Análisis Léxico
          </h1>

          <!-- Descripción -->
          <p class="text-body-1 mb-6">
            Bienvenido al Sistema de Análisis Léxico.
            Esta plataforma permitirá analizar archivos
            de texto, identificar palabras, calcular
            frecuencias y visualizar resultados
            de manera sencilla.
          </p>

          <v-divider class="mb-6" />

          <!-- Botones de navegación -->
          <v-row justify="center">
            <v-col cols="12" sm="6">
              <v-btn
                color="primary"
                size="large"
                block
                prepend-icon="mdi-account-plus"
                to="/registro"
              >
                Registrarse
              </v-btn>
            </v-col>

            <v-col cols="12" sm="6">
              <v-btn
                color="secondary"
                size="large"
                block
                prepend-icon="mdi-login"
                to="/login"
              >
                Iniciar sesión
              </v-btn>
            </v-col>
          </v-row>

          <!-- Información adicional -->
          
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
