import { userData, safetyReports, notifications } from "../data/myPageData";
import Header from "../components/layout/Header";
import "../styles/MyPage.css";

function MyPage() {
  return (
    <section className="my-page-container" aria-label="마이페이지">
      <article className="my-page-card my-info">
        <span className="my-page-label">내 정보</span>
        <h2>관리자</h2>
        <p>산업안전 관리 플랫폼 운영 계정</p>
      </article>

      <article className="my-page-card my-section">
        <span className="my-page-label">담당구역</span>
        <strong>전체 구역</strong>
      </article>

      <article className="my-page-card alert-setting">
        <span className="my-page-label">알림 설정</span>
        <p>위험 감지 및 조치 상태 알림 설정 영역입니다.</p>
      </article>

      <article className="my-page-card my-info-change">
        <span className="my-page-label">내 정보 변경</span>
        <p>계정 정보 수정 기능은 준비 중입니다.</p>
      </article>

      <article className="my-page-card recent-work-logs">
        <span className="my-page-label">최근 작업 로그</span>
        <p>최근 작업 이력은 추후 연동 예정입니다.</p>
      </article>
    </section>
  )
}

export default MyPage
