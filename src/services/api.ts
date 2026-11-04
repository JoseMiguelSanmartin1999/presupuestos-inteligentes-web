
const DEFAULT_API_URL =
  "https://presupuestosinteligentes.onrender.com";

const API_URL = (
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL
).replace(/\/+$/, "");

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly statusCode: number;

  constructor(status: number, message: string) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.statusCode = status;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function createHeaders(init: RequestInit): Headers {
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

function formatErrorMessage(
  data: ApiErrorResponse,
  fallback: string,
): string {
  if (Array.isArray(data.message)) {
    return data.message.join(", ");
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.error === "string") {
    return data.error;
  }

  return fallback;
}

async function parseErrorResponse(
  response: Response,
): Promise<string> {
  const fallback =
    response.statusText ||
    `Error HTTP ${response.status}`;

  try {
    const text = await response.text();

    if (!text) return fallback;

    try {
      const data: unknown = JSON.parse(text);

      if (typeof data === "string") {
        return data;
      }

      if (data && typeof data === "object") {
        return formatErrorMessage(
          data as ApiErrorResponse,
          fallback,
        );
      }

      return fallback;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}

let isRedirectingToLogin = false;

async function handleApiError(
  response: Response,
  path: string,
): Promise<never> {
  const message = await parseErrorResponse(response);

  if (response.status === 401) {
    if (!path.startsWith("/auth/")) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (
        window.location.pathname !== "/login" &&
        !isRedirectingToLogin
      ) {
        isRedirectingToLogin = true;
        window.location.replace("/login");
      }
    }

    throw new ApiError(
      401,
      path.startsWith("/auth/")
        ? message
        : "Sesión no válida o expirada. Inicia sesión nuevamente.",
    );
  }

  throw new ApiError(response.status, message);
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: createHeaders(init),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.",
    );
  }

  if (!response.ok) {
    await handleApiError(response, path);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      response.status,
      "El servidor devolvió una respuesta con formato inválido.",
    );
  }
}
