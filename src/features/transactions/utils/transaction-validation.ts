export function validateTransactionAmount(
  value: string,
): string | null {
  const normalized = value.trim();
  const amount = Number(normalized);

  if (!normalized || !Number.isFinite(amount) || amount <= 0) {
    return "Ingresa un importe válido mayor que cero.";
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return "El importe debe tener máximo dos decimales.";
  }

  return null;
}

