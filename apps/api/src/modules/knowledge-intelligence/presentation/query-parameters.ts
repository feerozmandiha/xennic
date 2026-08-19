<<<<<<< ours
export function boundedInteger(
=======
export function boundedNumber(
>>>>>>> theirs
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
<<<<<<< ours
  return Math.max(minimum, Math.min(Math.trunc(parsed), maximum));
=======
  return Math.max(minimum, Math.min(parsed, maximum));
}

export function boundedInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  return Math.trunc(boundedNumber(value, fallback, minimum, maximum));
>>>>>>> theirs
}
