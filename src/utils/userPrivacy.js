/**
 * Masks the final character of a person's name for UI display.
 * The original value must remain available for API requests and state updates.
 */
export function maskName(name) {
  if (typeof name !== 'string') return ''

  const characters = Array.from(name.trim())
  if (!characters.length) return ''

  return `${characters.slice(0, -1).join('')}*`
}
