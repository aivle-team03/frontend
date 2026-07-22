import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { useState } from 'react'
import { EDUCATION_MOCK_DATA } from '../mocks/mockData.js'

const completionSummary = [
  { label: '필수 교육', value: 76, detail: '19 / 25' }, { label: '정기 교육', value: 58, detail: '7 / 12' },
  { label: '특별 교육', value: 100, detail: '3 / 3' }, { label: '전체', value: 72, detail: '29 / 40' },
]
const progressByContent = { 'forklift-basics': 86, 'fire-response': 35, 'conveyor-safety': 0, 'ppe-basics': 100, 'chemical-safety': 62, 'work-at-height': 72, 'electrical-safety': 48 }

function EducationPage() {
  const { content, requiredCourses } = EDUCATION_MOCK_DATA
  const [contentIndex, setContentIndex] = useState(0)
  const [requiredPage, setRequiredPage] = useState(0)
  const currentContent = content[contentIndex]
  const currentProgress = progressByContent[currentContent.id] ?? 0
  const visibleCourses = requiredCourses.slice(requiredPage * 5, (requiredPage + 1) * 5)
  const pageCount = Math.ceil(requiredCourses.length / 5)
  const selectCourse = (course) => { const index = content.findIndex((item) => item.id === course.contentId); if (index !== -1) setContentIndex(index) }

  return <section className="education-page learner-education-page">
    <div className="education-summary rich-summary">
      <SummaryCard icon={<MenuBookOutlinedIcon />} tone="blue" label="이번 주 마감" value="2건" description="마감 전 교육을 확인하세요" />
      <SummaryCard icon={<PlayCircleOutlineRoundedIcon />} tone="green" label="진행 중" value="3건" description="수강 중인 교육이 있습니다" />
      <SummaryCard icon={<CheckCircleOutlineRoundedIcon />} tone="purple" label="이수 완료" value="18건" description="완료한 교육을 확인하세요" />
    </div>

    <div className="education-top-grid learner-grid">
      <article className="education-panel content-panel course-player-panel">
        <div className="panel-heading panel-heading-row"><div><span className="panel-kicker">교육 동영상</span><h3>{currentContent.title}</h3></div><span className="content-category">{currentProgress >= 80 ? '이수 가능' : '수강 중'}</span></div>
        <div className="content-preview" aria-label="교육 콘텐츠 미리보기"><div className="preview-badge"><MenuBookOutlinedIcon /> 교육 자료</div><div className="preview-center"><SchoolOutlinedIcon /><strong>{currentContent.title}</strong><span>교육 콘텐츠 준비 중</span></div><div className="preview-time">재생 시간 {currentContent.duration}</div></div>
        <div className="course-progress"><span>진행률 {currentProgress}%</span><div><i style={{ width: `${currentProgress}%` }} /></div><strong>{currentProgress}%</strong></div><p className="course-progress-caption">80% 이상 시 이수 완료 처리가 가능합니다.</p>
        <div className="content-navigation"><button type="button" disabled={contentIndex === 0} onClick={() => setContentIndex((value) => value - 1)}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /> 이전 강의</button><button type="button" disabled={currentProgress < 80}><CheckCircleOutlineRoundedIcon fontSize="inherit" /> 이수 완료</button></div>
      </article>

      <article className="education-panel required-panel learner-list-panel"><div className="panel-heading"><span className="panel-kicker">나의 수강 현황</span><h3>내 교육 리스트</h3></div><div className="required-table-wrap"><table className="required-table learner-table"><thead><tr><th>교육명</th><th>구분</th><th>마감일</th><th>진도율</th><th>상태</th></tr></thead><tbody>{visibleCourses.map((course, index) => { const progress = progressByContent[course.contentId] ?? [86, 35, 100, 0, 62][index]; return <tr className={currentContent.id === course.contentId ? 'is-selected' : ''} key={course.id} onClick={() => selectCourse(course)} onKeyDown={(event) => event.key === 'Enter' && selectCourse(course)} role="button" tabIndex="0"><td>{course.title}</td><td><span className="course-type">{index < 3 ? '필수' : '정기'}</span></td><td>{course.deadline}</td><td><span className="table-progress"><b>{progress}%</b><i><em style={{ width: `${progress}%` }} /></i></span></td><td><span className={`education-status status-${course.id}`}>{course.status}</span></td></tr> })}</tbody></table></div><div className="required-footer"><span>총 {requiredCourses.length}개 과정</span><div className="required-pagination"><button type="button" aria-label="이전 교육 목록" disabled={requiredPage === 0} onClick={() => setRequiredPage((value) => value - 1)}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /></button><span>{requiredPage + 1} / {pageCount}</span><button type="button" aria-label="다음 교육 목록" disabled={requiredPage === pageCount - 1} onClick={() => setRequiredPage((value) => value + 1)}><ArrowForwardIosOutlinedIcon fontSize="inherit" /></button></div></div></article>
    </div>

    <div className="learner-bottom-grid"><article className="education-panel learner-completion-panel"><div className="panel-heading"><span className="panel-kicker">나의 학습 현황</span><h3>교육 이수 현황</h3></div><div className="learner-rings">{completionSummary.map((item) => <CompletionRing key={item.label} {...item} />)}</div></article><article className="education-panel learning-guide-card"><div className="guide-copy"><span className="panel-kicker">학습 안내</span><h3><MenuBookOutlinedIcon /> 수강 전 확인하세요</h3><ul><li>영상 80% 이상 시 이수 완료 버튼이 활성화됩니다.</li><li>필수 교육은 마감일 전까지 반드시 수강해야 합니다.</li><li>재생 중 브라우저를 종료해도 진도율이 저장됩니다.</li></ul></div><div className="guide-illustration"><MenuBookOutlinedIcon /><CheckCircleOutlineRoundedIcon /></div></article></div>
  </section>
}

function SummaryCard({ icon, tone, label, value, description }) { return <article className="summary-card"><span className={`summary-icon summary-icon-${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{description}</p></div><ArrowForwardIosOutlinedIcon /></article> }
function CompletionRing({ label, value, detail }) { return <div className="completion-ring-item"><div className="completion-ring" style={{ '--completion-rate': `${value}%` }}><strong>{value}%</strong></div><strong>{label}</strong><span>{detail}</span></div> }
export default EducationPage
