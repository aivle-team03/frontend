import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { recentEvents } from '../data/dashboardMock.js'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import styles from '../styles/CCTVMonitoring.module.css'

const cameraSlots = ['1', '2', '3', '4']

function MonitoringPage() {
  const navigate = useNavigate()

  const [cctvList, setCctvList] = useState([])

  useEffect(() => {
    const fetchCctvData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://127.0.0.1:8000/api/cctvs", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setCctvList(response.data);
      } catch (error) {
        console.error("CCTV 데이터를 불러오지 못했습니다:", error);
      }
    };

    fetchCctvData();
  }, []);

  const handleMoveToMonitoringDetail = () => {
    navigate('/monitoringdetail')
  }
  return (

    <section className={styles.dashboardFrame} aria-label="BOSS CCTV monitoring workspace">
      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <div className={styles.cctvmonitoringSection}>
            <h2 className={styles.title}>실시간 CCTV 모니터링</h2>
            <div className={styles.videodashBoard}>
              {cameraSlots.map((slotNum) => {
                const matchingCamera = cctvList.find(cctv => Number(cctv.camera_id) === Number(slotNum));
                const videoSource = (matchingCamera && matchingCamera.stream_url) ? matchingCamera.stream_url : null;

                return (
                  <button
                    className={styles.video}
                    onClick={handleMoveToMonitoringDetail}
                    key={slotNum}
                    type="button"
                  >
                    {videoSource ? (
                      <video
                        src={videoSource}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '14px', width: '100%' }}>
                        NO SIGNAL
                      </div>
                    )}

                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      zIndex: 20,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      pointerEvents: 'none'
                    }}>
                      {matchingCamera ? `🔴 CAM - ${slotNum} (${matchingCamera.camera_name})` : `⚪ CAM - ${slotNum} (연결 끊김)`}
                    </div>
                  </button>
                )
              })}
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
