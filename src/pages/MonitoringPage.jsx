import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import DetectionAlertDialog from '../components/monitoring/DetectionAlertDialog.jsx'
import styles from '../styles/CCTVMonitoring.module.css'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'
import { clearAiEventSession, readAiEventSession, saveAiEventSession } from '../utils/aiEventSession.js'
import { toMonitoringCamera } from '../utils/cctvCamera.js'
import { BACKEND_API_URL, VISION_API_URL } from '../config/api.js'

const EQUIPMENT_CARDS = [
  { cameraId: 'extinguisher-01', displayName: '소화기 확인', categoryName: '소화기 미감지', detector: 'extinguisher', status: 'warming_up' },
  { cameraId: 'hydrant-01', displayName: '소화전 확인', categoryName: '소화전 미감지', detector: 'hydrant', status: 'warming_up' },
]

// 상세 화면으로 이동하면 MonitoringPage 컴포넌트는 새로 만들어진다. 하지만
// 같은 AI 서버 세션에서 이미 사용자에게 보여 준 이벤트까지 다시 알림으로
// 처리하면 안 되므로, 마지막 확인 ID는 탭이 닫힐 때까지 보관한다.
function getAiPreviewUrl(aiStreamUrl, nonce) {
  const url = new URL(aiStreamUrl)
  url.pathname = url.pathname.replace('/streams/', '/frames/')
  url.searchParams.set('preview', String(nonce))
  return url.toString()
}

