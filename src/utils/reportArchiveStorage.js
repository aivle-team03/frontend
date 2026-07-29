const REPORT_ARCHIVE_STORAGE_KEY = 'boss-generated-reports'

export function loadGeneratedReports() {
  try {
    const storedReports = window.localStorage.getItem(REPORT_ARCHIVE_STORAGE_KEY)
    const parsedReports = storedReports ? JSON.parse(storedReports) : []
    return Array.isArray(parsedReports) ? parsedReports : []
  } catch {
    return []
  }
}

export function saveGeneratedReport(report) {
  const currentReports = loadGeneratedReports()
  const nextReports = [report, ...currentReports]

  try {
    window.localStorage.setItem(REPORT_ARCHIVE_STORAGE_KEY, JSON.stringify(nextReports))
  } catch {
    // 저장소를 사용할 수 없는 환경에서도 현재 생성 동작은 막지 않습니다.
  }

  return nextReports
}
