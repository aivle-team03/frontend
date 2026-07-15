import { userData, workLogs, notifications } from "../data/myPageData";
import Header from "../components/layout/Header";
import "../styles/MyPage.css";

function MyPage() {
    const { userId, name, email, role, area} = userData;
    const {id, message, time} = notifications[0];
    const myLogs = workLogs.filter(
        (log) => log.userId === userData.userId
    );
    return (
    <section className="my-page-container" aria-label="마이페이지">
      <article className="my-page-card my-info">
        <span className="my-page-label">{role}</span>
        <h2>{name}</h2>
        <p>{email}</p>
      </article>

      <article className="my-page-card my-section">
        <span className="my-page-label">담당구역</span>
        <strong>{area}</strong>
      </article>

      <article className="my-page-card alert-setting">
        <span className="my-page-label">알림 설정</span>
        <p>{message}</p>
      </article>

      <article className="my-page-card my-info-change">
        <span className="my-page-label">내 정보 변경</span>
        <p>계정 정보 수정 기능은 준비 중입니다.</p>
      </article>

      <article className="my-page-card recent-work-logs">
        <span className="my-page-label">최근 작업 로그</span>

        {myLogs.map((log) => (
            <div key={log.id}>
                <strong>{log.action}</strong>
                <p>{log.detail}</p>
                <small>{log.time}</small>
                </div>
            ))}
            </article>
    </section>
  )
}

export default MyPage
