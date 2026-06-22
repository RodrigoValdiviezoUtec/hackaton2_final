# TropelCare Control Room — Frontend Hackathon

Consola operativa en React + TS que consume una API cerrada del curso.
Evaluación **todo-o-nada**: los 5 checkpoints deben demostrarse en el deploy o la nota es 0.

Specs completos: `@docs/enunciado-frontend.md` (frontend) y `@docs/indicaciones-backend.md`
(contrato de la API). Léelos cuando trabajes en cualquier checkpoint.

## Stack (obligatorio)

- React 18+, componentes en `.tsx`, TypeScript estricto.
- Vite, React Router, Tailwind CSS.
- Axios o Fetch API para HTTP.

## Reglas duras (rompen la entrega si se violan)

- Prefiere tipos explícitos sobre `any`: **las respuestas de API nunca usan `any`**.
- Prefiere paginación real del servidor sobre cargar el dataset completo en cliente.
- Prefiere infinite scroll real (IntersectionObserver/cursor) sobre un botón "Cargar más".
- Prefiere datos reales del backend sobre cualquier dato hardcodeado.
- Toda mutación maneja explícitamente loading y error.
- Toda animación respeta `prefers-reduced-motion`.
- El estado de filtros/paginación/orden vive en la URL y se restaura al recargar o compartir.
- El deploy debe abrir directo en cualquier ruta (configurar fallback SPA).

## Prohibido

- UI kits / dashboards: Material UI, Ant Design, Chakra, Mantine, NextUI, templates de dashboard.
- Server-state / cache libs: React Query, SWR, TanStack Query, RTK Query.
- Librerías que resuelvan cache de servidor o infinite scroll por ti.

## API

- Base URL: variable `VITE_API_BASE_URL` (incluye `/api/v1`).
- Rutas protegidas: header `Authorization: Bearer <jwt>`.
- Contrato público completo en el Swagger del backend; las rutas admin no aparecen ahí.
- No inventar campos ni enums: usar los del spec.

## Verificación (antes de dar por hecho un checkpoint)

- `npm run typecheck` termina sin errores.
- `npm run build` termina sin errores.
- La funcionalidad se demuestra por comportamiento en el navegador, no por screenshots.

## Flujo de trabajo

- Una rama por checkpoint; no trabajar sobre `main`.
- Un checkpoint por sesión; `/clear` antes de empezar el siguiente.
- Si el contrato de la API es ambiguo, preguntar antes de codear.
