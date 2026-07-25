export const DEFAULT_ACCEPTABLE_RISK = 12
export const SAFETY_RISK_THRESHOLD_KEY = 'boss:safety-risk-threshold'
export const CHECKLIST_INSPECTION_RESULTS_KEY = 'boss:checklist-inspection-results'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

export function getStoredSafetyRiskThreshold() {
  if (!canUseStorage()) return DEFAULT_ACCEPTABLE_RISK

  const storedValue = Number(window.localStorage.getItem(SAFETY_RISK_THRESHOLD_KEY))
  return Number.isFinite(storedValue) && storedValue > 0 ? storedValue : DEFAULT_ACCEPTABLE_RISK
}

export function saveSafetyRiskThreshold(value) {
  if (!canUseStorage()) return

  window.localStorage.setItem(SAFETY_RISK_THRESHOLD_KEY, String(value))
}

export function getStoredChecklistInspectionResults() {
  if (!canUseStorage()) return {}

  try {
    return JSON.parse(window.localStorage.getItem(CHECKLIST_INSPECTION_RESULTS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getInspectionProgress(riskScore, riskThreshold) {
  return riskScore >= riskThreshold ? '조치 대기' : '점검 완료'
}

export function saveChecklistInspectionResult({ id, riskScore, riskThreshold, strength, frequency }) {
  if (!canUseStorage()) return null

  const progress = getInspectionProgress(riskScore, riskThreshold)
  const results = getStoredChecklistInspectionResults()
  const currentResult = results[String(id)] ?? {}
  const result = {
    ...currentResult,
    id,
    inspectionRiskScore: riskScore,
    riskThreshold,
    inspectionStrength: strength,
    inspectionFrequency: frequency,
    riskScore,
    strength,
    frequency,
    progress,
    inspectedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(
    CHECKLIST_INSPECTION_RESULTS_KEY,
    JSON.stringify({ ...results, [String(id)]: result }),
  )

  return result
}

export function saveChecklistActionRiskResult({ id, riskScore, strength, frequency, progress }) {
  if (!canUseStorage()) return null

  const results = getStoredChecklistInspectionResults()
  const currentResult = results[String(id)] ?? {}
  const result = {
    ...currentResult,
    id,
    actionRiskScore: riskScore,
    actionStrength: strength,
    actionFrequency: frequency,
    progress: progress ?? currentResult.progress,
    actionRiskUpdatedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(
    CHECKLIST_INSPECTION_RESULTS_KEY,
    JSON.stringify({ ...results, [String(id)]: result }),
  )

  return result
}

export function applyChecklistInspectionResults(records) {
  const results = getStoredChecklistInspectionResults()

  return records.map((record) => {
    const result = results[String(record.id)]
    if (!result) return record

    return {
      ...record,
      progress: result.progress,
      riskScore: result.inspectionRiskScore ?? result.riskScore,
      inspectionRiskScore: result.inspectionRiskScore ?? result.riskScore,
      actionRiskScore: result.actionRiskScore,
      riskThreshold: result.riskThreshold,
      strength: result.inspectionStrength ?? result.strength,
      frequency: result.inspectionFrequency ?? result.frequency,
      inspectionStrength: result.inspectionStrength ?? result.strength,
      inspectionFrequency: result.inspectionFrequency ?? result.frequency,
      actionStrength: result.actionStrength,
      actionFrequency: result.actionFrequency,
      inspectedAt: result.inspectedAt,
      actionRiskUpdatedAt: result.actionRiskUpdatedAt,
    }
  })
}
