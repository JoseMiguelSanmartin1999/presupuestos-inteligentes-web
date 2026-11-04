# Presupuestos Inteligentes — Web Application

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Oxlint-1.88-F59E0B?style=for-the-badge&logo=oxc&logoColor=white" alt="Oxlint" />
</p>

Plataforma web moderna, responsiva y de alto rendimiento diseñada para la **gestión financiera personal, control presupuestario y análisis predictivo de gastos**. 

Construida con **React 19**, **TypeScript** y **Tailwind CSS v4**, la aplicación ofrece una experiencia fluida con soporte para doble modo de datos (Modo Demo local y Modo API NestJS), gráficos interactivos y exportación de reportes ejecutivos en PDF y CSV.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Reportes y Exportación](#-reportes-y-exportación)
- [Buenas Prácticas y Calidad de Código](#-buenas-prácticas-y-calidad-de-código)

---

## ✨ Características Principales

- **🔐 Autenticación y Control de Sesión:**
  - Flujo de inicio de sesión y registro protegido mediante tokens JWT.
  - Almacenamiento seguro de credenciales de sesión en cliente y rutas protegidas (`ProtectedRoute`).
- **📊 Panel Financiero (Dashboard):**
  - Resumen ejecutivo de ingresos, egresos, balance neto y tasa de ahorro mensual en tiempo real.
  - Indicadores visuales de salud financiera y acceso directo a operaciones frecuentes.
- **💸 Registro y Gestión de Transacciones:**
  - Creación, edición y filtrado dinámico de movimientos monetarios.
  - Clasificación detallada por tipo (ingreso/gasto), fechas y categorías.
- **🎯 Presupuestos por Categoría:**
  - Establecimiento de límites mensuales de gasto por categoría.
  - Medidores de consumo porcentual con alertas visuales de sobregiro.
- **📈 Reportes y Evolución Financiera:**
  - Gráficos interactivos de evolución histórica semestral con **Recharts**.
  - Comparativa directa de ingresos vs. gastos y evolución neta de balance.
- **📄 Exportación de Reportes Ejecutivos:**
  - **Exportación PDF:** Generación nativa en el navegador mediante **jsPDF**, incluyendo tablas tabulares formateadas y gráficos vectoriales nativos de alta definición con soporte completo para caracteres Unicode/español (`DejaVuSans`).
  - **Exportación CSV:** Archivos optimizados con BOM UTF-8 (`\uFEFF`) y delimitadores estándar para integración directa en Microsoft Excel y software de análisis.
- **⚡ Doble Modo de Fuente de Datos:**
  - Posibilidad de alternar entre datos simulados (`demo`) para pruebas y desarrollo ágil o conexión directa a la API REST de producción (`api`).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework Base** | [React 19](https://react.dev/) | Librería de interfaz de usuario con arquitectura de componentes. |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estático riguroso y autocompletado en toda la base de código. |
| **Tooling & Build** | [Vite 8](https://vitejs.dev/) | Bundler ultrarrápido con Hot Module Replacement (HMR). |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) | Framework de utilidades CSS moderno, compilado vía `@tailwindcss/vite`. |
| **Enrutamiento** | [React Router v7](https://reactrouter.com/) | Enrutamiento declarativo del lado del cliente con carga diferida (`React.lazy`). |
| **Visualización** | [Recharts](https://recharts.org/) | Gráficas responsivas e interactivas basadas en SVG. |
| **Generación de PDFs**| [jsPDF](https://github.com/parallax/jsPDF) + AutoTable | Motor de exportación PDF en cliente con gráficos vectoriales y fuentes TTF. |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Conjunto de iconos vectoriales consistentes y ligeros. |
| **Linter & Calidad** | [Oxlint](https://oxc.rs/) | Linter basado en Rust de ultra alta velocidad para análisis estático de código. |

---

## 🏛️ Arquitectura del Proyecto

El proyecto sigue una estructura **Feature-Driven Architecture** (arquitectura orientada a funcionalidades), lo que garantiza modularidad, bajo acoplamiento y alta escalabilidad:

```text
src/
├── app/                  # Configuración central de la app, enrutador global y proveedores
│   ├── App.tsx
│   └── router.tsx        # Definición de rutas públicas y protegidas con carga diferida
├── assets/               # Recursos estáticos (imágenes, logos, SVGs)
├── components/           # Componentes UI globales y reutilizables (layout, sidebars, modales)
│   └── layout/
├── data/                 # Conjuntos de datos mock para el modo de prueba (demo mode)
├── features/             # Módulos de funcionalidad independientes
│   ├── auth/             # Flujos de inicio de sesión, registro y guards de protección
│   ├── budgets/          # Gestión de límites de presupuesto y métricas de consumo
│   ├── categories/       # Catálogo y configuración de categorías financieras
│   ├── dashboard/        # Pantalla principal con tarjetas de balance y resumen
│   ├── reports/          # Reportes mensuales, gráficas de evolución y utilidades de exportación
│   │   ├── components/   # Gráficas de evolución y componentes visuales del reporte
│   │   ├── pages/        # Vista principal de reportes y filtros
│   │   ├── types/        # Modelos de datos e interfaces de reportes
│   │   └── utils/        # Generadores de PDF y CSV (export-report-pdf.ts, export-report-csv.ts)
│   └── transactions/     # Historial de ingresos/egresos y formularios de movimiento
├── lib/                  # Funciones de soporte transversales y helpers de clases CSS
├── services/             # Clientes de consumo HTTP hacia la API REST (NestJS)
└── types/                # Definiciones de tipos globales compartidos
```

---

## 📦 Requisitos Previos

Asegúrate de contar con el siguiente entorno instalado en tu equipo:

- **Node.js**: Versión `20.x` o superior (LTS recomendada).
- **npm**, **pnpm** o **yarn** como gestor de paquetes.

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/presupuestos-inteligentes-web.git
   cd presupuestos-inteligentes-web
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Copia el archivo de ejemplo para crear tu entorno local:
   ```bash
   cp .env.example .env.local
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:5173`.

---

## ⚙️ Variables de Entorno

El archivo `.env.local` controla la fuente de datos y la conexión a los servicios externos:

| Variable | Opciones | Descripción |
| :--- | :--- | :--- |
| `VITE_DATA_SOURCE` | `demo` \| `api` | Determina si la aplicación utiliza datos ficticios locales (`demo`) o si conecta a los servicios backend (`api`). |
| `VITE_API_URL` | URL HTTP(S) | Endpoint base de la API REST del backend (por ejemplo: `https://presupuestosinteligentes.onrender.com`). |

---

## 📜 Scripts Disponibles

En la raíz del proyecto puedes ejecutar los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila TypeScript (`tsc -b`) y empaqueta la aplicación con Vite para producción en `dist/`. |
| `npm run preview` | Ejecuta un servidor local para previsualizar la compilación de producción. |
| `npm run lint` | Analiza el código fuente con el linter **Oxlint** para detectar errores estáticos. |

---

## 📊 Reportes y Exportación

### Generación de PDF con Gráficos Vectoriales
El módulo de reportes (`src/features/reports/utils/export-report-pdf.ts`) incluye:
* **Renderizado Vectorial Nativo:** Dibuja diagramas de barras y gráficos de balance con funciones primitivas de `jsPDF` (`line`, `rect`, `circle`), garantizando máxima nitidez al imprimir o hacer zoom.
* **Soporte Unicode Completo:** Utiliza la fuente `DejaVuSans.ttf` (ubicada en `public/fonts/`) cargada dinámicamente en el Virtual File System (VFS) del PDF, resolviendo de forma nativa acentos, la letra `ñ` y símbolos de divisas.
* **Paginación Dinámica:** Cálculo automático de páginas en formato `Página X de Y`.

### Compatibilidad de Exportación CSV
El exportador CSV (`src/features/reports/utils/export-report-csv.ts`) incorpora el prefijo **BOM UTF-8** (`\uFEFF`) y formateo seguro contra inyección de fórmulas de hoja de cálculo (`CSV Injection Prevention`), asegurando que las columnas y acentos se visualicen correctamente en Microsoft Excel y Google Sheets.

---

## 🛡️ Buenas Prácticas y Calidad de Código

- **Zero-Warning Architecture:** El código está verificado para compilar sin advertencias ni errores tanto en el verificador de tipos de TypeScript como en Oxlint.
- **Code-Splitting y Lazy Loading:** Todas las vistas principales se cargan de forma asíncrona mediante `React.lazy` para mantener el bundle inicial en un peso mínimo.
- **Accesibilidad y Semántica:** Componentes construidos con soporte semántico ARIA para loaders y estados interactivos.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
