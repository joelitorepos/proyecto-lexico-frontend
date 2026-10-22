
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  imagen: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['foto-editada'])

const filtro = ref('normal')
const sticker = ref('ninguno')

const filtros = [
  { title: 'Normal', value: 'normal' },
  { title: 'Blanco y negro', value: 'grises' },
  { title: 'Sepia', value: 'sepia' },
  { title: 'Vintage', value: 'vintage' },
  { title: 'Brillante', value: 'brillante' },
]

const stickers = [
  { title: 'Sin sticker', value: 'ninguno' },
  { title: 'Estrella ⭐', value: '⭐' },
  { title: 'Corazón ❤️', value: '❤️' },
  { title: 'Sonrisa 😎', value: '😎' },
  { title: 'Celebración 🎉', value: '🎉' },
]

const estiloFiltro = computed(() => {
  const estilos = {
    normal: 'none',
    grises: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    vintage: 'sepia(50%) contrast(85%)',
    brillante: 'brightness(125%) saturate(120%)',
  }

  return estilos[filtro.value]
})

function guardarFoto() {
  if (!props.imagen) return

  const imagen = new Image()

  imagen.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = imagen.naturalWidth
    canvas.height = imagen.naturalHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.filter = estiloFiltro.value
    ctx.drawImage(imagen, 0, 0)

    ctx.filter = 'none'

    if (sticker.value !== 'ninguno') {
      const tamano = Math.max(
        24,
        Math.round(canvas.width * 0.13)
      )

      ctx.font = `${tamano}px "Segoe UI Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        sticker.value,
        canvas.width * 0.82,
        canvas.height * 0.18
      )
    }

    const resultado = canvas.toDataURL(
      'image/jpeg',
      0.9
    )

    emit('foto-editada', resultado)
  }

  imagen.src = props.imagen
}
</script>

<template>
  <v-card
    v-if="imagen"
    variant="outlined"
    class="pa-4 mt-4"
  >
    <h3 class="text-h6 mb-3">
      <v-icon icon="mdi-image-edit" class="mr-2" />
      Editor de fotografía
    </h3>

    <p class="text-body-2 mb-4">
      Personaliza tu fotografía de perfil
      utilizando filtros y stickers.
    </p>

    <div class="vista-previa mb-4">
      <img
        :src="imagen"
        alt="Vista previa de la fotografía"
        :style="{ filter: estiloFiltro }"
      />

      <span
        v-if="sticker !== 'ninguno'"
        class="sticker"
      >
        {{ sticker }}
      </span>
    </div>

    <v-select
      v-model="filtro"
      :items="filtros"
      label="Seleccionar filtro"
      variant="outlined"
    />

    <v-select
      v-model="sticker"
      :items="stickers"
      label="Seleccionar sticker"
      variant="outlined"
    />

    <v-btn
      color="secondary"
      prepend-icon="mdi-content-save"
      block
      @click="guardarFoto"
    >
      Guardar fotografía editada
    </v-btn>
  </v-card>
</template>

<style scoped>
.vista-previa {
  position: relative;
  width: 100%;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
  border-radius: 12px;
  background: #e5e7eb;
}

.vista-previa img {
  display: block;
  width: 100%;
  height: auto;
}

.sticker {
  position: absolute;
  top: 12%;
  left: 82%;
  transform: translate(-50%, -50%);
  font-size: clamp(24px, 8vw, 45px);
  line-height: 1;
}
</style>
