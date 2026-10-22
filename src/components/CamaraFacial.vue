
<script setup>
import { ref, onBeforeUnmount } from 'vue'

const emit = defineEmits(['foto-capturada'])

const video = ref(null)
const camaraActiva = ref(false)
const fotoCapturada = ref('')
const errorCamara = ref('')
let stream = null

async function iniciarCamara() {
  errorCamara.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    errorCamara.value =
      'Tu navegador no permite acceder a la cámara.'
    return
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
      },
      audio: false,
    })

    camaraActiva.value = true

    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })

    if (video.value) {
      video.value.srcObject = stream
      await video.value.play()
    }
  } catch (error) {
    detenerCamara()
    errorCamara.value =
      'No se pudo acceder a la cámara. Revisa los permisos.'
    console.error(error)
  }
}

function tomarFoto() {
  if (!video.value || !camaraActiva.value) return

  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth
  canvas.height = video.value.videoHeight

  if (!canvas.width || !canvas.height) {
    errorCamara.value = 'La cámara todavía no está lista.'
    return
  }

  const contexto = canvas.getContext('2d')
  contexto.drawImage(video.value, 0, 0)

  fotoCapturada.value = canvas.toDataURL('image/jpeg', 0.9)

  emit('foto-capturada', fotoCapturada.value)
  detenerCamara()
}

function detenerCamara() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }

  if (video.value) {
    video.value.srcObject = null
  }

  camaraActiva.value = false
}

function repetirFoto() {
  fotoCapturada.value = ''
  emit('foto-capturada', '')
  iniciarCamara()
}

onBeforeUnmount(() => {
  detenerCamara()
})
</script>

<template>
  <v-card variant="outlined" class="pa-4 mt-4">
    <h3 class="text-h6 mb-3">
      <v-icon icon="mdi-camera" class="mr-2" />
      Captura de fotografía
    </h3>

    <p class="text-body-2 mb-4">
      Puedes utilizar la cámara de tu computadora
      para capturar una fotografía.
    </p>

    <v-alert
      v-if="errorCamara"
      type="warning"
      class="mb-4"
    >
      {{ errorCamara }}
    </v-alert>

    <video
      v-show="camaraActiva"
      ref="video"
      autoplay
      playsinline
      muted
      class="vista-camara"
    />

    <v-img
      v-if="fotoCapturada"
      :src="fotoCapturada"
      max-height="300"
      class="mb-4"
      contain
    />

    <v-btn
      v-if="!camaraActiva && !fotoCapturada"
      color="primary"
      prepend-icon="mdi-camera"
      @click="iniciarCamara"
    >
      Activar cámara
    </v-btn>

    <v-btn
      v-if="camaraActiva"
      color="secondary"
      prepend-icon="mdi-camera-iris"
      @click="tomarFoto"
    >
      Tomar fotografía
    </v-btn>

    <v-btn
      v-if="camaraActiva"
      variant="outlined"
      class="ml-2"
      @click="detenerCamara"
    >
      Cancelar
    </v-btn>

    <v-btn
      v-if="fotoCapturada"
      color="primary"
      prepend-icon="mdi-refresh"
      @click="repetirFoto"
    >
      Repetir fotografía
    </v-btn>
  </v-card>
</template>

<style scoped>
.vista-camara {
  width: 100%;
  max-height: 350px;
  border-radius: 12px;
  background: #111827;
  object-fit: contain;
  margin-bottom: 16px;
}
</style>
