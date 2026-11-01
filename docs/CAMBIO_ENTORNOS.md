# Guía para Alternar Entornos (Local vs Render Producción)

Esta guía explica paso a paso cómo cambiar la conexión de la aplicación web entre el **Backend Local (NestJS)**, el **Backend de Producción (Render)** y el **Modo Demo (Ficticio)**.

---

## 1. Archivo de Configuración: `.env.local`

En la raíz del proyecto frontend (`presupuestos-inteligentes-web`) se encuentra el archivo `.env.local`. Este archivo tiene prioridad sobre las variables por defecto y define hacia dónde se dirigen las peticiones HTTP.

---

## 2. Configuraciones Disponibles

### Opción A: Producción (Render)
Para conectar con la API desplegada en Render:

```env
VITE_DATA_SOURCE=api
VITE_API_URL=https://presupuestosinteligentes.onrender.com
```

> [!NOTE]
> En Render las instancias gratuitas pueden entrar en suspensión por inactividad ("cold start"). La primera petición puede tardar entre 30 y 60 segundos en responder mientras se reactiva el contenedor.

---

### Opción B: Local / Sandbox (NestJS en tu PC)
Para probar cambios antes de subirlos a producción:

```env
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000
```

* Requiere tener corriendo el backend en tu terminal:
  ```powershell
  cd C:\Users\VICTUS\Documents\Proyectos\PresupuestosInteligentes\api-nest
  npm run start:dev
  ```

---

### Opción C: Modo Demo (Datos simulados sin backend)
Para trabajar únicamente en la interfaz visual sin depender de ningún backend ni base de datos:

```env
VITE_DATA_SOURCE=demo
```

---

## 3. Pasos para Aplicar el Cambio

Cada vez que cambies los valores en `.env.local`:

1. **Guarda el archivo** `.env.local`.
2. **Reinicia el servidor de desarrollo de Vite:**
   * En la terminal del frontend, presiona `Ctrl + C`.
   * Vuelve a iniciarlo:
     ```powershell
     npm run dev
     ```
   *(Vite solo lee los archivos `.env` al iniciar el proceso; no se actualizan en caliente).*
3. **Cerrar sesión / Limpiar token en el navegador:**
   * Al cambiar de entorno, el token JWT que tenías guardado en `localStorage` (de local o de Render) pertenecerá a una base de datos distinta.
   * Haz clic en **Cerrar sesión** en la app para borrar el token anterior e inicia sesión con las credenciales correspondientes a ese entorno.

---

## 4. Despliegue a Producción (Build)

Cuando prepares la versión final para subir a hosting (Render, Vercel, Netlify):

1. **Variables en la plataforma:**
   * En el panel de control de tu hosting (por ejemplo Render o Vercel), agrega la variable de entorno:
     * `VITE_DATA_SOURCE` = `api`
     * `VITE_API_URL` = `https://presupuestosinteligentes.onrender.com`
2. **Comando de construcción:**
   ```powershell
   npm run build
   ```
   Esto generará la carpeta `dist/` optimizada y apuntando a las variables de producción.

