import { userData, safetyReports, notifications } from "../data/myPageData";
import Header from "../components/layout/Header";
import "../styles/MyPage.css";

function MyPage(){
    return (
        <div className="my-page-container">
            <div className="my-info">
                내 정보
            </div>
            <div className="my-section">
                담당구역
            </div>
            <div className="alert-setting">
                알림 설정
            </div>
            <div className="my-info-change">
                내 정보 변경
            </div>
            <div className="recent-work-logs">
                최근 작업 로그
            </div>
        </div>
    )
}

export default MyPage