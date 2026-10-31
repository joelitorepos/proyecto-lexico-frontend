<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CamaraFacial from '../components/CamaraFacial.vue'
import EditorFoto from '../components/EditorFoto.vue'
import { authApi } from '@/services/api'

const router = useRouter()

// Datos del formulario
const nombre = ref('')
const usuario = ref('')
const correo = ref('')
const telefono = ref('')
const fechaNacimiento = ref('')
const contrasena = ref('')
const confirmarContrasena = ref('')
const metodoNotificacion = ref('EMAIL')

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
const registrando = ref(false)

// Límites
const MAX_NOMBRE = 80
const MAX_USUARIO = 30
const MAX_CORREO = 150
const MAX_CONTRASENA = 64
const MAX_TELEFONO = 20

// Reglas de validación
const reglasNombre = [
  (v) => !!v?.trim() || 'El nombre completo es obligatorio.',
  (v) =>
    (v?.trim().length || 0) >= 3 ||
    'El nombre debe tener al menos 3 caracteres.',
  (v) =>
    (v?.trim().length || 0) <= MAX_NOMBRE ||
    `El nombre no debe superar ${MAX_NOMBRE} caracteres.`,
]

const reglasUsuario = [
  (v) => !!v || 'El usuario es obligatorio.',
  (v) =>
    (v || '').length >= 3 ||
    'El usuario debe tener al menos 3 caracteres.',
  (v) =>
    (v || '').length <= MAX_USUARIO ||
    `El usuario no debe superar ${MAX_USUARIO} caracteres.`,
  (v) =>
    /^[a-zA-Z0-9_.-]+$/.test(v || '') ||
    'Solo se permiten letras, números, punto, guion y guion bajo.',
]

const reglasCorreo = [
  (v) => !!v?.trim() || 'El correo es obligatorio.',
  (v) =>
    (v || '').length <= MAX_CORREO ||
    `El correo no debe superar ${MAX_CORREO} caracteres.`,
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ||
    'Ingresa un correo electrónico válido.',
]

const reglasTelefono = [
  (v) => !!v?.trim() || 'El teléfono es obligatorio.',
  (v) =>
    /^\+?\d{8,15}$/.test((v || '').replace(/[\s\-().]/g, '')) ||
    'Entre 8 y 15 dígitos, con o sin código de país.',
]

const reglasFechaNacimiento = [
  (v) => !!v || 'La fecha de nacimiento es obligatoria.',
  (v) => {
    const fecha = new Date(v)
    const hoy = new Date()
    return fecha < hoy || 'La fecha debe ser anterior a hoy.'
  },
]

const reglasContrasena = [
  (v) => !!v || 'La contraseña es obligatoria.',
  (v) =>
    (v || '').length >= 8 ||
    'La contraseña debe tener al menos 8 caracteres.',
  (v) =>
    (v || '').length <= MAX_CONTRASENA ||
    `La contraseña no debe superar ${MAX_CONTRASENA} caracteres.`,
  (v) =>
    /[A-Za-z]/.test(v || '') ||
    'La contraseña debe incluir una letra.',
  (v) =>
    /\d/.test(v || '') ||
    'La contraseña debe incluir un número.',
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
    reglasNombre.every((r) => r(nombre.value) === true) &&
    reglasUsuario.every((r) => r(usuario.value) === true) &&
    reglasCorreo.every((r) => r(correo.value) === true) &&
    reglasTelefono.every((r) => r(telefono.value) === true) &&
    reglasFechaNacimiento.every((r) => r(fechaNacimiento.value) === true) &&
    reglasContrasena.every((r) => r(contrasena.value) === true) &&
    reglasConfirmacion.every((r) => r(confirmarContrasena.value) === true)
  )
})

// Limitar caracteres al escribir o pegar
function limitarTexto(valor, maximo) {
  return String(valor ?? '').slice(0, maximo)
}

// Seleccionar fotografía desde archivo
function seleccionarFoto(event) {
  const archivo = event.target.files?.[0]

  foto.value = null
  vistaFoto.value = ''
  fotoEditada.value = ''
  mensaje.value = ''

  if (!archivo) return

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']

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

// Enviar registro al backend
async function registrarUsuario() {
  mensaje.value = ''

  if (!formularioValido.value) {
    tipoMensaje.value = 'error'
    mensaje.value = 'Revisa los datos antes de continuar.'
    return
  }

  // Prioridad para fotoOriginal: editada > capturada por cámara > subida
  const fotoOriginal =
    fotoEditada.value || fotoFacial.value || vistaFoto.value || null

  const payload = {
    email: correo.value.trim().toLowerCase(),
    telefono: telefono.value.trim(),
    fechaNacimiento: fechaNacimiento.value, // 'YYYY-MM-DD'
    nickname: usuario.value.trim(),
    password: contrasena.value,
    metodoNotificacion: metodoNotificacion.value || null,
    fotoOriginal: fotoOriginal,
    // Si el editor produce una versión aparte, aquí iría fotoModificada.
    // Por ahora el editor devuelve una sola imagen; se envía como original.
  }

  registrando.value = true
  tipoMensaje.value = 'info'
  mensaje.value = 'Enviando registro…'

  try {
    const data = await authApi.registrar(payload)
    const canales = data.notificacionesProgramadas?.join(', ') || 'ninguna'

    tipoMensaje.value = 'success'
    mensaje.value =
      `¡Registro exitoso! Usuario: ${data.nickname} (id ${data.idUsuario}). ` +
      `Notificaciones programadas: ${canales}.`

    // Limpiar formulario tras éxito
    nombre.value = ''
    usuario.value = ''
    correo.value = ''
    telefono.value = ''
    fechaNacimiento.value = ''
    contrasena.value = ''
    confirmarContrasena.value = ''
    metodoNotificacion.value = 'EMAIL'
    foto.value = null
    vistaFoto.value = ''
    fotoFacial.value = ''
    fotoEditada.value = ''
  } catch (error) {
    tipoMensaje.value = 'error'
    mensaje.value = error.message || 'No se pudo completar el registro.'
  } finally {
    registrando.value = false
  }
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

        <!-- Usuario (nickname) -->
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
          hint="De 3 a 30 caracteres. Letras, números, punto, guion o guion bajo."
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

        <!-- Teléfono -->
        <v-text-field
          :model-value="telefono"
          @update:model-value="
            telefono = limitarTexto($event, MAX_TELEFONO)
          "
          label="Teléfono"
          prepend-inner-icon="mdi-phone"
          variant="outlined"
          :rules="reglasTelefono"
          :maxlength="MAX_TELEFONO"
          :counter="MAX_TELEFONO"
          validate-on="input"
          hint="Ej: 50212345678 (con código de país, sin espacios)."
          persistent-hint
          required
        />

        <!-- Fecha de nacimiento -->
        <v-text-field
          v-model="fechaNacimiento"
          label="Fecha de nacimiento"
          type="date"
          prepend-inner-icon="mdi-cake-variant"
          variant="outlined"
          :rules="reglasFechaNacimiento"
          validate-on="input"
          required
        />

        <!-- Método de notificación -->
        <v-select
          v-model="metodoNotificacion"
          :items="[
            { title: 'Correo electrónico', value: 'EMAIL' },
            { title: 'WhatsApp', value: 'WHATSAPP' },
            { title: 'Ambos', value: 'AMBOS' },
            { title: 'No notificar', value: null },
          ]"
          label="Método de notificación"
          prepend-inner-icon="mdi-bell-outline"
          variant="outlined"
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
          :loading="registrando"
          :disabled="!formularioValido || registrando"
        >
          Registrarse
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>