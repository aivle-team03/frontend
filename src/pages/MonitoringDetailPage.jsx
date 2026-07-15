import '../styles/monitoringdetail.css'
import { useLocation } from 'react-router-dom'

function MonitoringDetailPage() {

const location = useLocation();
const currentCctv = location.state?.cctvData;
return(
    <>   
    <div className="page-Layout">
        <div className="cctv-main-Layout">
            <div className="subCard">
                <div className="cctv-main-Header">
                    <span className="cctv-main-Live">
                        Live
                    </span>
                    <div className="cctv-main-Info">
                        <span>
                            {currentCctv.section}
                        </span>
                        <span>
                            {currentCctv.floor}
                        </span>
                        <span>
                            {currentCctv.location}
                        </span>
                        <span>
                            {currentCctv.time}
                        </span>
                    </div> 
                </div>
                
            </div>
            <div className="subCard">
                <h1>CCTV</h1>
            </div>
            <div className="subCard">
                <h1>Thumbnail</h1>
            </div>
            
        </div>

        <div className="detection-main-Layout">
            <div className="detection-Section">
                <div className="subCard">
                    <div className="detection-Object">
                        <div className="detection-object-Title"> 
                            탐지 객체
                        </div>
                    </div>
                </div>
                <div className="subCard">
                    <div className="detection-Object">
                        <div className="detection-object-Title"> 
                            이상 항목
                        </div>
                    </div>
                </div>
            </div>
            <div className="subCard">
                <div className="detection-object-info-Section">
                    <div className="detection-Object">
                        <div className="detection-object-Title"> 
                            선택 구격 탐지 정보
                        </div>

                        <div className="detection-object-info-button-Section">
                            <button className="detection-Button detection-Button:hover">
                                조치 요청
                            </button>
                            <button className="detection-Button detection-Button:hover">
                                영상보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
)
}

export default MonitoringDetailPage