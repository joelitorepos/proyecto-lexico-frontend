const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
  if (!API_URL) {
    throw new Error('La URL del backend aún no está configurada.')
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

  const tipoContenido = respuesta.headers.get('content-type') || ''
  const datos = tipoContenido.includes('application/json')
    ? await respuesta.json()
    : await respuesta.text()

  if (!respuesta.ok) {
    // El backend devuelve { detail: "..." } en 401/409/422, y
    // { detail: [{ msg, loc, type }] } en 422 de Pydantic.
    let mensaje = `Error del servidor: ${respuesta.status}`
    if (typeof datos === 'object' && datos) {
      if (typeof datos.detail === 'string') {
        mensaje = datos.detail
      } else if (Array.isArray(datos.detail)) {
        mensaje = datos.detail
          .map((e) => e.msg || JSON.stringify(e))
          .join(' | ')
      } else if (typeof datos.message === 'string') {
        mensaje = datos.message
      }
    }
    throw new Error(mensaje)
  }

  return datos
}

// ---------------------------------------------------------------------------
// Helpers de JSON
// ---------------------------------------------------------------------------

function postJson(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const authApi = {
  /** GET /health — para verificar que el backend responde. */
  health: () => apiRequest('/health'),

  /** POST /api/auth/register */
  registrar: (datos) => postJson('/auth/register', datos),

  /** POST /api/auth/login */
  login: (datos) => postJson('/auth/login', datos),

  /** POST /api/auth/verificar-qr */
  verificarQr: (codigo) => postJson('/auth/verificar-qr', { codigo }),
}