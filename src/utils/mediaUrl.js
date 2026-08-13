import { BACKEND_API_URL, VISION_API_URL } from '../config/api.js'

export function getYouTubeEmbedUrl(mediaUrl, { autoplay = false } = {}) {
  if (!mediaUrl) return null

  try {
    const url = new URL(mediaUrl)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let videoId = null

    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0]
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v')
      else if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/shorts/')) {
        videoId = url.pathname.split('/').filter(Boolean)[1]
      }
    }

    if (!videoId) return null
    const params = new URLSearchParams({ rel: '0', playsinline: '1' })
    if (autoplay) {
      params.set('autoplay', '1')
      params.set('mute', '1')
    }
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`
  } catch {
    return null
  }
}

export function resolveMediaUrl(mediaUrl) {
  if (!mediaUrl || !mediaUrl.startsWith('/')) return mediaUrl
  return `${BACKEND_API_URL}${mediaUrl}`
}

export function resolveVisionSnapshotUrl(snapshotUrl) {
  if (!snapshotUrl) return ''
  if (
    snapshotUrl.startsWith('data:')
    || snapshotUrl.startsWith('http://')
    || snapshotUrl.startsWith('https://')
  ) {
    return snapshotUrl
  }

  // AI snapshots are public application media paths, not Vision API routes.
  // Keeping /media/... relative matches the action-history image contract and
  // prevents an invalid /vision/media/... request in deployed environments.
  if (snapshotUrl.startsWith('/media/')) return snapshotUrl

  return `${VISION_API_URL}${snapshotUrl}`
}
