export function formatLocationSummary(location) {
  const locations = String(location || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (locations.length < 2) return locations[0] || '지정 안 됨'
  return `${locations[0]} 외 ${locations.length - 1}개 구역`
}