function StreamViewer({ streamUrl, aiStreamUrl, cameraId, onTimeUpdate, demoRun, waitingForAiStart = false }) {
  const [hasError, setHasError] = useState(false)
  const [previewNonce, setPreviewNonce] = useState(0)
  const videoRef = useRef(null)
  const youTubeEmbedUrl = getYouTubeEmbedUrl(streamUrl, { autoplay: true })

  useEffect(() => setHasError(false), [streamUrl])
  useEffect(() => () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.removeAttribute('src')
    video.load()
  }, [])

  if (waitingForAiStart) {
    return <span className={styles.cameraPlaceholder}><VideocamOutlinedIcon /><small>AI 분석 시작 중...</small></span>
  }
  if (!streamUrl || hasError) {
    return <span className={styles.cameraPlaceholder}><VideocamOutlinedIcon /><small>{hasError ? '영상 로드 실패' : '연결 중...'}</small></span>
  }
  if (youTubeEmbedUrl) {
    return <iframe key={youTubeEmbedUrl} src={youTubeEmbedUrl} title={`CAM #${cameraId} YouTube 영상`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
  }
  if (aiStreamUrl) {
    const previewUrl = getAiPreviewUrl(aiStreamUrl, previewNonce)
    return <span style={{ position: 'relative', display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}>
      <img src={previewUrl} alt="" aria-hidden="true" onError={() => window.setTimeout(() => setPreviewNonce(Date.now()), 200)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <img src={aiStreamUrl} alt={`CAM #${cameraId} AI stream`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
    </span>
    return <img src={aiStreamUrl} alt={`CAM #${cameraId} AI 분석 스트림`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
  }
  return <video ref={videoRef} key={`${streamUrl}-${demoRun}`} src={resolveMediaUrl(streamUrl)} autoPlay loop muted playsInline onTimeUpdate={onTimeUpdate} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
}

function formatInspectionTime(timestamp) {
  if (!timestamp) return '점검 준비 중'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp * 1000))
}

function MonitoringPage() {
  const navigate = useNavigate()
  const emittedDetectionKeys = useRef(new Set())
  const [serverEvents, setServerEvents] = useState([])
  const [demoEvents, setDemoEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [alertQueue, setAlertQueue] = useState([])
  const [activeAlert, setActiveAlert] = useState(null)
  const [demoRun, setDemoRun] = useState(0)
  const [riskCategories, setRiskCategories] = useState([])
  const [aiSessionReady, setAiSessionReady] = useState(false)
  const [cameras, setCameras] = useState([])
  const [equipmentInspections, setEquipmentInspections] = useState(EQUIPMENT_CARDS)
  const playbackTimes = useRef({})
  const savedAiEventSession = useRef(readAiEventSession())
  const lastAiEventId = useRef(savedAiEventSession.current.cursor)
  const aiServerInstanceId = useRef(savedAiEventSession.current.serverInstanceId)

  // 1차 시연은 AI 서비스가 제공하는 테스트 카메라만 보여 준다.
  // DB CCTV는 운영용 AI 스트림 URL을 설정한 뒤에 추가한다.
  // AI 서버에서 즉시 받은 이벤트와 DB에 저장된 같은 이벤트가 잠시 함께 있어도 한 건만 보인다.
  const events = useMemo(() => {
    const keys = new Set()
    return [...demoEvents, ...serverEvents].filter((event) => {
      const key = `${event.time}|${event.location}|${event.type}`
      if (keys.has(key)) return false
      keys.add(key)
      return true
    }).sort((left, right) => String(right.time).localeCompare(String(left.time)))
  }, [demoEvents, serverEvents])

  useEffect(() => {
    const loadMonitoringData = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
      try {
        const response = await axios.get(`${BACKEND_API_URL}/api/monitoring/events`, { headers })
        setServerEvents((response.data || []).map((event) => ({
          id: event.event_id ?? event.id,
          time: event.date ? String(event.date).replace('T', ' ').substring(0, 16) : '-',
          location: event.cctv?.location || event.location || '위치 미지정',
          type: event.category?.category_name || event.event_type || '위험 요소 감지',
          // monitoring API가 event와 연결된 최신 action_history의 상태를
          // current_status로 내려 준다. '조치 필요'는 과거 목업 표기라서
          // 실제 DB의 '조치 대기'/'조치 완료'를 덮어쓰면 안 된다.
          status: event.current_status ?? event.action_status ?? event.status ?? '조치 대기',
          manager: event.manager_name || '미배정',
        })))
      } catch (error) {
        console.info('백엔드 이벤트를 불러오지 못해 데모 이벤트만 표시합니다.', error)
      }
    }
    const loadCameras = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
      try {
        const response = await axios.get(`${BACKEND_API_URL}/api/cctvs`, { headers })
        setCameras((response.data || []).map(toMonitoringCamera))
      } catch (error) {
        console.info('CCTV 목록을 불러오지 못했습니다.', error)
        setCameras([])
      }
    }
    loadMonitoringData()
    loadCameras()
    // AI 저장은 별도 스레드에서 끝난다. 화면 이동/재진입 여부와 관계없이
    // DB 저장이 끝난 이벤트를 곧바로 목록의 기준 데이터로 다시 반영한다.
    const refreshIntervalId = window.setInterval(loadMonitoringData, 2000)
    return () => window.clearInterval(refreshIntervalId)
  }, [])

  useEffect(() => {
    let isMounted = true
    let refreshTimeoutId
    const loadEquipmentInspections = async () => {
      try {
        const response = await axios.get(`${VISION_API_URL}/equipment/status`)
        const equipment = response.data?.equipment || []
        if (isMounted) {
          setEquipmentInspections(EQUIPMENT_CARDS.map((card) => ({
            ...card,
            ...(equipment.find((item) => item.cameraId === card.cameraId) || {}),
          })))
        }

        // 소화설비는 서버가 주기 점검한 결과만 바뀐다. 첫 점검이 끝날 때까지만
        // 짧게 재시도하고, 결과가 있으면 AI 서버의 점검 주기와 동일하게 조회한다.
        const isWarmingUp = !equipment.length || equipment.some((item) => item.status === 'warming_up')
        const inspectionIntervalSeconds = Number(response.data?.inspectionIntervalSeconds) || 600
        refreshTimeoutId = window.setTimeout(
          loadEquipmentInspections,
          (isWarmingUp ? 5 : inspectionIntervalSeconds) * 1000,
        )
      } catch (error) {
        // AI 서버를 실행하지 않은 환경에서는 자동 점검 카드만 비워 둔다.
        if (isMounted) setEquipmentInspections((current) => current.map((item) => ({ ...item, status: 'offline' })))
        refreshTimeoutId = window.setTimeout(loadEquipmentInspections, 5000)
      }
    }

    loadEquipmentInspections()
    return () => {
      isMounted = false
      window.clearTimeout(refreshTimeoutId)
    }
  }, [])

  useEffect(() => {
    // 페이지 이동은 기존 AI worker를 계속 사용한다. 상세 화면에서 돌아올 때
    // 영상을 처음부터 다시 분석하지 않고 현재 진행 중인 프레임을 바로 받는다.
    setAiSessionReady(true)
  }, [])

  useEffect(() => {
    if (!aiSessionReady) return undefined
    const pollAiEvents = async () => {
      try {
        const response = await axios.get(`${VISION_API_URL}/events?after=${lastAiEventId.current}`)
        const serverInstanceId = response.data?.serverInstanceId || ''
        if (serverInstanceId && aiServerInstanceId.current !== serverInstanceId) {
          // Same browser refresh keeps the cursor, but an AI server restart gets
          // a fresh event sequence and must be allowed to notify once again.
          if (aiServerInstanceId.current) lastAiEventId.current = 0
          aiServerInstanceId.current = serverInstanceId
          saveAiEventSession(serverInstanceId, lastAiEventId.current)
        }
        for (const aiEvent of response.data?.events || []) {
          lastAiEventId.current = Math.max(lastAiEventId.current, aiEvent.id)
          saveAiEventSession(aiServerInstanceId.current, lastAiEventId.current)
          const camera = cameras.find((item) => item.aiCameraId === aiEvent.cameraId)
          if (!camera) continue
          const category = riskCategories.find((item) => item.category_name === aiEvent.categoryName)
          const key = `ai-${aiEvent.id}`
          if (emittedDetectionKeys.current.has(key)) continue
          emittedDetectionKeys.current.add(key)
          const snapshotUrl = aiEvent.snapshotDataUrl || (aiEvent.snapshotUrl ? (aiEvent.snapshotUrl.startsWith('http') ? aiEvent.snapshotUrl : `${VISION_API_URL}${aiEvent.snapshotUrl}`) : '')
          // AI 서버가 백엔드 기동 직후 전송에 실패해도, 브라우저가 AI 감지를
          // 수신한 순간 동일한 저장 API를 한 번 더 호출한다. 백엔드는 snapshotUrl을
          // 멱등 키로 처리하므로 AI 전송과 동시에 성공해도 DB event는 중복되지 않는다.
          const fallbackCategoryId = aiEvent.cameraId === 'fire-01' ? 1 : 1000006
          if (camera.id && snapshotUrl) {
            axios.post(`${BACKEND_API_URL}/api/ai/events`, {
              cctv_id: camera.id,
              category_id: category?.category_id ?? fallbackCategoryId,
              image_url: snapshotUrl,
            }).catch((error) => {
              console.info('AI 감지 이벤트 DB 보완 저장에 실패했습니다.', error)
            })
          }
          const event = {
            id: key,
            // 목록 폭을 고정하기 위해 날짜·시간은 분 단위까지만 표시한다.
            time: aiEvent.detectedAt
              ? aiEvent.detectedAt.replace('T', ' ').substring(0, 16)
              : new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            location: camera.location,
            type: aiEvent.categoryName,
            status: '조치 대기',
            manager: '미배정',
            cameraId: camera.id,
            streamUrl: camera.streamUrl,
            aiStreamUrl: camera.aiStreamUrl,
            // The AI process restarts its numeric event IDs.  Add the detection
            // time so a browser never reuses an old snapshot with the same ID.
            snapshotUrl,
            videoTime: aiEvent.sourceTime,
            categoryName: category?.category_name ?? aiEvent.categoryName,
            riskLevel: category?.risk_level ?? '확인 필요',
            level: category?.level ?? null,
            isDemo: false,
          }
          setDemoEvents((current) => [event, ...current])
          setSelectedEvent(event)
          setAlertQueue((queue) => [...queue, event])
        }
      } catch {
        // AI server is optional until the local inference process is started.
      }
    }
    pollAiEvents()
    const intervalId = window.setInterval(pollAiEvents, 1000)
    return () => window.clearInterval(intervalId)
  }, [aiSessionReady, cameras, riskCategories])

  useEffect(() => {
    const loadRiskCategories = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/api/risk/list`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        setRiskCategories(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.info('위험도 카테고리를 불러오지 못해 데모 기본값을 사용합니다.', error)
      }
    }
    loadRiskCategories()
  }, [])

  useEffect(() => {
    if (!activeAlert && alertQueue.length) {
      setActiveAlert(alertQueue[0])
      setAlertQueue((queue) => queue.slice(1))
    }
  }, [activeAlert, alertQueue])

  const emitDemoDetection = (camera, detection, videoTime) => {
    const key = `${demoRun}-${camera.id}-${detection.id}`
    if (emittedDetectionKeys.current.has(key)) return
    emittedDetectionKeys.current.add(key)
    const now = new Date()
    const category = riskCategories.find((item) => item.category_name === detection.categoryName)
    const event = {
      id: `demo-${key}`,
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      location: camera.location,
      type: detection.type,
      status: '조치 필요',
      manager: '데모 담당자',
      cameraId: camera.id,
      cameraName: camera.name,
      streamUrl: camera.streamUrl,
      videoTime,
      categoryId: category?.category_id ?? null,
      categoryName: category?.category_name ?? detection.categoryName,
      riskLevel: category?.risk_level ?? '확인 필요',
      level: category?.level ?? null,
      isDemo: true,
    }
    setDemoEvents((current) => [event, ...current])
    setSelectedEvent(event)
    setAlertQueue((queue) => [...queue, event])
  }

  const handleVideoTimeUpdate = (camera, event) => {
    if (!camera.isDemo || camera.aiStreamUrl) return
    const currentTime = event.currentTarget.currentTime
    playbackTimes.current[camera.id] = currentTime
    camera.detections.forEach((detection) => {
      if (currentTime >= detection.at) emitDemoDetection(camera, detection, currentTime)
    })
  }

  const restartDemo = () => {
    emittedDetectionKeys.current.clear()
    lastAiEventId.current = 0
    aiServerInstanceId.current = ''
    clearAiEventSession()
    setDemoEvents([])
    setSelectedEvent(null)
    setAlertQueue([])
    setActiveAlert(null)
    setDemoRun((run) => run + 1)
    setAiSessionReady(false)
    setAiSessionReady(true)
    axios.post(`${VISION_API_URL}/reset`).catch(() => {
      console.info('AI 서버를 찾을 수 없습니다.')
    })
  }

  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV 모니터링 작업 공간">
      <div className={styles.monitoringOverview}>
        <div><span className={styles.overviewIcon}><SensorsRoundedIcon /></span><div><strong>CCTV AI 감지 모니터링</strong><p>현장 CCTV와 실시간 감지 상태를 확인하세요.</p></div></div>
        <div className={styles.overviewStats}><span><i />온라인 <strong>{cameras.filter((camera) => camera.status === '정상' || camera.status === 'running').length}</strong></span><span>감지 이벤트 <strong>{demoEvents.length}</strong></span></div>
      </div>

      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <section className={styles.cctvmonitoringSection}>
            <header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><span className={styles.sectionIcon}><GridViewRoundedIcon /></span><div><h2 className={styles.title}>실시간 CCTV</h2><p>화재 테스트와 지게차·보행자 거리 테스트를 분석합니다.</p></div></div><div className={styles.headerActions}><button className={styles.panelAction} type="button" onClick={restartDemo}><ReplayRoundedIcon />데모 재시작</button></div></header>
            <div className={styles.videodashBoard}>{cameras.map((camera) => <button className={styles.video} onClick={() => navigate(`/monitoringdetail?camera=${camera.id}${camera.isDemo ? `&t=${Math.floor(playbackTimes.current[camera.id] || 0)}` : ''}`)} key={camera.id} type="button" aria-label={`${camera.area} 영상 상세 보기`}><span className={styles.cameraTopbar}><span className={styles.cameraLive}><i />LIVE</span>{!camera.isDemo && <span>CAM {camera.id}</span>}</span><StreamViewer streamUrl={camera.streamUrl} aiStreamUrl={camera.aiStreamUrl || ''} cameraId={camera.id} demoRun={camera.isDemo ? demoRun : 0} waitingForAiStart={Boolean(camera.aiStreamUrl) && !aiSessionReady} onTimeUpdate={(event) => handleVideoTimeUpdate(camera, event)} /><span className={styles.cameraFooter}><span><strong>{camera.name || camera.area}</strong>{camera.location}</span></span></button>)}</div>
          </section>
          <section className={styles.equipmentSection}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionIcon}><SensorsRoundedIcon /></span>
                <div><h2 className={styles.title}>소화설비 자동 점검</h2><p>최근 점검 프레임의 AI 탐지 결과를 확인합니다.</p></div>
              </div>
              <span className={styles.inspectionInterval}>10분 주기</span>
            </header>
            <div className={styles.equipmentGrid}>
              {equipmentInspections.map((inspection) => {
                const isWarning = inspection.status === 'warning'
                const isWaiting = inspection.status === 'warming_up'
                const isOffline = inspection.status === 'offline'
                const imageUrl = inspection.inspectedAt ? `${inspection.imageUrl}?updated=${inspection.inspectedAt}` : ''
                return <article className={`${styles.equipmentCard} ${isWarning ? styles.equipmentWarning : ''}`} key={inspection.cameraId}>
                  <div className={styles.equipmentImage}>
                    {imageUrl ? <img src={imageUrl} alt={`${inspection.displayName} 점검 결과`} /> : <span className={styles.equipmentPlaceholder}><VideocamOutlinedIcon />{isOffline ? 'AI 서버 연결 안 됨' : '점검 준비 중'}</span>}
                    <span className={`${styles.equipmentStatus} ${isWarning || isOffline ? styles.equipmentStatusWarning : ''}`}>{isOffline ? '연결 안 됨' : isWaiting ? '점검 준비 중' : isWarning ? '조치 필요' : '정상'}</span>
                  </div>
                  <div className={styles.equipmentContent}>
                    <strong>{inspection.displayName}</strong>
                    <p>{isOffline ? (inspection.inspectedAt ? '마지막 점검 결과를 표시하고 있습니다.' : 'AI 서버를 시작하면 점검 프레임이 표시됩니다.') : isWaiting ? 'AI 서버가 첫 점검 결과를 준비하고 있습니다.' : isWarning ? inspection.reason || '설비 미감지' : `${inspection.detectedCount}개 탐지됨 · 신뢰도 ${Math.round((inspection.confidence || 0) * 100)}%`}</p>
                    <small>최근 점검 {formatInspectionTime(inspection.inspectedAt)}</small>
                  </div>
                </article>
              })}
            </div>
          </section>
        </div>

        <div className={styles.EventSection}>
          <section className={styles.liveEvent}><header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><span className={`${styles.sectionIcon} ${styles.alertIcon}`}><WarningAmberRoundedIcon /></span><div><h2 className={styles.title}>최근 감지 이벤트</h2><p>CCTV 감지 이벤트와 연결된 조치 내역을 최근순으로 표시합니다.</p></div></div><span className={styles.alertCount}>{events.length}건</span></header><RecentEventsTable events={events} selectedEvent={selectedEvent} onSelectEvent={setSelectedEvent} /></section>
          <section className={styles.emptyBox}><header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><div><h2 className={styles.title}>이벤트 상세</h2><p>선택한 감지 결과를 확인합니다.</p></div></div></header>{selectedEvent ? <div className={styles.eventDetail}><div className={styles.eventDetailHeadline}><span className={styles.eventWarningIcon}><WarningAmberRoundedIcon /></span><div><span>{selectedEvent.isDemo ? 'AI 데모 감지' : selectedEvent.status}</span><strong>{selectedEvent.type}</strong></div></div><dl><div><dt><LocationOnOutlinedIcon />감지 위치</dt><dd>{selectedEvent.location}</dd></div><div><dt><AccessTimeRoundedIcon />감지 시간</dt><dd>{selectedEvent.time}</dd></div><div><dt>신뢰도</dt><dd>{selectedEvent.confidence ? `${Math.round(selectedEvent.confidence * 100)}%` : '-'}</dd></div></dl><button type="button" onClick={() => navigate('/checklists/management')}>체크리스트 확인 <ArrowForwardRoundedIcon /></button></div> : <div className={styles.emptyEvent}>아직 감지된 데모 이벤트가 없습니다.</div>}</section>
        </div>
      </div>

      <DetectionAlertDialog alert={activeAlert} queueCount={alertQueue.length} onClose={() => setActiveAlert(null)} onAssign={() => navigate('/checklists/management')} />
    </section>
  )
}

export default MonitoringPage
