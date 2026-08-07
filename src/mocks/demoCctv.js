export const DEMO_CAMERAS = [
  {
    id: 'demo-fire-01',
    name: '화재 감지 테스트 1',
    area: '데모 구역 A',
    location: '화재 감지 테스트 영상',
    status: 'running',
    streamUrl: '/demo-cctv/fire-cam-01.mp4',
    aiCameraId: 'fire-01',
    aiStreamUrl: 'http://127.0.0.1:8001/streams/fire-01',
    isDemo: true,
    detections: [{ id: 'fire-01', at: 4.2, type: '화재/연기 의심 감지', categoryName: '화재 감지' }],
  },
  {
    id: 'demo-forklift-03',
    name: '지게차 거리 테스트',
    area: '데모 구역 C',
    location: '지게차·보행자 거리 테스트 영상',
    status: 'running',
    streamUrl: '/demo-cctv/forklift-cam-03.mp4',
    aiCameraId: 'forklift-03',
    aiStreamUrl: 'http://127.0.0.1:8001/streams/forklift-03',
    isDemo: true,
    detections: [{ id: 'forklift-01', at: 14, type: '지게차·보행자 근접 위험', categoryName: '지게차 접근 위험' }],
  },
]

// DB에서 읽은 CCTV에도 동일한 URL이면 데모 감지 시나리오를 붙인다.
export function attachDemoScenario(camera) {
  const scenario = DEMO_CAMERAS.find((demoCamera) => demoCamera.streamUrl === camera.streamUrl)
  // Keep the CCTV name/location supplied by the DB, but use the matching
  // local AI stream.  Previously only isDemo/detections were copied here,
  // so DB cameras played the raw MP4 and fired the old time-based mock alert.
  return scenario
    ? {
        ...camera,
        isDemo: true,
        detections: scenario.detections,
        aiCameraId: scenario.aiCameraId,
        aiStreamUrl: scenario.aiStreamUrl,
      }
    : camera
}
