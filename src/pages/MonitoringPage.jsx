import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import styles from '../styles/CCTVMonitoring.module.css'

function StreamViewer({ streamUrl, cameraId }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [streamUrl]);

  if (!streamUrl || hasError) {
    return (
      <span className={styles.cameraPlaceholder}>
        <VideocamOutlinedIcon />
        <small>{hasError ? "비디오 에러" : "연결 중..."}</small>
      </span>
    );
  }

  return (
    <video
      key={streamUrl}
      src={streamUrl}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={(e) => {
        console.error(`CAM #${cameraId} 비디오 로드 에러:`, e);
        setHasError(true);
      }}
    />
  );
}

function MonitoringPage() {
  const navigate = useNavigate()

  const [cameras, setCameras] = useState([])
  const [activeCameraId, setActiveCameraId] = useState(null)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCCTVsAndEvents()
  }, [])

  const fetchCCTVsAndEvents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const cctvResponse = await axios.get('http://127.0.0.1:8000/api/cctvs', { headers })
      const dbCctvs = cctvResponse.data

      if (dbCctvs && dbCctvs.length > 0) {
        const formattedCameras = dbCctvs.map((item, index) => ({
          id: item.cctv_id ?? item.camera_id ?? item.id,
          name: item.cctv_name || item.camera_name || `CCTV #${index + 1}`,
          area: item.area || `${index + 1}구역`,
          location: item.location || '위치 미지정',
          status: item.status || '정상',
          streamUrl: item.stream_url || '',
        }))

        setCameras(formattedCameras)
        setActiveCameraId(formattedCameras[0].id)
      }

      try {
        const eventResponse = await axios.get('http://127.0.0.1:8000/api/monitoring/events', { headers })
        const monitoringEvents = eventResponse.data

        if (monitoringEvents && monitoringEvents.length > 0) {
          const formattedEvents = monitoringEvents.map((evt) => {

            const rawTime = evt.detected_at || evt.created_at || evt.time || evt.date
            const formattedTime = rawTime
              ? String(rawTime).replace('T', ' ').substring(0, 16)
              : '-'

            const isCompleted = ['completed', 'resolved', 'approved', '조치 완료'].includes(
              String(evt.status).toLowerCase()
            )

            return {
              id: evt.event_id ?? evt.id,
              eventId: evt.event_id ?? evt.id,
              cctvId: evt.cctv_id,
              time: formattedTime,
              location: evt.cctv?.location || evt.location || (evt.cctv_id ? `CCTV #${evt.cctv_id}` : '위치 미지정'),
              type: evt.event_type || evt.hazard_type || evt.content || '위험 요인 감지',
              status: isCompleted ? '조치 완료' : '조치 필요',
              rawStatus: evt.status,
              manager: evt.manager_name || (evt.manager_id ? `담당자 ${evt.manager_id}` : '미지정'),
              imageUrl: evt.image_url || evt.snapshot_url || '',
            }
          })

          setEvents(formattedEvents)
          setSelectedEvent(formattedEvents[0])
        }
      } catch (evtErr) {
        console.warn('모니터링 이벤트 목록 조회 실패:', evtErr)
      }

    } catch (error) {
      console.error('CCTV 목록 로드 실패:', error)
      alert('CCTV 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const activeCamera = cameras.find((cam) => cam.id === activeCameraId)

  const handleMoveToMonitoringDetail = () => {
    if (activeCameraId) {
      navigate(`/monitoringdetail?camera=${activeCameraId}`)
    }
  }

  if (loading) {
    return <div className={styles.dashboardFrame} style={{ padding: '40px', textAlign: 'center' }}>CCTV 시스템 연결 중...</div>
  }

  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV 모니터링 작업 공간">
      <div className={styles.monitoringOverview}>
        <div>
          <span className={styles.overviewIcon}><SensorsRoundedIcon /></span>
          <div>
            <strong>전체 카메라 정상 연결</strong>
            <p>현장 카메라 {cameras.length}대가 실시간으로 연결되어 있습니다.</p>
          </div>
        </div>
        <div className={styles.overviewStats}>
          <span><i />온라인 <strong>{cameras.filter((cam) => cam.status === '정상' || cam.status === 'running').length}</strong></span>
          <span>점검 필요 <strong>{cameras.filter((cam) => cam.status !== '정상' && cam.status !== 'running').length}</strong></span>
          <small>방금 전 업데이트</small>
        </div>
      </div>

      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <section className={styles.cctvmonitoringSection}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={styles.sectionIcon}><GridViewRoundedIcon /></span>
                <div>
                  <h2 className={styles.title}>실시간 CCTV</h2>
                  <p>카메라를 선택해 현재 화면을 확인하세요.</p>
                </div>
              </div>
              <button className={styles.panelAction} type="button" onClick={handleMoveToMonitoringDetail}>
                <OpenInFullRoundedIcon />선택 화면 크게 보기
              </button>
            </header>

            <div className={styles.videodashBoard}>
              {cameras.map((camera) => {
                const isActive = camera.id === activeCameraId
                return (
                  <button
                    className={`${styles.video}${isActive ? ` ${styles.videoActive}` : ''}`}
                    onClick={() => navigate(`/monitoringdetail?camera=${camera.id}`)}
                    key={camera.id}
                    type="button"
                    aria-label={`${camera.area} ${camera.location} 실시간 영상 열기`}
                  >
                    <span className={styles.cameraTopbar}>
                      <span className={styles.cameraLive}><i />LIVE</span>
                      <span>{camera.id}</span>
                    </span>
                    <StreamViewer streamUrl={camera.streamUrl} cameraId={camera.id} />
                    <span className={styles.cameraFooter}>
                      <span><strong>{camera.area}</strong>{camera.location}</span>
                      {isActive && <em>선택됨</em>}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={styles.videoChange}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div>
                  <h2 className={styles.title}>빠른 전환</h2>
                  <p>썸네일을 눌러 활성 카메라를 변경합니다.</p>
                </div>
              </div>
              <span className={styles.currentCamera}>현재 CAM #{activeCamera?.id}</span>
            </header>
            <div className={styles.videochangedashBoard}>
              {cameras.map((camera) => {
                const isSelected = camera.id === activeCameraId;

                return (
                  <button
                    className={`${styles.videoChangeFrame}${isSelected ? ` ${styles.videoChangeFrameActive}` : ''}`}
                    key={camera.id}
                    type="button"
                    onClick={() => setActiveCameraId(camera.id)}
                    aria-pressed={isSelected}
                  >
                    <div className={styles.miniVideoWrapper}>
                      <StreamViewer streamUrl={camera.streamUrl} cameraId={camera.id} />
                    </div>

                    <div className={styles.videoChangeInfo}>
                      <strong>{camera.area}</strong>
                      <small>CAM #{camera.id}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className={styles.EventSection}>
          <section className={styles.liveEvent}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <span className={`${styles.sectionIcon} ${styles.alertIcon}`}><WarningAmberRoundedIcon /></span>
                <div>
                  <h2 className={styles.title}>실시간 알람</h2>
                  <p>최근 감지된 이상 이벤트입니다.</p>
                </div>
              </div>
              <span className={styles.alertCount}>{events.length}건</span>
            </header>
            <RecentEventsTable
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          </section>

          <section className={styles.emptyBox}>
            <header className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div>
                  <h2 className={styles.title}>이벤트 상세</h2>
                  <p>선택한 알람의 세부 정보입니다.</p>
                </div>
              </div>
            </header>

            {selectedEvent ? (
              <div className={styles.eventDetail}>
                <div className={styles.eventDetailHeadline}>
                  <span className={styles.eventWarningIcon}><WarningAmberRoundedIcon /></span>
                  <div>
                    <span>{selectedEvent.status}</span>
                    <strong>{selectedEvent.type}</strong>
                  </div>
                </div>
                <dl>
                  <div><dt><LocationOnOutlinedIcon />감지 위치</dt><dd>{selectedEvent.location}</dd></div>
                  <div><dt><AccessTimeRoundedIcon />감지 시간</dt><dd>{selectedEvent.time}</dd></div>
                  <div><dt>담당자</dt><dd>{selectedEvent.manager}</dd></div>
                </dl>
                <button type="button" onClick={() => navigate('/actions')}>
                  조치 이력에서 확인 <ArrowForwardRoundedIcon />
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                선택된 이벤트가 없습니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default MonitoringPage