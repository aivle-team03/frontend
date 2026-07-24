import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { EDUCATION_MOCK_DATA } from '../mocks/mockData.js'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'

const API_BASE_URL = 'http://127.0.0.1:8000'

const completionSummary = [
  { label: '필수 교육', value: 76, detail: '19 / 25' },
  { label: '정기 교육', value: 58, detail: '7 / 12' },
  { label: '특별 교육', value: 100, detail: '3 / 3' },
  { label: '전체', value: 72, detail: '29 / 40' },
]
const completionRingColors = ['#4f78d1', '#2f9d75', '#8b63d6', '#e18a3f']
const progressByContent = { 'forklift-basics': 86, 'fire-response': 35, 'conveyor-safety': 0, 'ppe-basics': 100, 'chemical-safety': 62, 'work-at-height': 72, 'electrical-safety': 48 }

function EducationPage({ addedCourses = [] }) {
  const { content, requiredCourses } = EDUCATION_MOCK_DATA
  const [apiCourses, setApiCourses] = useState(null)
  const [apiSummary, setApiSummary] = useState(null)
  const [apiRates, setApiRates] = useState(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const fetchEducationData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const [summaryResponse, statusResponse, ratesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/education/summary`, { headers }),
      axios.get(`${API_BASE_URL}/api/education/status`, { headers }),
      axios.get(`${API_BASE_URL}/api/education/completion-rates`, { headers }),
    ])
    setApiSummary(summaryResponse.data)
    setApiCourses(Array.isArray(statusResponse.data) ? statusResponse.data : [])
    setApiRates(ratesResponse.data)
  }

  useEffect(() => {
    fetchEducationData().catch((error) => {
      console.error('교육 데이터 조회 실패:', error)
    })
  }, [])

  const apiCourseItems = useMemo(() => (apiCourses ?? []).map((course) => ({
    id: `api-${course.education_id}`,
    contentId: `api-content-${course.education_id}`,
    educationId: course.education_id,
    title: course.title,
    target: course.role,
    deadline: course.due_date ?? '-',
    status: course.status,
    category: course.category,
    duration: course.type ?? '교육 영상',
    videoUrl: course.video_url,
    isApiCourse: true,
  })), [apiCourses])
  const customContent = useMemo(() => addedCourses.map((course) => ({
    id: course.contentId,
    title: course.title,
    category: course.category,
    duration: course.duration,
    videoUrl: course.videoUrl,
  })), [addedCourses])
  const baseCourses = apiCourseItems.length ? apiCourseItems : requiredCourses
  const baseContent = apiCourseItems.length
    ? apiCourseItems.map((course) => ({
      id: course.contentId,
      title: course.title,
      category: course.category,
      duration: course.duration,
      videoUrl: course.videoUrl,
      educationId: course.educationId,
      status: course.status,
      isApiCourse: true,
    }))
    : content
  const allContent = [...customContent, ...baseContent]
  const allCourses = [...addedCourses, ...baseCourses]
  const [contentId, setContentId] = useState(allContent[0]?.id)
  const [requiredPage, setRequiredPage] = useState(0)
  const [summaryModal, setSummaryModal] = useState(null)
  const currentContent = allContent.find((item) => item.id === contentId) ?? allContent[0]
  const currentYouTubeEmbedUrl = getYouTubeEmbedUrl(currentContent?.videoUrl)
  const getCourseProgress = (course) => {
    if (course?.isApiCourse) {
      if (course.status === '이수') return 100
      if (course.status === '진행중') return 40
      return 0
    }
    return progressByContent[course?.contentId ?? course?.id] ?? 0
  }
  const currentProgress = getCourseProgress(currentContent)
  const currentCourseIndex = allCourses.findIndex((course) => course.contentId === currentContent.id)
  const visibleCourses = allCourses.slice(requiredPage * 5, (requiredPage + 1) * 5)
  const pageCount = Math.max(1, Math.ceil(allCourses.length / 5))
  const dueCourses = allCourses.filter((course) => ['오늘', '내일', '이번 주'].includes(course.deadline) && course.status !== '완료')
  const inProgressCourses = allCourses.filter((course) => {
    const progress = getCourseProgress(course)
    return progress > 0 && progress < 100 && course.status !== '완료'
  })
  const completedCourses = allCourses.filter((course) => getCourseProgress(course) >= 100 || course.status === '완료')
  const summaryCards = [
    { key: 'due', icon: <MenuBookOutlinedIcon />, tone: 'blue', label: '이번 주 마감', value: `${apiSummary?.due_this_week_count ?? dueCourses.length}건`, description: '마감 전 교육을 확인하세요', courses: dueCourses },
    { key: 'progress', icon: <PlayCircleOutlineRoundedIcon />, tone: 'green', label: '진행 중', value: `${apiSummary?.in_progress_count ?? inProgressCourses.length}건`, description: '수강 중인 교육이 있습니다', courses: inProgressCourses },
    { key: 'complete', icon: <CheckCircleOutlineRoundedIcon />, tone: 'purple', label: '이수 완료', value: `${apiSummary?.completed_count ?? completedCourses.length}건`, description: '완료한 교육을 확인하세요', courses: completedCourses },
  ]
  const completionSummaryData = apiRates
    ? [
      { label: '필수 교육', value: apiRates.essential_rate ?? 0, detail: '서버 집계' },
      { label: '정기 교육', value: apiRates.regular_rate ?? 0, detail: '서버 집계' },
      { label: '전체', value: apiRates.total_rate ?? 0, detail: '서버 집계' },
    ]
    : completionSummary

  const completeCurrentCourse = async () => {
    const currentCourse = allCourses.find((course) => course.contentId === currentContent.id)
    if (!currentCourse?.educationId) return

    try {
      setIsCompleting(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await axios.post(`${API_BASE_URL}/api/education/${currentCourse.educationId}/complete`, {}, { headers })
      await fetchEducationData()
    } catch (error) {
      console.error('교육 이수 처리 실패:', error)
      alert(`교육 이수 처리에 실패했습니다. ${error.response?.data?.detail ?? ''}`)
    } finally {
      setIsCompleting(false)
    }
  }
  const showPreviousCourse = () => {
    if (currentCourseIndex <= 0) return
    const previousIndex = currentCourseIndex - 1
    setContentId(allCourses[previousIndex].contentId)
    setRequiredPage(Math.floor(previousIndex / 5))
  }

  return <section className="education-page learner-education-page">
    {addedCourses.length > 0 && <div className="learner-new-course-banner"><span><PlayCircleOutlineRoundedIcon /><strong>새 교육이 배정되었습니다.</strong> 교육 관리에서 등록한 {addedCourses[0].title}을 확인해 보세요.</span><button type="button" onClick={() => setContentId(addedCourses[0].contentId)}>지금 보기</button></div>}

    <div className="education-summary rich-summary">
      {summaryCards.map((card) => <SummaryCard key={card.key} {...card} onClick={() => setSummaryModal(card)} />)}
    </div>

    <div className="education-top-grid learner-grid">
      <article className="education-panel content-panel course-player-panel">
        <div className="panel-heading panel-heading-row"><div><span className="panel-kicker">교육 영상</span><h3>{currentContent.title}</h3></div><span className="content-category">{currentContent.category ?? '안전 교육'}</span></div>
        {currentContent.videoUrl ? (
          <div className="uploaded-video-player">
            {currentYouTubeEmbedUrl ? (
              <iframe src={currentYouTubeEmbedUrl} title={`${currentContent.title} 교육 영상`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : (
              <video src={resolveMediaUrl(currentContent.videoUrl)} controls preload="metadata" aria-label={`${currentContent.title} 교육 영상`} />
            )}
          </div>
        ) : (
          <div className="course-video" aria-label="교육 영상 미리보기">
            <div className="course-video-glow" />
            <div className="video-topline"><span><PlayCircleOutlineRoundedIcon /> 교육 영상</span></div>
            <div className="video-preview-center">
              <span className="video-play"><PlayArrowRoundedIcon /></span>
              <strong>{currentContent.title}</strong>
              <small>재생 버튼을 눌러 교육을 시작하세요</small>
            </div>
            <div className="video-bottom"><span>재생 시간 {currentContent.duration}</span></div>
          </div>
        )}
        <div className="course-progress"><span>진행률</span><div><i style={{ width: `${currentProgress}%` }} /></div><strong>{currentProgress}%</strong></div>
        <p className="course-progress-caption">영상의 80% 이상을 수강하면 이수 완료할 수 있습니다.</p>
        <div className="content-navigation"><button type="button" disabled={currentCourseIndex <= 0} onClick={showPreviousCourse}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /> 이전 강의</button><button type="button" disabled={currentProgress < 80 || !currentContent.educationId || isCompleting || currentContent.status === '이수'} onClick={completeCurrentCourse}><CheckCircleOutlineRoundedIcon fontSize="inherit" /> {isCompleting ? '처리 중...' : currentContent.status === '이수' ? '이수 완료됨' : '이수 완료'}</button></div>
      </article>

      <article className="education-panel required-panel learner-list-panel">
        <div className="panel-heading"><span className="panel-kicker">나의 수강 현황</span><h3>내 교육 리스트</h3></div>
        <div className="required-table-wrap"><table className="required-table learner-table"><thead><tr><th>교육명</th><th>구분</th><th>마감일</th><th>진도율</th><th>상태</th></tr></thead><tbody>{visibleCourses.map((course, index) => {
          const progress = getCourseProgress(course)
          return <tr className={currentContent.id === course.contentId ? 'is-selected' : ''} key={course.id} onClick={() => setContentId(course.contentId)} onKeyDown={(event) => event.key === 'Enter' && setContentId(course.contentId)} role="button" tabIndex="0"><td>{course.title}{course.isCustom && <span className="new-course-dot">NEW</span>}</td><td><span className="course-type">{course.isCustom ? '신규' : index < 3 ? '필수' : '정기'}</span></td><td>{course.deadline}</td><td><span className="table-progress"><b>{progress}%</b><i><em style={{ width: `${progress}%` }} /></i></span></td><td><span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>{course.status}</span></td></tr>
        })}</tbody></table></div>
        <div className="required-footer"><span>총 {allCourses.length}개 과정</span><div className="required-pagination"><button type="button" aria-label="이전 교육 목록" disabled={requiredPage === 0} onClick={() => setRequiredPage((value) => value - 1)}><ArrowBackIosNewOutlinedIcon fontSize="inherit" /></button><span>{requiredPage + 1} / {pageCount}</span><button type="button" aria-label="다음 교육 목록" disabled={requiredPage === pageCount - 1} onClick={() => setRequiredPage((value) => value + 1)}><ArrowForwardIosOutlinedIcon fontSize="inherit" /></button></div></div>
      </article>
    </div>

    <div className="learner-bottom-grid">
      <article className="education-panel learner-completion-panel"><div className="panel-heading"><span className="panel-kicker">나의 학습 현황</span><h3>교육 이수 현황</h3></div><div className="learner-rings">{completionSummaryData.map((item, index) => <CompletionRing key={item.label} {...item} toneIndex={index} />)}</div></article>
      <article className="education-panel learning-guide-card"><div className="guide-copy"><span className="panel-kicker">학습 안내</span><h3><SchoolOutlinedIcon /> 수강 전 확인하세요</h3><ul><li>영상의 80% 이상을 시청하면 이수 완료 버튼이 활성화됩니다.</li><li>필수 교육은 마감일까지 반드시 수강해야 합니다.</li><li>재생 중 페이지를 벗어나도 진도율이 저장됩니다.</li></ul></div><div className="guide-illustration"><MenuBookOutlinedIcon /><CheckCircleOutlineRoundedIcon /></div></article>
    </div>
    {summaryModal && <LearningSummaryModal summary={summaryModal} getProgress={getCourseProgress} onClose={() => setSummaryModal(null)} />}
  </section>
}

function SummaryCard({ icon, tone, label, value, description, onClick }) { return <article className="summary-card" role="button" tabIndex="0" onClick={onClick} onKeyDown={(event) => event.key === 'Enter' && onClick()}><span className={`summary-icon summary-icon-${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{description}</p></div><ArrowForwardIosOutlinedIcon /></article> }
function LearningSummaryModal({ summary, getProgress, onClose }) { return <div className="learning-summary-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="learning-summary-modal" role="dialog" aria-modal="true" aria-label={`${summary.label} 교육 목록`} onMouseDown={(event) => event.stopPropagation()}><header><div><span>내 교육 현황</span><h3>{summary.label}</h3><p>{summary.description}</p></div><button type="button" aria-label="교육 목록 창 닫기" onClick={onClose}><CloseRoundedIcon /></button></header><div className="learning-summary-modal-count"><strong>{summary.value}</strong><span>현재 내 교육 리스트 기준</span></div><div className="learning-summary-course-list">{summary.courses.length ? summary.courses.map((course) => { const progress = getProgress(course); return <div key={course.id} className="learning-summary-course-row"><div><strong>{course.title}</strong><span>{course.target} · 마감 {course.deadline}</span></div><div><b>{progress}%</b><i><em style={{ width: `${progress}%` }} /></i></div><span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>{course.status}</span></div> }) : <p className="learning-summary-empty">해당하는 교육이 없습니다.</p>}</div></section></div> }
function CompletionRing({ label, value, detail, toneIndex }) { return <div className="completion-ring-item" style={{ '--ring-color': completionRingColors[toneIndex], '--ring-delay': `${toneIndex * 110}ms` }}><div className="completion-ring" style={{ '--completion-rate': `${value}%` }}><strong>{value}%</strong></div><strong>{label}</strong><span>{detail}</span></div> }
export default EducationPage
