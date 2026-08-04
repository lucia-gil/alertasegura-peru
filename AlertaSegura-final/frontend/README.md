# Frontend — AlertaSegura Perú

React + Vite + Tailwind CSS v4 + React Router + React Leaflet.

## Identidad visual — estilo Apple

Sin blancos ni negros puros: todas las superficies usan grises tibios
"off-white" (modo claro) y "off-black" (modo oscuro), igual que macOS/iOS
(`surface-0/1/2` y `surface-dark-0/1/2` en `src/index.css`). El acento de
marca sigue siendo morado/índigo (`marca-*`), usado con moderación sobre
las superficies neutras — no domina la pantalla, resalta sobre ella.

Tipografía del sistema (`-apple-system`, con fallback a Inter) en vez de
fuentes web descargadas — más ligero y más "nativo" en Mac. Espaciado
generoso, esquinas muy redondeadas (`rounded-xl`/`rounded-2xl`/`rounded-3xl`),
profundidad vía sombra + blur (`backdrop-blur-xl`) en vez de bordes duros.

### Modo oscuro

Toggle tipo iOS (`components/ThemeToggle.jsx`) en el Navbar y en las
pantallas de login/registro. Persiste en `localStorage` y respeta la
preferencia del sistema operativo si el usuario nunca eligió manualmente.
Un script inline en `index.html` aplica la clase `dark` antes de que React
monte, para que no haya parpadeo de tema al recargar la página.

El mapa (Leaflet) también se adapta: en modo oscuro se aplica un filtro de
inversión/tono a las teselas para que no quede un rectángulo blanco brillante
en medio de una UI oscura — mismo truco que usan los mapas nativos de iOS.

Para ajustar el color de acento, basta con cambiar los valores `--color-marca-*`
en `src/index.css`, se propaga a toda la app.

## Instalación

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El backend debe estar corriendo en
`http://localhost:8080` (ver el README de la raíz del proyecto).

## Compilar para producción

```bash
npm run build
npm run preview
```

Verificado: compila sin errores (132 módulos, build exitoso).

## Estructura

```
frontend/src/
├── main.jsx                    # entrypoint, envuelve la app en Theme+Auth Providers + BrowserRouter
├── App.jsx                     # define las 5 rutas de la aplicación
├── index.css                   # sistema de diseño (superficies, paleta, tipografía, dark mode)
├── components/
│   ├── Logo.jsx                 # ícono + nombre de marca, reutilizable
│   ├── Navbar.jsx                # barra translúcida con blur, incluye ThemeToggle
│   ├── ThemeToggle.jsx           # interruptor claro/oscuro estilo iOS
│   └── ProtectedRoute.jsx       # redirige a /login si no hay sesión (o a / si no es moderador)
├── context/
│   ├── AuthContext.jsx          # sesión de usuario, guardada en localStorage
│   └── ThemeContext.jsx         # tema claro/oscuro, guardado en localStorage
├── services/
│   ├── api.js                   # instancia de axios con interceptor de JWT
│   ├── authService.js
│   └── reporteService.js
├── data/
│   └── peru.js                  # departamentos y distritos de Lima, para los selects
└── pages/
    ├── auth/LoginPage.jsx
    ├── auth/RegisterPage.jsx
    ├── ciudadano/HomePage.jsx        # mapa + listado de reportes
    ├── ciudadano/CrearReportePage.jsx
    └── moderador/ModerarPage.jsx     # solo accesible con rol MODERADOR
```

## Roles y rutas

| Ruta | Requiere sesión | Requiere rol MODERADOR |
|---|---|---|
| `/login`, `/register` | No | No |
| `/` (mapa) | Sí | No |
| `/crear-reporte` | Sí | No |
| `/moderar` | Sí | Sí |

`ProtectedRoute` maneja ambos casos: sin sesión redirige a `/login`; con
sesión pero sin rol de moderador, redirige a `/`.

## Nota sobre la URL del backend

`src/services/api.js` tiene `http://localhost:8080/api` fijo. Si el backend
corre en otro puerto o está desplegado, ese es el único lugar que hay que
editar.
