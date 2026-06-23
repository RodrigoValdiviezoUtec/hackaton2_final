# TropelCare Control Room — Hackathon Frontend (Pizza Protocol)

Consola operativa en React + TypeScript y Tailwind CSS para el monitoreo y gestión de la colonia de criaturas digitales de Tuckersoft.

---

## 👥 Integrantes y Códigos
*   **Integrante 1:** José Rodrigo Valdiviezo Ortiz / código 202510135
*   **Integrante 2:** Rodrigo Franco Huertos Ochoa / código 202510118
*   **Integrante 3:** Francesco Aroldo Ferrante Quino / código 202510174

---

## 🛠️ Instalación y Comandos

### Prerrequisitos
*   Node.js 20+
*   npm 10+

### Pasos de Configuración
1. Instalar dependencias del proyecto:
   ```bash
   npm install
   ```
2. Crear un archivo `.env` en la raíz del proyecto basándote en el ejemplo:
   ```env
   VITE_API_BASE_URL=https://<url-del-backend>/api/v1
   ```
3. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

### Otros Comandos de Utilidad
*   **Verificación de Tipos (TypeScript):**
    ```bash
    npm run typecheck
    ```
*   **Compilación para Producción:**
    ```bash
    npm run build
    ```
*   **Previsualización del Build:**
    ```bash
    npm run preview
    ```

---

## 🔑 Variables de Entorno Requeridas
*   `VITE_API_BASE_URL`: Dirección base de la API del backend (ej: `https://api.tropelcare.example.com/api/v1`).

---

## 🌐 Enlace del Despliegue
*   **URL del Deploy:** [https://<tu-despliegue>.vercel.app](https://<tu-despliegue>.vercel.app)

---

## 💡 Decisiones Técnicas Importantes

### 1. Scrollytelling y Sector Story Engine (Checkpoint 5)
*   **Detección Reactiva de Etapas:** Implementamos `IntersectionObserver` con un margen de captura del 40% al 60% vertical para alternar de forma activa e instantánea la etapa de exploración que el usuario lee en el scroll.
*   **Fallback de Animación por Scroll:** Proveemos soporte híbrido: si el navegador soporta *Scroll-driven Animations* de CSS se aplican, de lo contrario se ejecuta la lógica reactiva por JavaScript.
*   **Accesibilidad y Reduced Motion:** Respetamos la configuración de `prefers-reduced-motion` eliminando animaciones de rebote, giros e inercias de scroll. Incorporamos navegación por teclado con foco directo (`tabIndex={0}`) que centra la etapa seleccionada mediante `.scrollIntoView()`.
*   **Visualizaciones Procedimentales:** En lugar de usar material pregrabado (GIF/videos), el visualizador sticky dibuja formas, partículas flotantes y rejillas 3D directamente con Tailwind CSS, adaptando el gradiente y brillo de la interfaz al `colorToken` y `climate` de cada sector.

### 2. View Transition API
*   Navegación cinemática nativa mediante `document.startViewTransition` al entrar y salir de las historias de exploración desde el Dashboard, con una transición suave y degradada (cross-fade) como fallback en navegadores no soportados.

### 3. Tipado Estricto de API (Cero `any`)
*   Se mapearon todas las respuestas asíncronas de la API en interfaces estructuradas en `src/types/api.ts` (ej: `SectorStoryResponse`, `DashboardSummary`). No se utiliza `any` en ninguna declaración de servicios HTTP o estados locales.

### 4. Navegación e Integridad SPA (Corrección Checkpoint 1)
*   Reemplazamos los enlaces tradicionales `<a>` en el Dashboard por componentes `<Link>` de `react-router-dom`, resolviendo el bug de recarga total del navegador y manteniendo el contexto de sesión y estado reactivo intacto.
