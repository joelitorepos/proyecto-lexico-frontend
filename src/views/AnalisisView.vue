
<script setup>
import { ref, computed } from 'vue'

const archivo = ref(null)
const idioma = ref('es')
const procesando = ref(false)
const mensaje = ref('')
const tipoMensaje = ref('info')
const resultados = ref(null)

const idiomas = [
  { title: 'Español', value: 'es' },
  { title: 'Inglés', value: 'en' },
]

const nombreArchivo = computed(() =>
  archivo.value?.name || 'Ningún archivo seleccionado'
)

const puedeProcesar = computed(() =>
  archivo.value !== null && !procesando.value
)

const frecuenciaMaxima = computed(() => {
  if (!resultados.value) return 1

  return Math.max(
    1,
    ...resultados.value.palabrasFrecuentes.map(
      (item) => item.cantidad
    )
  )
})

function seleccionarArchivo(event) {
  const seleccionado = event.target.files?.[0]

  archivo.value = null
  resultados.value = null
  mensaje.value = ''

  if (!seleccionado) return

  const extension = seleccionado.name
    .split('.')
    .pop()
    ?.toLowerCase()

  if (extension !== 'txt') {
    mensaje.value = 'Selecciona un archivo .txt.'
    tipoMensaje.value = 'warning'
    event.target.value = ''
    return
  }

  if (seleccionado.size > 5 * 1024 * 1024) {
    mensaje.value = 'El archivo no debe superar los 5 MB.'
    tipoMensaje.value = 'warning'
    event.target.value = ''
    return
  }

  archivo.value = seleccionado
}

