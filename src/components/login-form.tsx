
import { useRef, useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  Wallet,
} from "lucide-react";

import { login, registerUser } from "@/services/auth.service";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

type AuthMode = "login" | "register";

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submittingRef = useRef(false);

  function changeMode(nextMode: AuthMode) {
    if (submittingRef.current) return;

    setMode(nextMode);
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (!normalizedEmail || !password) {
        throw new Error("Completa tu correo y contraseña.");
      }

      if (mode === "register") {
        const normalizedName = name.trim();

        if (!normalizedName) {
          throw new Error("El nombre es obligatorio.");
        }

        if (password.length < 10) {
          throw new Error(
            "La contraseña debe tener al menos 10 caracteres.",
          );
        }

        await registerUser({
          name: normalizedName,
          email: normalizedEmail,
          password,
        });

        // El registro ya se completó.
        // Si el login posterior falla, no se debe repetir el registro.
        try {
          await login({
            email: normalizedEmail,
            password,
          });
        } catch {
          setMode("login");
          setPassword("");
          setSuccessMessage(
            "Tu cuenta fue creada correctamente. Inicia sesión para continuar.",
          );
          return;
        }
      } else {
        await login({
          email: normalizedEmail,
          password,
        });
      }

      onLoginSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al procesar la solicitud.",
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Wallet size={28} aria-hidden="true" />
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

        <div
          className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
          role="group"
          aria-label="Seleccionar acceso"
        >
          <button
            type="button"
            disabled={loading}
            aria-pressed={mode === "login"}
            onClick={() => changeMode("login")}
            className={`rounded-lg py-2 text-xs font-semibold transition disabled:opacity-60 ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            disabled={loading}
            aria-pressed={mode === "register"}
            onClick={() => changeMode("register")}
            className={`rounded-lg py-2 text-xs font-semibold transition disabled:opacity-60 ${
              mode === "register"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Crear cuenta
          </button>
        </div>

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
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={loading}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
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
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
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
                <span className="text-xs text-slate-400">
                  Mínimo 10 caracteres
                </span>
              )}
            </div>

            <div className="relative">
              <LockKeyhole
                size={17}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                placeholder={
                  mode === "register"
                    ? "Mínimo 10 caracteres"
                    : "Ingresa tu contraseña"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={loading}
                required
                minLength={
                  mode === "register" ? 10 : undefined
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />

              <button
                type="button"
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 disabled:opacity-60"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
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
            aria-busy={loading}
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
          Gestiona tus finanzas de forma organizada y segura.
        </p>
      </div>
    </main>
  );
}
