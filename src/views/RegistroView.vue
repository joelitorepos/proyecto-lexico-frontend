
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

// Límites de caracteres
const MAX_NOMBRE = 80
const MAX_USUARIO = 20
const MAX_CORREO = 254
const MAX_CONTRASENA = 64

// Reglas de validación
const reglasNombre = [
  v => !!v?.trim() || 'El nombre completo es obligatorio.',
  v => (v?.trim().length || 0) >= 3 ||
    'El nombre debe tener al menos 3 caracteres.',
  v => (v?.trim().length || 0) <= MAX_NOMBRE ||
    'El nombre no debe superar 80 caracteres.'
]

const reglasUsuario = [
  v => !!v || 'El usuario es obligatorio.',
  v => (v || '').length >= 4 ||
    'El usuario debe tener al menos 4 caracteres.',
  v => (v || '').length <= MAX_USUARIO ||
    'El usuario no debe superar 20 caracteres.',
  v => /^[a-zA-Z0-9_]+$/.test(v || '') ||
    'Solo se permiten letras, números y guion bajo (_).'
]

const reglasCorreo = [
  v => !!v?.trim() || 'El correo es obligatorio.',
  v => (v || '').length <= MAX_CORREO ||
    'El correo no debe superar 254 caracteres.',
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ||
    'Ingresa un correo electrónico válido.'
]

const reglasContrasena = [
  v => !!v || 'La contraseña es obligatoria.',
  v => (v || '').length >= 8 ||
    'La contraseña debe tener al menos 8 caracteres.',
  v => (v || '').length <= MAX_CONTRASENA ||
    'La contraseña no debe superar 64 caracteres.',
  v => /[A-Za-z]/.test(v || '') ||
    'La contraseña debe incluir una letra.',
  v => /\d/.test(v || '') ||
    'La contraseña debe incluir un número.'
]

const reglasConfirmacion = [
  v => !!v || 'Debes confirmar tu contraseña.',
  v => v === contrasena.value ||
    'Las contraseñas no coinciden.'
]

// Validación general
const formularioValido = computed(() => {
  return (
    reglasNombre.every(regla => regla(nombre.value) === true) &&
    reglasUsuario.every(regla => regla(usuario.value) === true) &&
    reglasCorreo.every(regla => regla(correo.value) === true) &&
    reglasContrasena.every(regla => regla(contrasena.value) === true) &&
    reglasConfirmacion.every(
      regla => regla(confirmarContrasena.value) === true
    )
  )
})

// Limitar caracteres al escribir o pegar
function limitarTexto(valor, maximo) {
  return String(valor ?? '').slice(0, maximo)
}

// Seleccionar fotografía
function seleccionarFoto(event) {
  const archivo = event.target.files?.[0]

  foto.value = null
  vistaFoto.value = ''
  fotoEditada.value = ''
  mensaje.value = ''

  if (!archivo) return

  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  if (!tiposPermitidos.includes(archivo.type)) {
    tipoMensaje.value = 'warning'
    mensaje.value = 'Selecciona una imagen JPG, PNG o WEBP.'
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
    vistaFoto.value = String(lector.result || '')
  }

  lector.onerror = () => {
    foto.value = null
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
  mensaje.value = ''

  if (!formularioValido.value) {
    tipoMensaje.value = 'error'
    mensaje.value = 'Revisa los datos antes de continuar.'
    return
  }

  tipoMensaje.value = 'info'
  mensaje.value =
    'Todos los campos cumplen las validaciones. ' +
    'El registro real estará disponible cuando ' +
    'conectemos el backend.'

  // Esta versión no envía datos al servidor.
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

      <v-form @submit.prevent="registrarUsuario">

        <!-- Nombre completo -->
        <v-text-field
          :model-value="nombre"
          @update:model-value="
            nombre = limitarTexto($event, MAX_NOMBRE)
          "
          label="Nombre completo"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          :rules="reglasNombre"
          :maxlength="MAX_NOMBRE"
          :counter="MAX_NOMBRE"
          validate-on="input"
          required
        />

        <!-- Usuario -->
        <v-text-field
          :model-value="usuario"
          @update:model-value="
            usuario = limitarTexto($event, MAX_USUARIO)
          "
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account-circle"
          variant="outlined"
          :rules="reglasUsuario"
          :maxlength="MAX_USUARIO"
          :counter="MAX_USUARIO"
          validate-on="input"
          hint="De 4 a 20 caracteres. Letras, números o guion bajo."
          persistent-hint
          required
        />

        <!-- Correo -->
        <v-text-field
          :model-value="correo"
          @update:model-value="
            correo = limitarTexto($event, MAX_CORREO)
          "
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :rules="reglasCorreo"
          :maxlength="MAX_CORREO"
          :counter="MAX_CORREO"
          validate-on="input"
          required
        />

        <!-- Contraseña -->
        <v-text-field
          :model-value="contrasena"
          @update:model-value="
            contrasena = limitarTexto($event, MAX_CONTRASENA)
          "
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
          :maxlength="MAX_CONTRASENA"
          :counter="MAX_CONTRASENA"
          validate-on="input"
          hint="Entre 8 y 64 caracteres, con letras y números."
          persistent-hint
          required
        />

        <!-- Confirmación -->
        <v-text-field
          :model-value="confirmarContrasena"
          @update:model-value="
            confirmarContrasena =
              limitarTexto($event, MAX_CONTRASENA)
          "
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
          :maxlength="MAX_CONTRASENA"
          validate-on="input"
          required
        />

        <v-divider class="my-5" />

        <!-- Fotografía -->
        <h2 class="text-subtitle-1 mb-3">
          Fotografía de perfil
        </h2>

        <p class="text-body-2 mb-3">
          Puedes seleccionar una imagen desde
          tu computadora o utilizar la cámara.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
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

        <!-- Cámara facial -->
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
