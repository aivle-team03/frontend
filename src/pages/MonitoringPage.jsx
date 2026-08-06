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
import { DEMO_CAMERAS } from '../mocks/demoCctv.js'
import styles from '../styles/CCTVMonitoring.module.css'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'

function StreamViewer({ streamUrl, aiStreamUrl, cameraId, onTimeUpdate, demoRun, waitingForAiStart = false }) {
  const [hasError, setHasError] = useState(false)
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
    return <img src={aiStreamUrl} alt={`CAM #${cameraId} AI 분석 스트림`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
  }
  return <video ref={videoRef} key={`${streamUrl}-${demoRun}`} src={resolveMediaUrl(streamUrl)} autoPlay loop muted playsInline onTimeUpdate={onTimeUpdate} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
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
  const [aiSessionId, setAiSessionId] = useState(0)
  const playbackTimes = useRef({})
  const lastAiEventId = useRef(0)

  // 1차 시연은 AI 서비스가 제공하는 테스트 카메라만 보여 준다.
  // DB CCTV는 운영용 AI 스트림 URL을 설정한 뒤에 추가한다.
  const cameras = useMemo(() => DEMO_CAMERAS, [])
  const events = useMemo(() => [...demoEvents, ...serverEvents], [demoEvents, serverEvents])

  useEffect(() => {
    const loadMonitoringData = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/monitoring/events', { headers })
        setServerEvents((response.data || []).map((event) => ({
          id: event.event_id ?? event.id,
          time: event.date ? String(event.date).replace('T', ' ').substring(0, 16) : '-',
          location: event.cctv?.location || event.location || '위치 미지정',
          type: event.category?.category_name || event.event_type || '위험 요소 감지',
          status: ['completed', 'resolved', 'approved', '조치 완료'].includes(String(event.current_status ?? event.status).toLowerCase()) ? '조치 완료' : '조치 필요',
          manager: event.manager_name || '미배정',
        })))
      } catch (error) {
        console.info('백엔드 이벤트를 불러오지 못해 데모 이벤트만 표시합니다.', error)
      }
    }
    loadMonitoringData()
  }, [])

  useEffect(() => {
    // AI worker is independent from the browser. Start every monitoring visit from frame 0.
    const startFreshAiSession = () => {
      setAiSessionReady(false)
      lastAiEventId.current = 0
      // /reset과 모델 워밍업을 기다리지 않고 스트림을 바로 연다.
      setAiSessionId(Date.now())
      setAiSessionReady(true)
      axios.post('http://127.0.0.1:8001/reset').catch(() => {
        console.info('AI 서버를 찾을 수 없습니다.')
      })
    }
    startFreshAiSession()
  }, [])

  useEffect(() => {
    if (!aiSessionReady) return undefined
    const pollAiEvents = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8001/events?after=${lastAiEventId.current}`)
        for (const aiEvent of response.data?.events || []) {
          lastAiEventId.current = Math.max(lastAiEventId.current, aiEvent.id)
          const camera = cameras.find((item) => item.aiCameraId === aiEvent.cameraId)
          if (!camera) continue
          const category = riskCategories.find((item) => item.category_name === aiEvent.categoryName)
          const key = `ai-${aiEvent.id}`
          if (emittedDetectionKeys.current.has(key)) continue
          emittedDetectionKeys.current.add(key)
          const event = {
            id: key,
            time: aiEvent.detectedAt?.replace('T', ' ') || new Date().toLocaleTimeString('ko-KR'),
            location: camera.location,
            type: aiEvent.categoryName,
            status: '조치 대기',
            manager: '미배정',
            cameraId: camera.id,
            streamUrl: camera.streamUrl,
            aiStreamUrl: camera.aiStreamUrl,
            // The AI process restarts its numeric event IDs.  Add the detection
            // time so a browser never reuses an old snapshot with the same ID.
            snapshotUrl: aiEvent.snapshotDataUrl || (aiEvent.snapshotUrl ? (aiEvent.snapshotUrl.startsWith('http') ? aiEvent.snapshotUrl : `http://127.0.0.1:8001${aiEvent.snapshotUrl}`) : ''),
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
        const response = await axios.get('http://127.0.0.1:8000/api/risk/list', {
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
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
    setDemoEvents([])
    setSelectedEvent(null)
    setAlertQueue([])
    setActiveAlert(null)
    setDemoRun((run) => run + 1)
    setAiSessionReady(false)
    setAiSessionId(Date.now())
    setAiSessionReady(true)
    axios.post('http://127.0.0.1:8001/reset').catch(() => {
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
            <div className={styles.videodashBoard}>{cameras.map((camera) => <button className={styles.video} onClick={() => navigate(`/monitoringdetail?camera=${camera.id}${camera.isDemo ? `&t=${Math.floor(playbackTimes.current[camera.id] || 0)}` : ''}`)} key={camera.id} type="button" aria-label={`${camera.area} 영상 상세 보기`}><span className={styles.cameraTopbar}><span className={styles.cameraLive}><i />LIVE</span>{!camera.isDemo && <span>CAM {camera.id}</span>}</span><StreamViewer streamUrl={camera.streamUrl} aiStreamUrl={camera.aiStreamUrl ? `${camera.aiStreamUrl}?session=${aiSessionId}` : ''} cameraId={camera.id} demoRun={camera.isDemo ? demoRun : 0} waitingForAiStart={Boolean(camera.aiStreamUrl) && !aiSessionReady} onTimeUpdate={(event) => handleVideoTimeUpdate(camera, event)} /><span className={styles.cameraFooter}><span><strong>{camera.name || camera.area}</strong>{camera.location}</span></span></button>)}</div>
          </section>
        </div>

        <div className={styles.EventSection}>
          <section className={styles.liveEvent}><header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><span className={`${styles.sectionIcon} ${styles.alertIcon}`}><WarningAmberRoundedIcon /></span><div><h2 className={styles.title}>실시간 알림</h2><p>동시에 감지되어도 경보 창은 한 건씩 순서대로 표시합니다.</p></div></div><span className={styles.alertCount}>{events.length}건</span></header><RecentEventsTable events={events} selectedEvent={selectedEvent} onSelectEvent={setSelectedEvent} /></section>
          <section className={styles.emptyBox}><header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><div><h2 className={styles.title}>이벤트 상세</h2><p>선택한 감지 결과를 확인합니다.</p></div></div></header>{selectedEvent ? <div className={styles.eventDetail}><div className={styles.eventDetailHeadline}><span className={styles.eventWarningIcon}><WarningAmberRoundedIcon /></span><div><span>{selectedEvent.isDemo ? 'AI 데모 감지' : selectedEvent.status}</span><strong>{selectedEvent.type}</strong></div></div><dl><div><dt><LocationOnOutlinedIcon />감지 위치</dt><dd>{selectedEvent.location}</dd></div><div><dt><AccessTimeRoundedIcon />감지 시간</dt><dd>{selectedEvent.time}</dd></div><div><dt>신뢰도</dt><dd>{selectedEvent.confidence ? `${Math.round(selectedEvent.confidence * 100)}%` : '-'}</dd></div></dl><button type="button" onClick={() => navigate('/checklists/management')}>체크리스트 확인 <ArrowForwardRoundedIcon /></button></div> : <div className={styles.emptyEvent}>아직 감지된 데모 이벤트가 없습니다.</div>}</section>
        </div>
      </div>

      <DetectionAlertDialog alert={activeAlert} queueCount={alertQueue.length} onClose={() => setActiveAlert(null)} onAssign={() => navigate('/checklists/management')} />
    </section>
  )
}

export default MonitoringPage
