export const CHECKLIST_MANAGEMENT_RECORDS_KEY = 'boss:checklist-management-records'
export const CHECKLIST_MANAGEMENT_ACTION_QUEUE_KEY = 'boss:checklist-management-action-queue'
export const INSPECTION_CATALOG_RECORDS_KEY = 'boss:inspection-catalog-records'
export const BOARD_REPORT_STATUSES_KEY = 'boss:board-report-statuses'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function getStoredChecklistManagementRecords() {
  if (!canUseStorage()) return []

  try {
    const records = JSON.parse(window.localStorage.getItem(CHECKLIST_MANAGEMENT_RECORDS_KEY) || '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export function saveChecklistManagementRecords(records) {
  if (!canUseStorage()) return

  window.localStorage.setItem(CHECKLIST_MANAGEMENT_RECORDS_KEY, JSON.stringify(records))
}

export function getStoredInspectionCatalogRecords() {
  if (!canUseStorage()) return []

  try {
    const records = JSON.parse(window.localStorage.getItem(INSPECTION_CATALOG_RECORDS_KEY) || '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export function saveInspectionCatalogRecords(records) {
  if (!canUseStorage()) return

  window.localStorage.setItem(INSPECTION_CATALOG_RECORDS_KEY, JSON.stringify(records))
  window.dispatchEvent(new Event('inspection-catalog-updated'))
}

export function getStoredBoardReportStatuses() {
  if (!canUseStorage()) return {}

  try {
    const statuses = JSON.parse(window.localStorage.getItem(BOARD_REPORT_STATUSES_KEY) || '{}')
    return statuses && typeof statuses === 'object' && !Array.isArray(statuses) ? statuses : {}
  } catch {
    return {}
  }
}

export function saveBoardReportStatuses(statuses) {
  if (!canUseStorage()) return

  window.localStorage.setItem(BOARD_REPORT_STATUSES_KEY, JSON.stringify(statuses))
  window.dispatchEvent(new Event('board-report-statuses-updated'))
}

export function saveBoardReportStatus(reportId, status) {
  const statuses = getStoredBoardReportStatuses()
  saveBoardReportStatuses({ ...statuses, [String(reportId)]: status })
}

export function getChecklistManagementActionQueue() {
  if (!canUseStorage()) return []

  try {
    const records = JSON.parse(window.localStorage.getItem(CHECKLIST_MANAGEMENT_ACTION_QUEUE_KEY) || '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

export function saveChecklistManagementActionQueue(records) {
  if (!canUseStorage()) return
  window.localStorage.setItem(CHECKLIST_MANAGEMENT_ACTION_QUEUE_KEY, JSON.stringify(records))
}

export function mergeChecklistManagementRecords(baseRecords) {
  const storedRecords = getStoredChecklistManagementRecords()
  const storedIds = new Set(storedRecords.map((record) => String(record.id)))
  const baseOnlyRecords = baseRecords.filter((record) => !storedIds.has(String(record.id)))

  return [...storedRecords, ...baseOnlyRecords]
}
