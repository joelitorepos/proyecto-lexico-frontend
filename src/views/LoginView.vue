<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import CamaraFacial from '../components/CamaraFacial.vue'
import { authApi } from '@/services/api'

const router = useRouter()

// Método de autenticación
const metodo = ref('contrasena')

// Credenciales
const correo = ref('')
const contrasena = ref('')
const mostrarContrasena = ref(false)

// Fotografía facial (método alternativo, aún sin backend)
const fotoFacial = ref('')

// QR: subida de imagen (para método visual) y código manual (para backend)
const archivoQR = ref(null)
const codigoQr = ref('')
const resultadoQr = ref(null)

// Estados
const mensaje = ref('')
const tipoMensaje = ref('info')
const procesando = ref(false)

const metodos = [
  { title: 'Correo y contraseña', value: 'contrasena' },
  { title: 'Correo y fotografía', value: 'facial' },
  { title: 'Código QR', value: 'qr' },
]

const reglasCorreo = [
  (v) => !!v?.trim() || 'El correo es obligatorio.',
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ||
    'Ingresa un correo electrónico válido.',
]

const reglasContrasena = [
  (v) => !!v || 'La contraseña es obligatoria.',
]

const puedeIngresar = computed(() => {
  if (metodo.value === 'contrasena') {
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value) &&
      contrasena.value.length > 0
    )
  }
  if (metodo.value === 'facial') {
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value) &&
      !!fotoFacial.value
    )
  }
  if (metodo.value === 'qr') {
    return codigoQr.value.trim().length > 0
  }
  return false
})

function cambiarMetodo(valor) {
  metodo.value = valor
  mensaje.value = ''
  resultadoQr.value = null
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

async function iniciarSesion() {
  if (!puedeIngresar.value) {
    tipoMensaje.value = 'error'
    mensaje.value = 'Completa los datos requeridos.'
    return
  }

  procesando.value = true
  mensaje.value = ''
  resultadoQr.value = null

  try {
    if (metodo.value === 'contrasena') {
      const data = await authApi.login({
        email: correo.value.trim().toLowerCase(),
        password: contrasena.value,
      })

      // Sesión local (sin JWT por ahora)
      localStorage.setItem('lexiscan_user', JSON.stringify(data))

      tipoMensaje.value = 'success'
      mensaje.value = `Bienvenido, ${data.nickname}.`

      // Redirige al análisis (ajusta el 'name' si tu router lo llama distinto)
      router.push({ name: 'analisis' }).catch(() => router.push('/'))
    } else if (metodo.value === 'facial') {
      // El backend aún no expone login facial. Se mantiene el mensaje informativo.
      tipoMensaje.value = 'info'
      mensaje.value =
        'El inicio de sesión con fotografía estará disponible próximamente.'
    } else if (metodo.value === 'qr') {
      // El backend recibe el CÓDIGO del QR, no la imagen.
      const data = await authApi.verificarQr(codigoQr.value.trim())
      resultadoQr.value = data

      if (data.valido) {
        tipoMensaje.value = 'success'
        mensaje.value = `Credencial válida: ${data.nickname}.`
      } else {
        tipoMensaje.value = 'error'
        mensaje.value = data.mensaje || 'Credencial no válida o revocada.'
      }
    }
  } catch (error) {
    tipoMensaje.value = 'error'
    mensaje.value = error.message || 'No se pudo completar la operación.'
  } finally {
    procesando.value = false
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

      <!-- Correo y contraseña -->
      <div v-if="metodo === 'contrasena'">
        <v-text-field
          v-model="correo"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :rules="reglasCorreo"
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

      <!-- Correo y fotografía -->
      <div v-if="metodo === 'facial'">
        <v-text-field
          v-model="correo"
          label="Correo electrónico"
          type="email"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          :rules="reglasCorreo"
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
            Pega el código que contiene tu QR
            para verificar tu credencial.
          </p>
        </div>

        <v-text-field
          v-model="codigoQr"
          label="Código del QR"
          prepend-inner-icon="mdi-qrcode"
          variant="outlined"
          hint="El código es el texto que viene dentro del QR."
          persistent-hint
        />

        <v-alert
          v-if="resultadoQr"
          :type="resultadoQr.valido ? 'success' : 'error'"
          variant="tonal"
          class="mt-4"
        >
          {{
            resultadoQr.valido
              ? `Credencial válida: ${resultadoQr.nickname}`
              : resultadoQr.mensaje
          }}
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