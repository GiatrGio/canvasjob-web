export function isSafeInternalPath(value: string | null | undefined): value is string {
  if (!value) return false;
  let decoded = value;
  try {
    for (let i = 0; i < 3; i += 1) {
      const nextDecoded = decodeURIComponent(decoded);
      if (nextDecoded === decoded) break;
      decoded = nextDecoded;
    }
  } catch {
    return false;
  }
  return Boolean(
    decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.includes("\\") &&
      !/[\u0000-\u001F]/.test(decoded),
  );
}

export function safeInternalPath(value: string | null | undefined, fallback = "/app") {
  return isSafeInternalPath(value) ? value : fallback;
}
