import styles from '../styles/CCTVMonitoring.module.css'

const cameraSlots = ['1', '2', '3', '4']

function MonitoringPage() {

  return (
    <section className={styles.dashboardFrame} aria-label="BOSS CCTV monitoring workspace">
      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <div className={styles.cctvmonitoringSection}>
            <h2 className={styles.title}>실시간 CCTV 모니터링</h2>
            <div className={styles.videodashBoard}>
              {cameraSlots.map((slot) => (
                <div className={styles.video} key={slot}>
                  {slot}
                </div>
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
              <div className={styles.blankAreaBlank} />
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
