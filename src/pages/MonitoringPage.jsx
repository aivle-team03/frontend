import { useNavigate } from 'react-router-dom'
import { recentEvents } from '../data/dashboardMock.js'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import styles from '../styles/CCTVMonitoring.module.css'
import { CCTV_INFO_MOCKUP_DATA } from '../mocks/mockData.js'

const cameraSlots = ['1', '2', '3', '4']

function MonitoringPage() {
  const navigate = useNavigate();

  const handleMoveToMonitoringDetail = (cctv) => {
    navigate('/monitoringdetail',{state : {cctvData:cctv}})
  }
  const cctvList = CCTV_INFO_MOCKUP_DATA ? CCTV_INFO_MOCKUP_DATA.slice(0, 4):[];


  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV monitoring workspace">
      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <div className={styles.cctvmonitoringSection}>
            <h2 className={styles.title}>실시간 CCTV 모니터링</h2>
            <div className={styles.videodashBoard}>
                {cctvList.map((cctv) => (
                <button 
                    className={styles.video} 
                    onClick={() => handleMoveToMonitoringDetail(cctv)}
                    key={cctv.id} 
                    type="button"
                >
                  <div className={styles.cctvHeaderBadge}>
                    <span className={styles.cctvLocationText}>
                      {cctv.section} {cctv.location} {cctv.floor}
                    </span>
                    <span className={styles.liveBadge}>
                      LIVE
                    </span>
                  </div>
                </button>
              ))}
              
            </div>
          </div>

          <div className={styles.videoChange}>
            <h2 className={styles.title}>빠른 전환</h2>
            <div className={styles.videochangedashBoard}>
              {cameraSlots.map((slot) => (
                <button className={styles.videoChangeFrame} key={slot} type="button">
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.EventSection}>
          <div className={styles.liveEvent}>
            <h2 className={styles.title}>실시간 알람</h2>
            <RecentEventsTable events={recentEvents} />
          </div>

          <div className={styles.emptyBox}>
            <h2 className={styles.title}>이벤트 상세</h2>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MonitoringPage
