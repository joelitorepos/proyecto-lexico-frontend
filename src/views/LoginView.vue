
<script setup>
import { ref, computed } from 'vue'
import CamaraFacial from '../components/CamaraFacial.vue'

// Métodos de autenticación
const metodo = ref('contrasena')
const usuario = ref('')
const contrasena = ref('')
const mostrarContrasena = ref(false)

// Fotografía y QR
const fotoFacial = ref('')
const archivoQR = ref(null)

// Estados
const mensaje = ref('')
const tipoMensaje = ref('info')
const procesando = ref(false)

const metodos = [
  { title: 'Usuario y contraseña', value: 'contrasena' },
  { title: 'Usuario y fotografía', value: 'facial' },
  { title: 'Código QR', value: 'qr' },
]

const reglasUsuario = [
  (v) => !!v?.trim() || 'El nombre de usuario es obligatorio.',
  (v) =>
    /^[a-zA-Z0-9_]{4,20}$/.test(v || '') ||
    'El usuario debe tener entre 4 y 20 caracteres sin espacios.',
]

const reglasContrasena = [
  (v) => !!v || 'La contraseña es obligatoria.',
]

const puedeIngresar = computed(() => {
  if (metodo.value === 'contrasena') {
    return (
      /^[a-zA-Z0-9_]{4,20}$/.test(usuario.value) &&
      contrasena.value.length > 0
    )
  }

  if (metodo.value === 'facial') {
    return (
      /^[a-zA-Z0-9_]{4,20}$/.test(usuario.value) &&
      !!fotoFacial.value
    )
  }

  if (metodo.value === 'qr') {
    return archivoQR.value !== null
  }

  return false
})

function cambiarMetodo(valor) {
  metodo.value = valor
  mensaje.value = ''
}

function recibirFoto(imagen) {
  fotoFacial.value = imagen
  mensaje.value = ''
}

function seleccionarQR(event) {
  const archivo = event.target.files?.[0]

  archivoQR.value = null
  mensaje.value = ''

  if (!archivo) return

  if (!['image/png', 'image/jpeg'].includes(archivo.type)) {
    tipoMensaje.value = 'warning'
    mensaje.value = 'Selecciona una imagen PNG o JPG.'
    event.target.value = ''
    return
  }

  if (archivo.size > 5 * 1024 * 1024) {
    tipoMensaje.value = 'warning'
    mensaje.value = 'El archivo no debe superar 5 MB.'
    event.target.value = ''
    return
  }

  archivoQR.value = archivo
}

function iniciarSesion() {
  if (!puedeIngresar.value) {
    tipoMensaje.value = 'error'
    mensaje.value = 'Completa los datos requeridos.'
    return
  }

  procesando.value = true

  // Por ahora solo validamos los datos.
  // No existe una autenticación real todavía.
  tipoMensaje.value = 'info'
  mensaje.value =
    'Datos validados correctamente. ' +
    'La autenticación estará disponible ' +
    'cuando conectemos el backend.'

  procesando.value = false
}
</script>

<template>
  <v-container class="py-8">
    <v-card
      class="mx-auto pa-6"
      max-width="650"
      elevation="4"
      rounded="lg"
    >
      <div class="text-center mb-6">
        <v-icon
          icon="mdi-shield-account"
          color="primary"
          size="65"
        />

        <h1 class="text-h5 mt-3">
          Inicio de sesión
        </h1>

        <p class="text-body-2 mt-2">
          Selecciona un método para acceder al sistema.
        </p>
      </div>

      <v-select
        :model-value="metodo"
        :items="metodos"
        label="Método de autenticación"
        variant="outlined"
        prepend-inner-icon="mdi-shield-key"
        @update:model-value="cambiarMetodo"
      />

      <v-divider class="my-4" />

      <!-- Usuario y contraseña -->
      <div v-if="metodo === 'contrasena'">
        <v-text-field
          v-model="usuario"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          :rules="reglasUsuario"
          validate-on="blur"
        />

        <v-text-field
          v-model="contrasena"
          label="Contraseña"
          :type="mostrarContrasena ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="
            mostrarContrasena ? 'mdi-eye-off' : 'mdi-eye'
          "
          @click:append-inner="
            mostrarContrasena = !mostrarContrasena
          "
          variant="outlined"
          :rules="reglasContrasena"
          validate-on="blur"
        />
      </div>

      <!-- Usuario y fotografía -->
      <div v-if="metodo === 'facial'">
        <v-text-field
          v-model="usuario"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          :rules="reglasUsuario"
          validate-on="blur"
        />

        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          Captura una fotografía de tu rostro
          para verificar tu identidad.
        </v-alert>

        <CamaraFacial
          @foto-capturada="recibirFoto"
        />

        <v-alert
          v-if="fotoFacial"
          type="success"
          variant="tonal"
          class="mt-4"
        >
          Fotografía capturada correctamente.
        </v-alert>
      </div>

      <!-- Código QR -->
      <div v-if="metodo === 'qr'">
        <div class="text-center mb-4">
          <v-icon
            icon="mdi-qrcode-scan"
            size="90"
            color="primary"
          />

          <p class="mt-3">
            Selecciona una imagen que contenga
            tu código QR.
          </p>
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg"
          @change="seleccionarQR"
        />

        <v-alert
          v-if="archivoQR"
          type="success"
          variant="tonal"
          class="mt-4"
        >
          Archivo seleccionado:
          {{ archivoQR.name }}
        </v-alert>
      </div>

      <!-- Mensajes -->
      <v-alert
        v-if="mensaje"
        :type="tipoMensaje"
        class="my-4"
      >
        {{ mensaje }}
      </v-alert>

      <!-- Botón -->
      <v-btn
        color="secondary"
        size="large"
        block
        class="mt-5"
        prepend-icon="mdi-login"
        :loading="procesando"
        :disabled="!puedeIngresar || procesando"
        @click="iniciarSesion"
      >
        Iniciar sesión
      </v-btn>

      <div class="text-center mt-5">
        <span class="text-body-2">
          ¿No tienes una cuenta?
        </span>

        <router-link to="/registro">
          Regístrate aquí
        </router-link>
      </div>
    </v-card>
  </v-container>
</template>
