
interface JwtPayload {
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    );

    const decoded = atob(padded);
    const payload: unknown = JSON.parse(decoded);

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (
    !payload ||
    typeof payload.exp !== "number" ||
    !Number.isFinite(payload.exp)
  ) {
    return true;
  }

  const expirationTime = payload.exp * 1000;

  return Date.now() >= expirationTime;
}

export function isTokenLocallyValid(
  token: string | null,
): boolean {
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}
