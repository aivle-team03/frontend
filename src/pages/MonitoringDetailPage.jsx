import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/monitoringdetail.css'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'
import DetectionAlertDialog from '../components/monitoring/DetectionAlertDialog.jsx'
import { readAiEventSession, saveAiEventSession } from '../utils/aiEventSession.js'
import { toMonitoringCamera } from '../utils/cctvCamera.js'
import { BACKEND_API_URL, VISION_API_URL } from '../config/api.js'

function getAiPreviewUrl(aiStreamUrl, nonce) {
  const url = new URL(aiStreamUrl)
  url.pathname = url.pathname.replace('/streams/', '/frames/')
  url.searchParams.set('preview', String(nonce))
  return url.toString()
}

function StreamViewer({ streamUrl, aiStreamUrl, cameraId, initialTime = 0, onTimeUpdate }) {
  const [hasError, setHasError] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0)
  const videoRef = useRef(null)
  const youTubeEmbedUrl = getYouTubeEmbedUrl(streamUrl, { autoplay: true })

  useEffect(() => {
    setHasError(false);
  }, [streamUrl]);

  useEffect(() => () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.removeAttribute('src')
    video.load()
  }, [])

  if (!streamUrl || hasError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
        <VideocamOutlinedIcon style={{ fontSize: '48px', marginBottom: '8px' }} />
        <span>{hasError ? "비디오 로드 실패" : "실시간 스트림 연결 중..."}</span>
      </div>
    );
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
    return <img src={aiStreamUrl} alt={`CAM #${cameraId} AI 분석 스트림`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  }

  return (
    <video
      ref={videoRef}
      key={streamUrl}
      src={resolveMediaUrl(streamUrl)}
      autoPlay
      loop
      muted
      playsInline
      onLoadedMetadata={(event) => {
        if (initialTime > 0) event.currentTarget.currentTime = initialTime
      }}
      onTimeUpdate={onTimeUpdate}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={(e) => {
        console.error(`CAM #${cameraId} 상세 영상 로드 에러:`, e);
        setHasError(true);
      }}
    />
  );
}

function MonitoringDetailLoadingSkeleton() {
  return <section className="monitoring-detail-page monitoring-detail-skeleton" aria-busy="true" aria-label="상세 모니터링 정보를 불러오는 중입니다">
    <header className="monitoring-detail-toolbar"><span className="detail-skeleton-block detail-skeleton-back" /><div><span className="detail-skeleton-block detail-skeleton-line short" /><span className="detail-skeleton-block detail-skeleton-line medium" /></div><span className="detail-skeleton-block detail-skeleton-live" /></header>
    <div className="page-Layout"><div className="cctv-main-Layout"><section className="subCard cctv-primary-view"><div className="primary-view-header"><span className="detail-skeleton-block detail-skeleton-line medium" /><span className="detail-skeleton-block detail-skeleton-line short" /></div><div className="detail-skeleton-block detail-skeleton-video" /></section><section className="subCard camera-thumbnail-panel"><div className="detail-section-heading"><span className="detail-skeleton-block detail-skeleton-line medium" /><span className="detail-skeleton-block detail-skeleton-line short" /></div><div className="detail-thumbnail-list">{[1, 2, 3, 4].map((item) => <span className="detail-skeleton-block detail-skeleton-thumbnail" key={item} />)}</div></section></div><aside className="detection-main-Layout"><div className="detection-Section">{[1, 2].map((item) => <article className="subCard detection-status-card" key={item}><span className="detail-skeleton-block detail-skeleton-status-icon" /><div><span className="detail-skeleton-block detail-skeleton-line short" /><span className="detail-skeleton-block detail-skeleton-line medium" /><span className="detail-skeleton-block detail-skeleton-line long" /></div></article>)}</div><section className="subCard detail-event-card"><div className="detail-section-heading"><span className="detail-skeleton-block detail-skeleton-line medium" /><span className="detail-skeleton-block detail-skeleton-line short" /></div><span className="detail-skeleton-block detail-skeleton-event" />{[1, 2, 3].map((item) => <span className="detail-skeleton-block detail-skeleton-row" key={item} />)}<span className="detail-skeleton-block detail-skeleton-button" /></section></aside></div>
  </section>
}

function MonitoringDetailPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [cameraList, setCameraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const emittedDetectionKeys = useRef(new Set())
  const [riskCategories, setRiskCategories] = useState([])
  const [alertQueue, setAlertQueue] = useState([])
  const [activeAlert, setActiveAlert] = useState(null)
  // 목록과 상세가 같은 AI 이벤트 커서를 공유해야 화면을 왕복해도
  // 이미 띄운 감지 모달이 다시 나타나지 않는다.
  const savedAiEventSession = useRef(readAiEventSession())
  const lastAiEventId = useRef(savedAiEventSession.current.cursor)
  const aiServerInstanceId = useRef(savedAiEventSession.current.serverInstanceId)

  const currentCameraIdFromUrl = searchParams.get('camera');

  useEffect(() => {
    fetchCameraList();
  }, []);

  useEffect(() => {
    axios.get(`${BACKEND_API_URL}/api/risk/list`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((response) => setRiskCategories(Array.isArray(response.data) ? response.data : []))
      .catch((error) => console.info('위험도 카테고리를 불러오지 못했습니다.', error))
  }, [])

  useEffect(() => {
    if (!activeAlert && alertQueue.length) {
      setActiveAlert(alertQueue[0])
      setAlertQueue((queue) => queue.slice(1))
    }
  }, [activeAlert, alertQueue])

  const fetchCameraList = async () => {
    // 모니터링 화면과 동일하게 1차 시연에서는 AI 서비스의 두 카메라만 쓴다.
    try {
      const response = await axios.get(`${BACKEND_API_URL}/api/cctvs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      setCameraList((response.data || []).map(toMonitoringCamera))
    } catch (error) {
      console.info('CCTV 목록을 불러오지 못했습니다.', error)
      setCameraList([])
    } finally {
      setLoading(false)
    }
  };

  const activeCamera = cameraList.find(
    (cam) => String(cam.id) === String(currentCameraIdFromUrl)
  ) || cameraList[0] || { id: 1, area: '1구역', location: '위치 미지정', cctv_name: '카메라', streamUrl: '' };

  useEffect(() => {
    if (!activeCamera?.aiCameraId) return undefined
    const pollAiEvents = async () => {
      try {
        const response = await axios.get(`${VISION_API_URL}/events?after=${lastAiEventId.current}`)
        const serverInstanceId = response.data?.serverInstanceId || ''
        if (serverInstanceId && aiServerInstanceId.current !== serverInstanceId) {
          if (aiServerInstanceId.current) lastAiEventId.current = 0
          aiServerInstanceId.current = serverInstanceId
          saveAiEventSession(serverInstanceId, lastAiEventId.current)
        }
        for (const aiEvent of response.data?.events || []) {
          lastAiEventId.current = Math.max(lastAiEventId.current, aiEvent.id)
          saveAiEventSession(aiServerInstanceId.current, lastAiEventId.current)
          if (aiEvent.cameraId !== activeCamera.aiCameraId) continue
          const category = riskCategories.find((item) => item.category_name === aiEvent.categoryName)
          setAlertQueue((queue) => [...queue, {
            id: `ai-${aiEvent.id}`,
            time: aiEvent.detectedAt?.replace('T', ' ') || '-',
            location: activeCamera.location,
            streamUrl: activeCamera.streamUrl,
            aiStreamUrl: activeCamera.aiStreamUrl,
            snapshotUrl: aiEvent.snapshotDataUrl || (aiEvent.snapshotUrl ? (aiEvent.snapshotUrl.startsWith('http') ? aiEvent.snapshotUrl : `${VISION_API_URL}${aiEvent.snapshotUrl}`) : ''),
            categoryName: category?.category_name ?? aiEvent.categoryName,
            riskLevel: category?.risk_level ?? '확인 필요',
            level: category?.level ?? null,
          }])
        }
      } catch {
        // The local AI server may not be running yet.
      }
    }
    pollAiEvents()
    const intervalId = window.setInterval(pollAiEvents, 1000)
    return () => window.clearInterval(intervalId)
  }, [activeCamera, riskCategories])

  const handleDemoVideoTimeUpdate = (event) => {
    if (!activeCamera?.isDemo) return
    const currentTime = event.currentTarget.currentTime
    activeCamera.detections.forEach((detection) => {
      const key = `${activeCamera.id}-${detection.id}`
      if (currentTime < detection.at || emittedDetectionKeys.current.has(key)) return
      emittedDetectionKeys.current.add(key)
      const category = riskCategories.find((item) => item.category_name === detection.categoryName)
      const now = new Date()
      const alert = {
        id: key,
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        location: activeCamera.location,
        streamUrl: activeCamera.streamUrl,
        videoTime: currentTime,
        categoryName: category?.category_name ?? detection.categoryName,
        riskLevel: category?.risk_level ?? '확인 필요',
        level: category?.level ?? null,
      }
      setAlertQueue((queue) => [...queue, alert])
    })
  }

  if (loading) {
    return <MonitoringDetailLoadingSkeleton />
  }

  return (
    <section className="monitoring-detail-page" aria-label={`${activeCamera.id} 상세 모니터링`}>
      <header className="monitoring-detail-toolbar">
        <button type="button" onClick={() => navigate('/monitoring')} aria-label="CCTV 모니터링으로 돌아가기">
          <ArrowBackRoundedIcon />
        </button>
        <div>
          <span>{activeCamera.cctv_name}</span>
          <strong>{activeCamera.area} · {activeCamera.location}</strong>
        </div>
        <span className="detail-live-status"><i />LIVE</span>
      </header>

      <div className="page-Layout">
        <div className="cctv-main-Layout">
          <section className="subCard cctv-primary-view">
            <div className="primary-view-header">
              <div><VideocamOutlinedIcon /><span>실시간 영상</span></div>
              <small>연결 상태 정상 · 1080p</small>
            </div>

            <div className="primary-video-placeholder" style={{ position: 'relative', overflow: 'hidden', height: '420px', background: '#0f172a' }}>
              <span className="primary-camera-label" style={{ zIndex: 2 }}>
                <i />CAM #{activeCamera.id}
              </span>

              <StreamViewer streamUrl={activeCamera.streamUrl} aiStreamUrl={activeCamera.aiStreamUrl} cameraId={activeCamera.id} initialTime={Number(searchParams.get('t') || 0)} onTimeUpdate={handleDemoVideoTimeUpdate} />

              <span className="primary-video-time" style={{ zIndex: 2 }}>
                <AccessTimeRoundedIcon />실시간 스트리밍 중
              </span>
            </div>
          </section>

          <section className="subCard camera-thumbnail-panel">
            <div className="detail-section-heading">
              <strong>카메라 전환</strong>
              <span>전체 {cameraList.length}대</span>
            </div>
            <div className="detail-thumbnail-list">
              {cameraList.map((camera) => {
                const isSelected = String(camera.id) === String(activeCamera.id);

                return (
                  <button
                    className={isSelected ? 'is-active' : ''}
                    type="button"
                    key={camera.id}
                    onClick={() => setSearchParams({ camera: camera.id })}
                  >
                    <div className="detail-thumb-video-box">
                      <StreamViewer streamUrl={camera.streamUrl} aiStreamUrl={camera.aiStreamUrl} cameraId={camera.id} />
                    </div>

                    <div className="detail-thumb-info">
                      <strong>{camera.area}</strong>
                      <small>CAM #{camera.id}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="detection-main-Layout">
          <div className="detection-Section">
            <article className="subCard detection-status-card">
              <span className="detail-status-icon success"><CheckCircleRoundedIcon /></span>
              <div><small>카메라 상태</small><strong>정상 연결</strong><p>신호와 녹화 상태가 정상입니다.</p></div>
            </article>
            <article className="subCard detection-status-card">
              <span className="detail-status-icon warning"><WarningAmberRoundedIcon /></span>
              <div><small>오늘 감지</small><strong>3건</strong><p>확인이 필요한 이벤트 1건</p></div>
            </article>
          </div>

          <section className="subCard detail-event-card">
            <div className="detail-section-heading">
              <strong>최근 감지 이벤트</strong>
              <span>14:28</span>
            </div>
            <div className="detail-event-preview">
              <WarningAmberRoundedIcon />
              <div><span>조치 대기</span><strong>적재물 과다 적재 감지</strong></div>
            </div>
            <dl>
              <div><dt><LocationOnOutlinedIcon />위치</dt><dd>{activeCamera.location}</dd></div>
              <div><dt><AccessTimeRoundedIcon />감지 시간</dt><dd>14:28:32</dd></div>
              <div><dt>위험도</dt><dd className="detail-risk-level">주의</dd></div>
            </dl>
            <button type="button" onClick={() => navigate('/checklists/management')}>체크리스트 확인</button>
          </section>
        </aside>
      </div>
      <DetectionAlertDialog alert={activeAlert} queueCount={alertQueue.length} onClose={() => setActiveAlert(null)} onAssign={() => navigate('/checklists/management')} />
    </section>
  )
}

export default MonitoringDetailPage
