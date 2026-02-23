export function generateTunzyId() {
  const random = Math.random().toString(36).substring(2, 10)
  return `tunzymd2_${random}`
}
