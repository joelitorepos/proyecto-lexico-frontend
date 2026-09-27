<script setup>
import { ref } from 'vue'

const fileName = ref('')

function handleFileChange(event) {
  const file = event.target.files[0]
  fileName.value = file ? file.name : ''
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-1">
        Análisis Léxico
      </h1>
      <p class="text-slate-500 text-sm mb-6">
        Proyecto Final - Lenguajes Formales y Autómatas
      </p>

      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Idioma del documento
        </label>
        <select
          class="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>Español</option>
          <option>Inglés</option>
          <option>Ruso</option>
        </select>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-1">
          Archivo (.txt)
        </label>
        <input
          type="file"
          accept=".txt"
          @change="handleFileChange"
          class="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100"
        />
        <p v-if="fileName" class="text-xs text-slate-400 mt-1">
          Seleccionado: {{ fileName }}
        </p>
      </div>

      <button
        type="button"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        Procesar
      </button>
    </div>
  </div>
</template>