# Proyecto Final - Análisis Léxico (Frontend)

Curso: Lenguajes Formales y Autómatas

Frontend del sistema de análisis léxico. Permite al usuario registrarse, iniciar
sesión y cargar un documento de texto para su análisis.

## Tecnologías

- [Vite](https://vite.dev/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vue Router](https://router.vuejs.org/)

## Requisitos previos

Antes de clonar el proyecto asegúrate de tener instalado:

- **Node.js** versión 18 o superior ([descargar aquí](https://nodejs.org/))
- **Git** ([descargar aquí](https://git-scm.com/downloads))

Para verificar que ya los tienes instalados, corre en tu terminal:

```bash
node -v
git -v
```

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/USUARIO/proyecto-lexico-frontend.git
cd proyecto-lexico-frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Corre el proyecto en modo desarrollo:

```bash
npm run dev
```

4. Abre tu navegador en la URL que te muestre la terminal (normalmente
   `http://localhost:5173`).

## Estructura del proyecto

```
/src
  /pages        → Vistas/páginas de la app (Login, Registro, Dashboard, etc.)
  /components   → Componentes reutilizables
  /composables  → Lógica compartida (auth, llamadas a la API)
  /router       → Configuración de rutas (Vue Router)
  App.vue       → Componente raíz
  main.js       → Punto de entrada de la aplicación
```

## Cómo agregar una nueva página

1. Crea tu componente `.vue` dentro de `/src/pages`.
2. Ábrelo en `src/router/index.js` e impórtalo.
3. Agrega su ruta al arreglo `routes`, por ejemplo:

```js
import Login from '../pages/Login.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login },
]
```

## Flujo de trabajo con Git

- `main` → rama estable, no se hacen commits directos aquí.
- `develop` → rama de integración.
- Cada tarea se trabaja en una rama `feature/nombre-de-la-tarea` a partir de
  `develop`, y se sube mediante Pull Request.

```bash
git checkout develop
git pull
git checkout -b feature/nombre-de-la-tarea
# ... trabajas y haces commits ...
git push -u origin feature/nombre-de-la-tarea
```

Luego abres el Pull Request en GitHub hacia `develop`.

## Scripts disponibles

| Comando           | Descripción                                  |
|-------------------|-----------------------------------------------|
| `npm run dev`     | Levanta el servidor de desarrollo             |
| `npm run build`   | Genera el build de producción en `/dist`      |
| `npm run preview` | Sirve localmente el build de producción       |

## Despliegue

El proyecto se despliega automáticamente en **Cloudflare Pages** al hacer push
a la rama `main`.