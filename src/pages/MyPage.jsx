import { MY_PAGE_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/MyPage.css'

function MyPage() {
  const { user, workLogs, notifications } = MY_PAGE_MOCK_DATA
  const myLogs = workLogs.filter((log) => log.userId === user.userId)
  const notification = notifications[0]

  return (
    <section className="my-page-container" aria-label="마이페이지">
      <article className="my-page-card my-info">
        <span className="my-page-label">{user.role}</span>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </article>

      <article className="my-page-card my-section">
        <span className="my-page-label">담당구역</span>
        <strong>{user.area}</strong>
      </article>

      <article className="my-page-card alert-setting">
        <span className="my-page-label">알림 설정</span>
        <p>{notification.message}</p>
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
