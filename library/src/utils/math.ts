export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

export const lerp = (
  min: number,
  max: number,
  t: number,
  clamped = true,
): number => {
  const v = min + (max - min) * t
  return clamped ? clamp(v, min, max) : v
}

export const inverseLerp = (
  min: number,
  max: number,
  value: number,
  clamped = true,
): number => {
  if (value < min) return 0
  if (value > max) return 1
  const v = (value - min) / (max - min)
  return clamped ? clamp(v, min, max) : v
}
