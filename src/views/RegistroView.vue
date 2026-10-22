
<script setup>
import { ref, computed } from 'vue'
import CamaraFacial from '../components/CamaraFacial.vue'
import EditorFoto from '../components/EditorFoto.vue'

// Datos del formulario
const nombre = ref('')
const usuario = ref('')
const correo = ref('')
const contrasena = ref('')
const confirmarContrasena = ref('')

// Fotografías
const foto = ref(null)
const vistaFoto = ref('')
const fotoFacial = ref('')
const fotoEditada = ref('')

// Estados
const mensaje = ref('')
const tipoMensaje = ref('info')
const mostrarContrasena = ref(false)
const mostrarConfirmacion = ref(false)
const formularioEnviado = ref(false)

// Reglas de validación
const reglasNombre = [
  (v) => !!v?.trim() || 'El nombre completo es obligatorio.',
  (v) =>
    v?.trim().length >= 3 ||
    'El nombre debe tener al menos 3 caracteres.',
]

const reglasUsuario = [
  (v) => !!v?.trim() || 'El usuario es obligatorio.',
  (v) =>
    /^[a-zA-Z0-9_]{4,20}$/.test(v || '') ||
    'Utiliza entre 4 y 20 caracteres: letras, números o guion bajo.',
]

const reglasCorreo = [
  (v) => !!v?.trim() || 'El correo es obligatorio.',
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ||
    'Ingresa un correo electrónico válido.',
]

const reglasContrasena = [
  (v) => !!v || 'La contraseña es obligatoria.',
  (v) =>
    (v || '').length >= 8 ||
    'La contraseña debe tener al menos 8 caracteres.',
  (v) =>
    /[A-Za-z]/.test(v || '') ||
    'La contraseña debe incluir al menos una letra.',
  (v) =>
    /\d/.test(v || '') ||
    'La contraseña debe incluir al menos un número.',
]

const reglasConfirmacion = [
  (v) => !!v || 'Debes confirmar tu contraseña.',
  (v) =>
    v === contrasena.value ||
    'Las contraseñas no coinciden.',
]

// Validación general
const formularioValido = computed(() => {
  return (
    nombre.value.trim().length >= 3 &&
    /^[a-zA-Z0-9_]{4,20}$/.test(usuario.value) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value) &&
    contrasena.value.length >= 8 &&
    /[A-Za-z]/.test(contrasena.value) &&
    /\d/.test(contrasena.value) &&
    confirmarContrasena.value === contrasena.value
  )
})

// Seleccionar fotografía
function seleccionarFoto(event) {
  const archivo = event.target.files?.[0]

  foto.value = null
  vistaFoto.value = ''
  fotoEditada.value = ''
  mensaje.value = ''

  if (!archivo) return

  if (!archivo.type.startsWith('image/')) {
    tipoMensaje.value = 'warning'
    mensaje.value = 'Selecciona una imagen válida.'
    event.target.value = ''
    return
  }

  if (archivo.size > 5 * 1024 * 1024) {
    tipoMensaje.value = 'warning'
    mensaje.value = 'La imagen no debe superar 5 MB.'
    event.target.value = ''
    return
  }

  foto.value = archivo

  const lector = new FileReader()

  lector.onload = () => {
    vistaFoto.value = lector.result
  }

  lector.onerror = () => {
    tipoMensaje.value = 'error'
    mensaje.value = 'No se pudo leer la fotografía.'
  }

  lector.readAsDataURL(archivo)
}

// Captura facial
function recibirFoto(imagen) {
  fotoFacial.value = imagen
  fotoEditada.value = ''
}

// Fotografía editada
function recibirFotoEditada(imagen) {
  fotoEditada.value = imagen
}

// Validar antes de enviar
function registrarUsuario() {
  formularioEnviado.value = true

  if (!formularioValido.value) {
    tipoMensaje.value = 'error'
    mensaje.value =
      'Revisa los campos señalados antes de continuar.'
    return
  }

  tipoMensaje.value = 'info'
  mensaje.value =
    'Datos validados correctamente. ' +
    'El registro real estará disponible ' +
    'cuando conectemos el backend.'

  // No se almacenan ni se envían contraseñas
  // o fotografías en esta versión.
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
      <!-- Encabezado -->
      <div class="text-center mb-6">
        <v-icon
          icon="mdi-account-plus"
          size="60"
          color="primary"
        />

        <h1 class="text-h5 mt-3">
          Registro de usuarios
        </h1>

        <p class="text-body-2 mt-2">
          Completa tus datos para crear una cuenta.
        </p>
      </div>

      <!-- Formulario -->
      <v-form @submit.prevent="registrarUsuario">

        <v-text-field
          v-model="nombre"
          label="Nombre completo"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          :rules="reglasNombre"
          validate-on="blur"
          required
        />

        <v-text-field
          v-model="usuario"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account-circle"
          variant="outlined"
          :rules="reglasUsuario"
          validate-on="blur"
          hint="De 4 a 20 caracteres, sin espacios."
          required
        />

        <v-text-field
          v-model="correo"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :rules="reglasCorreo"
          validate-on="blur"
          required
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
          hint="Mínimo 8 caracteres, con letras y números."
          required
        />

        <v-text-field
          v-model="confirmarContrasena"
          label="Confirmar contraseña"
          :type="mostrarConfirmacion ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-check"
          :append-inner-icon="
            mostrarConfirmacion ? 'mdi-eye-off' : 'mdi-eye'
          "
          @click:append-inner="
            mostrarConfirmacion = !mostrarConfirmacion
          "
          variant="outlined"
          :rules="reglasConfirmacion"
          validate-on="blur"
          required
        />

        <v-divider class="my-5" />

        <!-- Fotografía de perfil -->
        <h2 class="text-subtitle-1 mb-3">
          Fotografía de perfil
        </h2>

        <p class="text-body-2 mb-3">
          Puedes seleccionar una imagen desde
          tu computadora o utilizar la cámara.
        </p>

        <input
          type="file"
          accept="image/*"
          @change="seleccionarFoto"
        />

        <div
          v-if="vistaFoto"
          class="text-center my-4"
        >
          <v-avatar size="120">
            <v-img
              :src="vistaFoto"
              alt="Fotografía de perfil"
              cover
            />
          </v-avatar>
        </div>

        <v-divider class="my-5" />

        <!-- Cámara -->
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

        <!-- Editor de fotografías -->
        <EditorFoto
          :imagen="fotoFacial || vistaFoto"
          @foto-editada="recibirFotoEditada"
        />

        <v-alert
          v-if="fotoEditada"
          type="success"
          variant="tonal"
          class="mt-4"
        >
          Fotografía editada correctamente.
          Está preparada para utilizarse
          como imagen de perfil.
        </v-alert>

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
          type="submit"
          color="secondary"
          size="large"
          block
          class="mt-5"
          :disabled="!formularioValido"
        >
          Registrarse
        </v-btn>

      </v-form>
    </v-card>
  </v-container>
</template>
