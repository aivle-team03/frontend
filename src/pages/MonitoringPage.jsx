import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import { recentEvents } from '../data/dashboardMock.js'
import styles from '../styles/CCTVMonitoring.module.css'
import { CCTV_INFO_MOCKUP_DATA } from '../mocks/mockData.js'
import { useState } from 'react';

const cameraSlots = [
  { id: 'CAM-01', area: '1구역', location: 'A동 1층 출입구', status: '정상' },
  { id: 'CAM-02', area: '2구역', location: 'A동 2층 작업장', status: '정상' },
  { id: 'CAM-03', area: '3구역', location: 'B동 자재 보관소', status: '정상' },
  { id: 'CAM-04', area: '4구역', location: 'B동 지하 주차장', status: '정상' },
]


function MonitoringPage() {
  const navigate = useNavigate()
  const [activeCameraId, setActiveCameraId] = useState(cameraSlots[0].id)
  const [selectedEvent, setSelectedEvent] = useState(recentEvents[0])
  const activeCamera = cameraSlots.find((camera) => camera.id === activeCameraId)

  const handleMoveToMonitoringDetail = () => {
    navigate(`/monitoringdetail?camera=${activeCameraId}`)
  }

  const DecreasePage = () => {
  setPage(prev => (prev > 0 ? prev - 1 : prev));
};

  const cctvList = CCTV_INFO_MOCKUP_DATA ? CCTV_INFO_MOCKUP_DATA.slice(page*4, 4*page+4):[];


  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV 모니터링 작업 공간">
      <div className={styles.monitoringOverview}>
        <div>
          <span className={styles.overviewIcon}><SensorsRoundedIcon /></span>
          <div>
            <strong>전체 카메라 정상 연결</strong>
            <p>현장 카메라 4대가 실시간으로 연결되어 있습니다.</p>
          </div>
        </div>
        <div className={styles.overviewStats}>
          <span><i />온라인 <strong>4</strong></span>
          <span>점검 필요 <strong>0</strong></span>
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
              {cameraSlots.map((camera) => {
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
                    <span className={styles.cameraPlaceholder}>
                      <VideocamOutlinedIcon />
                      <small>실시간 영상 연결됨</small>
                    </span>
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
              <span className={styles.currentCamera}>현재 {activeCamera?.id}</span>
            </header>
            <div className={styles.videochangedashBoard}>
              {cameraSlots.map((camera) => (
                <button
                  className={`${styles.videoChangeFrame}${camera.id === activeCameraId ? ` ${styles.videoChangeFrameActive}` : ''}`}
                  key={camera.id}
                  type="button"
                  onClick={() => setActiveCameraId(camera.id)}
                  aria-pressed={camera.id === activeCameraId}
                >
                  <VideocamOutlinedIcon />
                  <span><strong>{camera.area}</strong><small>{camera.id}</small></span>
                </button>
              ))}
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
              <span className={styles.alertCount}>{recentEvents.length}건</span>
            </header>
            <RecentEventsTable
              events={recentEvents}
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

            {selectedEvent && (
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
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default MonitoringPage
