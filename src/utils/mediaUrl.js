const API_BASE_URL = 'http://127.0.0.1:8000'

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
  return `${API_BASE_URL}${mediaUrl}`
}
