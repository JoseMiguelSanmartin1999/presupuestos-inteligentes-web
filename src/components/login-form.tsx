import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, User, Wallet, Sparkles } from "lucide-react";
import { login, registerUser } from "@/services/auth.service";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function fillDemoCredentials() {
    setEmail("demo.presupuestos@example.com");
    setPassword("PruebaSegura123!");
    setError(null);
    setSuccessMessage("Credenciales de prueba cargadas.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (password.length < 10) {
          throw new Error("La contraseña debe tener al menos 10 caracteres.");
        }
        await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        // Tras registrar, inicia sesión de inmediato
        await login({ email: email.trim().toLowerCase(), password });
      } else {
        await login({ email: email.trim(), password });
      }
      onLoginSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al procesar la solicitud.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Wallet size={28} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            PresupuestosInteligentes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {mode === "login"
              ? "Inicia sesión para consultar tus finanzas."
              : "Crea una nueva cuenta para empezar."}
          </p>
        </div>

        {/* Selector de pestañas Iniciar sesión / Registro */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccessMessage(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Botón rápido para rellenar usuario de pruebas */}
        {mode === "login" && (
          <div className="mb-5 rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-3 text-center">
            <p className="text-xs text-blue-700">
              ¿Quieres probar el backend local de inmediato?
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Sparkles size={14} /> Usar usuario demo local
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Nombre completo
              </label>
              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              {mode === "register" && (
                <span className="text-xs text-slate-400">Mínimo 10 caracteres</span>
              )}
            </div>

            <div className="relative">
              <LockKeyhole
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder={
                  mode === "register"
                    ? "Mínimo 10 caracteres"
                    : "Ingresa tu contraseña"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={mode === "register" ? 10 : undefined}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Iniciando sesión…"
                : "Creando cuenta…"
              : mode === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Entorno local conectado a <code className="text-slate-600">http://localhost:3000</code>
        </p>
      </div>
    </main>
  );
}
