
<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CamaraFacial from '../components/CamaraFacial.vue'
import { authApi } from '@/services/api'

const router = useRouter()
const route = useRoute()

const metodo = ref('contrasena')
const correo = ref('')
const contrasena = ref('')
const mostrarContrasena = ref(false)

const fotoFacial = ref('')
const codigoQr = ref('')
const resultadoQr = ref(null)

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

async function iniciarSesion() {
  if (!puedeIngresar.value || procesando.value) return

  mensaje.value = ''
  resultadoQr.value = null

  if (metodo.value === 'facial') {
    tipoMensaje.value = 'info'
    mensaje.value =
      'El inicio de sesión con fotografía estará disponible próximamente.'
    return
  }

  procesando.value = true

  try {
    if (metodo.value === 'contrasena') {
      const datos = await authApi.login({
        email: correo.value.trim().toLowerCase(),
        password: contrasena.value,
      })

      if (!datos.accessToken || datos.tokenType?.toLowerCase() !== 'bearer') {
        throw new Error('El servidor no devolvió una sesión JWT válida.')
      }

      sessionStorage.setItem('tokenLexico', datos.accessToken)

      sessionStorage.setItem(
        'usuarioLexico',
        JSON.stringify({
          idUsuario: datos.idUsuario,
          nickname: datos.nickname,
        })
      )

      tipoMensaje.value = 'success'
      mensaje.value = `Bienvenido, ${datos.nickname}.`

      const destino =
        typeof route.query.redirect === 'string' &&
        route.query.redirect.startsWith('/') &&
        !route.query.redirect.startsWith('//')
          ? route.query.redirect
          : '/analisis'

      await router.push(destino)
    } else if (metodo.value === 'qr') {
      const datos = await authApi.verificarQr(codigoQr.value.trim())
      resultadoQr.value = datos

      tipoMensaje.value = datos.valido ? 'success' : 'error'
      mensaje.value = datos.valido
        ? `Credencial válida: ${datos.nickname}.`
        : datos.mensaje || 'Credencial no válida o revocada.'
    }
  } catch (error) {
    console.error('Error de autenticación:', error)
    tipoMensaje.value = 'error'
    mensaje.value =
      error.message || 'No se pudo completar la operación.'
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

        <h1 class="text-h5 mt-3">Inicio de sesión</h1>

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

        <v-alert type="info" variant="tonal" class="mb-4">
          Captura una fotografía de tu rostro para verificar tu identidad.
        </v-alert>

        <CamaraFacial @foto-capturada="recibirFoto" />

        <v-alert
          v-if="fotoFacial"
          type="success"
          variant="tonal"
          class="mt-4"
        >
          Fotografía capturada correctamente.
        </v-alert>
      </div>

      <div v-if="metodo === 'qr'">
        <div class="text-center mb-4">
          <v-icon
            icon="mdi-qrcode-scan"
            size="90"
            color="primary"
          />

          <p class="mt-3">
            Pega el código que contiene tu QR para verificar tu credencial.
          </p>
        </div>

        <v-text-field
          v-model="codigoQr"
          label="Código del QR"
          prepend-inner-icon="mdi-qrcode"
          variant="outlined"
          hint="Introduce el texto que contiene el código QR."
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

      <v-alert
        v-if="mensaje"
        :type="tipoMensaje"
        class="my-4"
      >
        {{ mensaje }}
      </v-alert>

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
        <span class="text-body-2">¿No tienes una cuenta?</span>

        <router-link to="/registro">
          Regístrate aquí
        </router-link>
      </div>
    </v-card>
  </v-container>
</template>