async function procesarArchivo() {
  if (!archivo.value || procesando.value) return

  procesando.value = true
  mensaje.value = ''
  resultados.value = null

  try {
    const token = sessionStorage.getItem('tokenLexico')

    if (!token) {
      tipoMensaje.value = 'warning'
      mensaje.value =
        'Debes iniciar sesión nuevamente para procesar archivos.'
      return
    }

    const formulario = new FormData()
    formulario.append('archivo', archivo.value)
    formulario.append('idioma', idioma.value)

    const respuesta = await fetch(
      'http://127.0.0.1:8000/api/analisis',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formulario,
      }
    )

    const datos = await respuesta.json()

    if (!respuesta.ok) {
      if (respuesta.status === 401 || respuesta.status === 403) {
        sessionStorage.removeItem('tokenLexico')
        sessionStorage.removeItem('usuarioLexico')

        tipoMensaje.value = 'warning'
        mensaje.value =
          'Tu sesión ha vencido o no es válida. Inicia sesión nuevamente.'
      } else {
        tipoMensaje.value = 'error'
        mensaje.value =
          typeof datos.detail === 'string'
            ? datos.detail
            : 'No fue posible registrar el análisis.'
      }
      return
    }

    // Estadísticas detalladas calculadas en el navegador.
    const contenido = await archivo.value.text()

    const palabras =
      contenido.match(/\p{L}+(?:['’]\p{L}+)*/gu) || []

    const frecuencias = {}

    for (const palabra of palabras) {
      const normalizada = palabra.toLocaleLowerCase(
        idioma.value === 'en' ? 'en' : 'es'
      )

      frecuencias[normalizada] =
        (frecuencias[normalizada] || 0) + 1
    }

    const todasLasFrecuencias = Object.entries(frecuencias)
      .sort(
        (a, b) =>
          b[1] - a[1] ||
          a[0].localeCompare(b[0])
      )
      .map(([palabra, cantidad]) => ({
        palabra,
        cantidad,
      }))

    resultados.value = {
      idAnalisis: datos.idAnalisis,
      totalPalabras: palabras.length,
      palabrasUnicas: todasLasFrecuencias.length,
      totalCaracteres: contenido.length,
      totalLineas: contenido
        ? contenido.split(/\r\n|\r|\n/).length
        : 0,
      palabrasFrecuentes: todasLasFrecuencias.slice(0, 10),
      todasLasFrecuencias,
    }

    tipoMensaje.value = 'success'
    mensaje.value =
      `Análisis completado y registrado en MySQL. ` +
      `Registro N.º ${datos.idAnalisis}.`

  } catch (error) {
    console.error('Error al procesar:', error)
    tipoMensaje.value = 'error'
    mensaje.value =
      'No fue posible completar el análisis. ' +
      'Verifica que el backend esté encendido.'
  } finally {
    procesando.value = false
  }
}

function descargarCSV() {
  if (!resultados.value) return

  const filas = [
    ['Palabra', 'Frecuencia'],
    ...resultados.value.todasLasFrecuencias.map(
      (item) => [item.palabra, item.cantidad]
    ),
  ]

  // Evitar que Excel interprete palabras como fórmulas.
  function protegerCelda(valor) {
    const texto = String(valor)

    const seguro = /^[\s]*[=+\-@\t\r]/.test(texto)
      ? "'" + texto
      : texto

    return '"' + seguro.replace(/"/g, '""') + '"'
  }

  const contenido = filas
    .map((fila) => fila.map(protegerCelda).join(','))
    .join('\r\n')

  const blob = new Blob(
    ['\uFEFF', contenido],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')

  enlace.href = url
  enlace.download = 'resultado-analisis-lexico.csv'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<template>
  <v-container class="py-8">
    <v-card
      class="mx-auto pa-6"
      max-width="1000"
      elevation="4"
      rounded="lg"
    >
      <div class="text-center mb-6">
        <v-icon
          icon="mdi-file-document-outline"
          color="primary"
          size="65"
        />

        <h1 class="text-h5 mt-3">
          Análisis Léxico
        </h1>

        <p class="text-body-2 mt-2">
          Carga un archivo de texto y consulta
          sus estadísticas y frecuencias.
        </p>
      </div>

      <v-divider class="mb-6" />

      <h2 class="text-subtitle-1 mb-3">
        Seleccionar archivo
      </h2>

      <input
        type="file"
        accept=".txt,text/plain"
        @change="seleccionarArchivo"
      />

      <v-alert
        type="info"
        variant="tonal"
        class="my-4"
      >
        Archivo seleccionado: {{ nombreArchivo }}
      </v-alert>

      <v-select
        v-model="idioma"
        :items="idiomas"
        label="Idioma del documento"
        prepend-inner-icon="mdi-translate"
        variant="outlined"
        class="mt-4"
      />

      <v-btn
        color="secondary"
        size="large"
        block
        prepend-icon="mdi-play-circle"
        :loading="procesando"
        :disabled="!puedeProcesar"
        @click="procesarArchivo"
      >
        Procesar archivo
      </v-btn>

      <v-alert
        v-if="mensaje"
        :type="tipoMensaje"
        class="mt-5"
      >
        {{ mensaje }}
      </v-alert>

      <div v-if="resultados" class="mt-8">
        <v-divider class="mb-6" />

        <h2 class="text-h6 mb-5">
          <v-icon
            icon="mdi-chart-box"
            color="primary"
            class="mr-2"
          />
          Resultados del análisis
        </h2>

        <v-alert
          v-if="resultados.idAnalisis"
          type="success"
          variant="tonal"
          class="mb-5"
        >
          Registro en MySQL N.º {{ resultados.idAnalisis }}
        </v-alert>

        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card color="primary" class="pa-4 text-center">
              <div class="text-h4">
                {{ resultados.totalPalabras }}
              </div>
              <div>Total de palabras</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card color="secondary" class="pa-4 text-center">
              <div class="text-h4">
                {{ resultados.palabrasUnicas }}
              </div>
              <div>Palabras únicas</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="pa-4 text-center">
              <div class="text-h4">
                {{ resultados.totalCaracteres }}
              </div>
              <div>Caracteres</div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="pa-4 text-center">
              <div class="text-h4">
                {{ resultados.totalLineas }}
              </div>
              <div>Líneas</div>
            </v-card>
          </v-col>
        </v-row>

        <h3 class="text-h6 mt-8 mb-4">
          Las 10 palabras más frecuentes
        </h3>

        <v-table>
          <thead>
            <tr>
              <th>Palabra</th>
              <th>Frecuencia</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in resultados.palabrasFrecuentes"
              :key="item.palabra"
            >
              <td>{{ item.palabra }}</td>
              <td>{{ item.cantidad }}</td>
            </tr>

            <tr v-if="!resultados.palabrasFrecuentes.length">
              <td colspan="2">
                No se encontraron palabras.
              </td>
            </tr>
          </tbody>
        </v-table>

        <h3 class="text-h6 mt-8 mb-4">
          Gráfica de frecuencias
        </h3>

        <div
          v-for="item in resultados.palabrasFrecuentes"
          :key="'grafica-' + item.palabra"
          class="mb-4"
        >
          <div class="d-flex justify-space-between mb-1">
            <span>{{ item.palabra }}</span>
            <strong>{{ item.cantidad }}</strong>
          </div>

          <v-progress-linear
            :model-value="
              (item.cantidad / frecuenciaMaxima) * 100
            "
            color="secondary"
            height="16"
            rounded
          />
        </div>

        <v-alert
          v-if="!resultados.palabrasFrecuentes.length"
          type="info"
          variant="tonal"
        >
          No hay datos para graficar.
        </v-alert>

        <v-divider class="my-6" />

        <v-btn
          color="primary"
          size="large"
          block
          prepend-icon="mdi-download"
          @click="descargarCSV"
        >
          Descargar resultados CSV
        </v-btn>

        <v-alert
          type="warning"
          variant="tonal"
          class="mt-6"
        >
          El backend registra el análisis en MySQL.
          Las estadísticas y gráficas detalladas
          se calculan en el navegador.
          La clasificación de sustantivos, verbos
          y pronombres, así como el reporte PDF,
          todavía están pendientes.
        </v-alert>
      </div>
    </v-card>
  </v-container>
</template>
