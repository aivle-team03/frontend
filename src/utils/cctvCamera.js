export function toMonitoringCamera(cctv) {
  const streamUrl = cctv.stream_url || ''
  const streamMatch = streamUrl.match(/\/streams\/([^/?#]+)/)
  const aiCameraId = streamMatch ? decodeURIComponent(streamMatch[1]) : ''

  return {
    id: cctv.cctv_id,
    name: cctv.cctv_name,
    cctv_name: cctv.cctv_name,
    area: cctv.cctv_name,
    location: cctv.location,
    status: cctv.status,
    streamUrl,
    aiStreamUrl: aiCameraId ? streamUrl : '',
    aiCameraId,
    isDemo: false,
    detections: [],
  }
}
