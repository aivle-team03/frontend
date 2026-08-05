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
import { attachDemoScenario, DEMO_CAMERAS } from '../mocks/demoCctv.js'
import styles from '../styles/CCTVMonitoring.module.css'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'

function StreamViewer({ streamUrl, cameraId, onTimeUpdate, demoRun }) {
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

  if (!streamUrl || hasError) {
    return <span className={styles.cameraPlaceholder}><VideocamOutlinedIcon /><small>{hasError ? '영상 로드 실패' : '연결 중...'}</small></span>
  }
  if (youTubeEmbedUrl) {
    return <iframe key={youTubeEmbedUrl} src={youTubeEmbedUrl} title={`CAM #${cameraId} YouTube 영상`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
  }
  return <video ref={videoRef} key={`${streamUrl}-${demoRun}`} src={resolveMediaUrl(streamUrl)} autoPlay loop muted playsInline onTimeUpdate={onTimeUpdate} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setHasError(true)} />
}

function MonitoringPage() {
  const navigate = useNavigate()
  const emittedDetectionKeys = useRef(new Set())
  const [serverCameras, setServerCameras] = useState([])
  const [serverEvents, setServerEvents] = useState([])
  const [demoEvents, setDemoEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [alertQueue, setAlertQueue] = useState([])
  const [activeAlert, setActiveAlert] = useState(null)
  const [demoRun, setDemoRun] = useState(0)
  const [riskCategories, setRiskCategories] = useState([])
  const playbackTimes = useRef({})

  // DB에 CCTV가 등록되어 있으면 DB 목록을 사용하고, 서버가 꺼진 데모 상황에서만 기본 3대를 표시한다.
  const cameras = useMemo(() => serverCameras.length ? serverCameras : DEMO_CAMERAS, [serverCameras])
  const events = useMemo(() => [...demoEvents, ...serverEvents], [demoEvents, serverEvents])

  useEffect(() => {
    const loadMonitoringData = async () => {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/cctvs', { headers })
        setServerCameras((response.data || []).map((item, index) => attachDemoScenario({
          id: item.cctv_id ?? item.camera_id ?? item.id,
          name: item.cctv_name || item.camera_name || `CCTV #${index + 1}`,
          area: item.area || `${index + 1}구역`,
          location: item.location || '위치 미지정',
          status: item.status || '정상',
          streamUrl: item.stream_url || '',
        })))
      } catch (error) {
        console.info('백엔드 CCTV 목록을 불러오지 못해 데모 CCTV만 표시합니다.', error)
      }
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
    if (!camera.isDemo) return
    const currentTime = event.currentTarget.currentTime
    playbackTimes.current[camera.id] = currentTime
    camera.detections.forEach((detection) => {
      if (currentTime >= detection.at) emitDemoDetection(camera, detection, currentTime)
    })
  }

  const restartDemo = () => {
    emittedDetectionKeys.current.clear()
    setDemoEvents([])
    setSelectedEvent(null)
    setAlertQueue([])
    setActiveAlert(null)
    setDemoRun((run) => run + 1)
  }

  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV 모니터링 작업 공간">
      <div className={styles.monitoringOverview}>
        <div><span className={styles.overviewIcon}><SensorsRoundedIcon /></span><div><strong>데모 CCTV AI 감지 모니터링</strong><p>테스트 영상 3개가 반복 재생되며, 감지 알림은 데모 실행당 한 번만 발생합니다.</p></div></div>
        <div className={styles.overviewStats}><span><i />온라인 <strong>{cameras.filter((camera) => camera.status === '정상' || camera.status === 'running').length}</strong></span><span>감지 이벤트 <strong>{demoEvents.length}</strong></span></div>
      </div>

      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <section className={styles.cctvmonitoringSection}>
            <header className={styles.sectionHeader}><div className={styles.sectionTitleGroup}><span className={styles.sectionIcon}><GridViewRoundedIcon /></span><div><h2 className={styles.title}>실시간 CCTV</h2><p>화재 테스트 2대와 지게차·보행자 거리 테스트 1대입니다.</p></div></div><div className={styles.headerActions}><button className={styles.panelAction} type="button" onClick={restartDemo}><ReplayRoundedIcon />데모 재시작</button></div></header>
            <div className={styles.videodashBoard}>{cameras.map((camera) => <button className={styles.video} onClick={() => navigate(`/monitoringdetail?camera=${camera.id}${camera.isDemo ? `&t=${Math.floor(playbackTimes.current[camera.id] || 0)}` : ''}`)} key={camera.id} type="button" aria-label={`${camera.area} 영상 상세 보기`}><span className={styles.cameraTopbar}><span className={styles.cameraLive}><i />LIVE</span><span>{camera.isDemo ? 'DEMO' : `CAM ${camera.id}`}</span></span><StreamViewer streamUrl={camera.streamUrl} cameraId={camera.id} demoRun={camera.isDemo ? demoRun : 0} onTimeUpdate={(event) => handleVideoTimeUpdate(camera, event)} /><span className={styles.cameraFooter}><span><strong>{camera.name || camera.area}</strong>{camera.location}</span>{camera.isDemo && <em>AI TEST</em>}</span></button>)}</div>
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
