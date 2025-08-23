## Click&Go – E‑Commerce Demo (React + TypeScript + Firebase + Vite)

Aplicación web moderna de comercio electrónico construida con React 18 + TypeScript y backend serverless en Firebase (Auth, Firestore, Storage, Cloud Functions). Incluye catálogo de productos, carrito, checkout, historial de pedidos con cancelación, gestión básica de productos (admin), perfil de usuario con subida de avatar y UI responsive animada.

### Características principales
- Catálogo con grid responsivo y tarjetas de producto.
- Carrito persistente (Zustand) con control de stock.
- Checkout y creación de pedidos mediante Cloud Function HTTP (CORS + Bearer token) con fallback callable.
- Historial de pedidos: filtros, colapsables de items, cancelar pedido (restaura stock) y eliminación de pedidos cancelados.
- Autenticación email/password (Firebase Auth) + Firestore para metadatos del usuario (rol, nombre, photoURL).
- Edición de perfil: cambio de nombre y subida de avatar (Firebase Storage) + sincronización en Auth y Firestore.
- Panel Admin (creación simple de productos) y guard basado en rol.
- Navegación unificada (desktop + mobile) con popover accesible y animaciones.
- Diseño modernizado: botones yellow brand, superficies glass / form-surface, avatares, badges de estado y transiciones suaves.
- Lazy loading de SDKs Firebase para optimizar bundle.

### Stack técnico
| Capa | Tecnologías |
|------|-------------|
| Frontend | React 18, TypeScript, Vite |
| Estado | Zustand (auth, cart, wishlist), React Query (datos) |
| Backend | Firebase Auth, Firestore, Cloud Functions, Storage |
| Estilos | Tailwind CSS utilitario + `global.css` con animaciones y componentes |

### Estructura de carpetas (resumida)
```
src/
  components/        # UI reutilizable (Navbar, tablas, formularios)
  pages/             # Vistas (Home, Catalogo, Producto, Carrito, Checkout, Cuenta, Pedidos, Admin)
  stores/            # Zustand stores (auth, cart, wishlist)
  hooks/             # Hooks de datos: productos, paginación, carrito
  firebase/          # Inicialización y clientes lazy
  styles/            # global.css + utilidades
  utils/             # Helpers (formatos, toast, etc.)
functions/           # Cloud Functions (createOrder, cancelOrder, setUserRole, etc.)
public/              # Assets estáticos / favicon / manifest
```

### Cloud Functions destacadas
- `createOrderHttp` / `createOrder` (callable): crea pedido, valida stock, descuenta cantidades de forma transaccional.
- `cancelOrderHttp` / `cancelOrder`: restaura stock y marca pedido como `Cancelado` (HTTP con CORS + fallback callable).
- `setUserRole`: asignación de rol (admin) bajo control.

### Flujo de pedido
1. Usuario autenticado crea pedido (HTTP Function con token Bearer).
2. Transacción Firestore valida stock y lo descuenta.
3. Pedido se guarda con estado inicial (p.ej. `Creado` / `Pendiente`).
4. Usuario puede cancelar (si procede) -> se reponen stocks + estado `Cancelado`.

### Estados de pedido (ejemplo)
`Creado` | `Pagado` | `Enviado` | `Entregado` | `Cancelado`

### Configuración local
1. Clonar repositorio.
2. Instalar dependencias:
```bash
npm install
```
3. Crear archivo de entorno (si usas variables personalizadas) o usar directamente `firebaseConfig` embebido en `src/firebase/config.ts`.
4. Iniciar entorno de desarrollo:
```bash
npm run dev
```
5. Emular (opcional):
```bash
firebase emulators:start
```

### Despliegue
Hosting + Functions (ejemplo):
```bash
firebase deploy --only hosting,functions
```

### Scripts útiles
- `scripts/seed.ts`: poblar productos de ejemplo.
- `scripts/seed-categories.ts`: poblar categorías.
- `scripts/migrate-add-nombreLower.ts`: migración para campo normalizado.

### Seguridad / buenas prácticas
- `.firebase` ignorado para no subir estado local.
- Credenciales de servicio en `creds/` (ignoradas).
- Uso de reglas Firestore (`firestore.rules`) y Storage (`storage.rules`).

### Próximas mejoras sugeridas
- Búsqueda y paginación avanzada en pedidos y catálogo.
- Exportación CSV de pedidos.
- Modo oscuro y soporte `prefers-reduced-motion`.
- Previsualización y recorte de avatar antes de subir.
- Tests adicionales (stores y hooks de datos).

### Licencia
Proyecto educativo/demostración. Ajustar para uso comercial según corresponda.

---
Si tienes dudas o quieres nuevas mejoras abre un issue o envía una PR.
