export const AI_EVENT_SESSION_KEY = 'boss-cctv-ai-event-session'

export function readAiEventSession() {
  const raw = sessionStorage.getItem(AI_EVENT_SESSION_KEY)
  if (!raw) return { serverInstanceId: '', cursor: 0 }
  try {
    const saved = JSON.parse(raw)
    if (typeof saved === 'object' && saved) {
      return {
        serverInstanceId: typeof saved.serverInstanceId === 'string' ? saved.serverInstanceId : '',
        cursor: Number.isSafeInteger(saved.cursor) && saved.cursor >= 0 ? saved.cursor : 0,
      }
    }
  } catch {
    // Backward compatibility with the former number-only cursor.
  }
  const cursor = Number(raw)
  return { serverInstanceId: '', cursor: Number.isSafeInteger(cursor) && cursor >= 0 ? cursor : 0 }
}

export function saveAiEventSession(serverInstanceId, cursor) {
  sessionStorage.setItem(AI_EVENT_SESSION_KEY, JSON.stringify({ serverInstanceId, cursor }))
}

export function clearAiEventSession() {
  sessionStorage.removeItem(AI_EVENT_SESSION_KEY)
}
