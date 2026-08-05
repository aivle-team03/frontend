export const DEMO_CAMERAS = [
  {
    id: 'demo-fire-01',
    name: '화재 감지 테스트 1',
    area: '데모 구역 A',
    location: '화재 감지 테스트 영상',
    status: 'running',
    streamUrl: '/demo-cctv/fire-cam-01.mp4',
    isDemo: true,
    detections: [{ id: 'fire-01', at: 4.2, type: '화재/연기 의심 감지', categoryName: '화재 감지' }],
  },
  {
    id: 'demo-fire-02',
    name: '화재 감지 테스트 2',
    area: '데모 구역 B',
    location: '화재 감지 테스트 영상',
    status: 'running',
    streamUrl: '/demo-cctv/fire-cam-02.mp4',
    isDemo: true,
    // 짧은 영상들이 한꺼번에 경보를 내지 않도록 감지 시점을 의도적으로 분산한다.
    detections: [{ id: 'fire-02', at: 8.1, type: '화재/연기 의심 감지', categoryName: '화재 감지' }],
  },
  {
    id: 'demo-forklift-03',
    name: '지게차 거리 테스트',
    area: '데모 구역 C',
    location: '지게차·보행자 거리 테스트 영상',
    status: 'running',
    streamUrl: '/demo-cctv/forklift-cam-03.mp4',
    isDemo: true,
    detections: [{ id: 'forklift-01', at: 14, type: '지게차·보행자 근접 위험', categoryName: '지게차 접근 위험' }],
  },
]

// DB에서 읽은 CCTV에도 동일한 URL이면 데모 감지 시나리오를 붙인다.
export function attachDemoScenario(camera) {
  const scenario = DEMO_CAMERAS.find((demoCamera) => demoCamera.streamUrl === camera.streamUrl)
  return scenario ? { ...camera, isDemo: true, detections: scenario.detections } : camera
}
