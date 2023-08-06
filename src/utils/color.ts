export function generateSmoothGradient(startColor: string, endColor: string, steps: number): string[] {
  const startRGB = hexToRgb(startColor)
  const endRGB = hexToRgb(endColor)

  const gradient = []
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1)
    const interpolatedRGB = interpolateColors(startRGB, endRGB, progress)
    gradient.push(rgbToHex(interpolatedRGB))
  }

  return gradient
}

function hexToRgb(hex: string): number[] {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
    .substring(1)
    .match(/.{2}/g)
    ?.map(color => Number.parseInt(color, 16)) || []
}

function rgbToHex(rgb: number[]): string {
  return `#${rgb.map(color => color.toString(16).padStart(2, '0')).join('')}`
}

function interpolateColors(startRGB: number[], endRGB: number[], progress: number): number[] {
  return startRGB.map((startValue, index) => Math.round(startValue + (endRGB[index] - startValue) * progress))
}
