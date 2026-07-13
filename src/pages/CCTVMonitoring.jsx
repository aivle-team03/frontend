
import CCTVpage from '../styles/CCTVMonitoring.module.css'
function CCTVMonitoring() {
return (
    <section className="dashboard-frame" aria-label="BOSS dashboard workspace">
        <div className={CCTVpage.cctvemptyarea}>
            
            <div className={CCTVpage.cctvSection}>
                <div className={CCTVpage.cctvmonitoringSection}>
                    <h2 className={CCTVpage.title}>실시간 CCTV 모니터링</h2>
                    <div className={CCTVpage.videodashBoard}>
                        <div className={CCTVpage.video}>1</div>
                        <div className={CCTVpage.video}>2</div>
                        <div className={CCTVpage.video}>3</div>
                        <div className={CCTVpage.video}>4</div>
                    </div>
                </div>

                <div className={CCTVpage.videoChange}>
                    <h2 className={CCTVpage.title}>빠른 전환</h2>
                    <div className={CCTVpage.videochangedashBoard}>
                        <div className={CCTVpage.videoChangeFrame}>1</div>
                        <div className={CCTVpage.videoChangeFrame}>2</div>
                        <div className={CCTVpage.videoChangeFrame}>3</div>
                        <div className={CCTVpage.videoChangeFrame}>4</div>
                    </div>
                </div>
            </div>
            

            <div className={CCTVpage.EventSection}>
                <div className={CCTVpage.liveEvent}>
                    <h2 className={CCTVpage.title}>실시간 알람</h2>
                </div>

                <div className={CCTVpage.emptyBox}>
                </div>
            </div>


        </div>



    </section>
)
}

export default CCTVMonitoring
