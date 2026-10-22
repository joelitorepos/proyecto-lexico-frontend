
const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(
  endpoint,
  options = {}
) {
  if (!API_URL) {
    throw new Error(
      'La URL del backend aún no está configurada.'
    )
  }

  const respuesta = await fetch(
    `${API_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`,
    {
      ...options,
      headers: {
        ...options.headers,
      },
    }
  )

  const tipoContenido =
    respuesta.headers.get('content-type') || ''

  const datos = tipoContenido.includes('application/json')
    ? await respuesta.json()
    : await respuesta.text()

  if (!respuesta.ok) {
    throw new Error(
      typeof datos === 'object' && datos?.message
        ? datos.message
        : `Error del servidor: ${respuesta.status}`
    )
  }

  return datos
}
