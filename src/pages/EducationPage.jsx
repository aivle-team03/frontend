import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getYouTubeEmbedUrl, resolveMediaUrl } from '../utils/mediaUrl.js'

const API_BASE_URL = 'http://127.0.0.1:8000'
const completionRingColors = ['#4f78d1', '#2f9d75', '#8b63d6', '#e18a3f']

function EducationPage({ addedCourses = [] }) {
  const [apiCourses, setApiCourses] = useState(null)
  const [apiSummary, setApiSummary] = useState(null)
  const [apiRates, setApiRates] = useState(null)
  const [loading, setLoading] = useState(true)

  const videoRef = useRef(null)
  const lastProgressSentRef = useRef(0)
  const lastTimeSentRef = useRef(0)
  const isAutoCompletingRef = useRef(false)
  const lastWatchedTimeRef = useRef(0)

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
    fetchEducationData()
      .catch((error) => console.error('교육 데이터 조회 실패:', error))
      .finally(() => setLoading(false))
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
    progressPercent: course.progress_percent ?? (course.status === '이수' ? 100 : 0),
    lastPositionSeconds: course.last_position_seconds ?? 0,
    isApiCourse: true,
  })), [apiCourses])

  const customContent = useMemo(() => addedCourses.map((course) => ({
    id: course.contentId ?? `custom-${course.title}`,
    contentId: course.contentId ?? `custom-${course.title}`,
    title: course.title,
    category: course.category,
    duration: course.duration,
    videoUrl: course.videoUrl,
    progressPercent: 0,
    lastPositionSeconds: 0,
  })), [addedCourses])

  const baseContent = apiCourseItems.map((course) => ({
    id: course.contentId,
    contentId: course.contentId,
    title: course.title,
    category: course.category,
    duration: course.duration,
    videoUrl: course.videoUrl,
    educationId: course.educationId,
    status: course.status,
    progressPercent: course.progressPercent,
    lastPositionSeconds: course.lastPositionSeconds,
    isApiCourse: true,
  }))

  const allContent = useMemo(() => [...customContent, ...baseContent], [customContent, baseContent])
  const allCourses = useMemo(() => [...addedCourses, ...apiCourseItems], [addedCourses, apiCourseItems])

  const [contentId, setContentId] = useState(allContent[0]?.id)
  const [requiredPage, setRequiredPage] = useState(0)
  const [summaryModal, setSummaryModal] = useState(null)

  const currentContent = allContent.find((item) => item.id === contentId) ?? allContent[0] ?? {}
  const currentYouTubeEmbedUrl = getYouTubeEmbedUrl(currentContent?.videoUrl)

  const getCourseProgress = (course) => {
    if (course?.status === '이수') return 100
    if (typeof course?.progressPercent === 'number') {
      return Math.min(100, Math.round(course.progressPercent))
    }
    return 0
  }

  const currentProgress = getCourseProgress(currentContent)
  const currentContentIndex = allContent.findIndex((item) => item.id === currentContent.id)

  const visibleCourses = allCourses.slice(requiredPage * 5, (requiredPage + 1) * 5)
  const pageCount = Math.max(1, Math.ceil(allCourses.length / 5))

  const dueCourses = allCourses.filter((course) => ['오늘', '내일', '이번 주'].includes(course.deadline) && course.status !== '이수')
  const inProgressCourses = allCourses.filter((course) => {
    const progress = getCourseProgress(course)
    return progress > 0 && progress < 100 && course.status !== '이수'
  })
  const completedCourses = allCourses.filter((course) => getCourseProgress(course) >= 100 || course.status === '이수')

  // 비디오 로드 시 시작 위치 설정
  const handleLoadedMetadata = () => {
    isAutoCompletingRef.current = false
    if (videoRef.current && currentContent.lastPositionSeconds > 0) {
      const startPos = currentContent.lastPositionSeconds
      videoRef.current.currentTime = startPos
      lastWatchedTimeRef.current = startPos
    } else {
      lastWatchedTimeRef.current = 0
    }
  }

  // 타임라인 건너뛰기 방지
  const handleSeeking = () => {
    if (!videoRef.current) return
    if (videoRef.current.currentTime > lastWatchedTimeRef.current + 1.5) {
      videoRef.current.currentTime = lastWatchedTimeRef.current
    }
  }

  // 비디오 재생 중 실시간 처리 및 80% 자동 이수
  const handleTimeUpdate = async () => {
    if (!videoRef.current || !currentContent.educationId) return

    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration

    if (!duration || duration <= 0) return

    if (currentTime > lastWatchedTimeRef.current + 1.5) {
      videoRef.current.currentTime = lastWatchedTimeRef.current
      return
    } else {
      lastWatchedTimeRef.current = Math.max(lastWatchedTimeRef.current, currentTime)
    }

    const calculatedProgress = Math.min(100, Math.round((currentTime / duration) * 100))

    // 실시간 UI 진행도 반영
    setApiCourses((prevCourses) =>
      (prevCourses ?? []).map((course) => {
        if (course.education_id === currentContent.educationId) {
          const isCompleted = course.status === '이수' || calculatedProgress >= 80
          return {
            ...course,
            progress_percent: calculatedProgress,
            last_position_seconds: Math.floor(currentTime),
            status: isCompleted ? '이수' : '진행중',
          }
        }
        return course
      })
    )

    // 80% 이상 시 자동 이수 완료 처리
    if (calculatedProgress >= 80 && currentContent.status !== '이수' && !isAutoCompletingRef.current) {
      isAutoCompletingRef.current = true
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        await axios.post(`${API_BASE_URL}/api/education/${currentContent.educationId}/complete`, {}, { headers })
        await fetchEducationData()
      } catch (error) {
        console.error('자동 이수 처리 실패:', error)
        isAutoCompletingRef.current = false
      }
    }

    // 백엔드 DB 주기적 진척도 저장 (3초 간격)
    const now = Date.now()
    if (now - lastTimeSentRef.current < 3000 && Math.abs(calculatedProgress - lastProgressSentRef.current) < 1) {
      return
    }

    lastTimeSentRef.current = now
    lastProgressSentRef.current = calculatedProgress

    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await axios.post(
        `${API_BASE_URL}/api/education/${currentContent.educationId}/progress`,
        {
          last_position_seconds: Math.floor(currentTime),
          progress_percent: calculatedProgress,
        },
        { headers }
      )
    } catch (error) {
      console.error('진척도 저장 실패:', error)
    }
  }

  // 이전 강의로 이동
  const showPreviousCourse = () => {
    if (currentContentIndex <= 0) return
    const previousIndex = currentContentIndex - 1
    const prevContent = allContent[previousIndex]
    if (prevContent?.id) {
      setContentId(prevContent.id)
      setRequiredPage(Math.floor(previousIndex / 5))
    }
  }

  // 다음 강의로 이동
  const showNextCourse = () => {
    if (currentContentIndex < 0 || currentContentIndex >= allContent.length - 1) return
    const nextIndex = currentContentIndex + 1
    const nextContent = allContent[nextIndex]
    if (nextContent?.id) {
      setContentId(nextContent.id)
      setRequiredPage(Math.floor(nextIndex / 5))
    }
  }

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
    : [
      { label: '필수 교육', value: 0, detail: '집계 중' },
      { label: '정기 교육', value: 0, detail: '집계 중' },
      { label: '전체', value: 0, detail: '집계 중' },
    ]

  if (loading) return <EducationLoadingSkeleton />

  return (
    <section className="education-page learner-education-page">
      {addedCourses.length > 0 && (
        <div className="learner-new-course-banner">
          <span>
            <PlayCircleOutlineRoundedIcon />
            <strong>새 교육이 배정되었습니다.</strong> 교육 관리에서 등록한 {addedCourses[0].title}을 확인해 보세요.
          </span>
          <button type="button" onClick={() => setContentId(addedCourses[0].contentId)}>
            지금 보기
          </button>
        </div>
      )}

      <div className="education-summary rich-summary">
        {summaryCards.map((card) => (
          <SummaryCard key={card.key} {...card} onClick={() => setSummaryModal(card)} />
        ))}
      </div>

      <div className="education-top-grid learner-grid">
        <article className="education-panel content-panel course-player-panel">
          <div className="panel-heading panel-heading-row">
            <div>
              <span className="panel-kicker">교육 영상</span>
              <h3>{currentContent.title}</h3>
            </div>
            <span className="content-category">{currentContent.category ?? '안전 교육'}</span>
          </div>

          {currentContent.videoUrl ? (
            <div className="uploaded-video-player">
              {currentYouTubeEmbedUrl ? (
                <iframe
                  src={currentYouTubeEmbedUrl}
                  title={`${currentContent.title} 교육 영상`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={resolveMediaUrl(currentContent.videoUrl)}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  preload="metadata"
                  onLoadedMetadata={handleLoadedMetadata}
                  onSeeking={handleSeeking}
                  onTimeUpdate={handleTimeUpdate}
                  aria-label={`${currentContent.title} 교육 영상`}
                />
              )}
            </div>
          ) : (
            <div className="course-video" aria-label="교육 영상 미리보기">
              <div className="course-video-glow" />
              <div className="video-topline">
                <span>
                  <PlayCircleOutlineRoundedIcon /> 교육 영상
                </span>
              </div>
              <div className="video-preview-center">
                <span className="video-play">
                  <PlayArrowRoundedIcon />
                </span>
                <strong>{currentContent.title}</strong>
                <small>재생 버튼을 눌러 교육을 시작하세요</small>
              </div>
              <div className="video-bottom">
                <span>재생 시간 {currentContent.duration}</span>
              </div>
            </div>
          )}

          {/* 프로그레스 바 */}
          <div className="course-progress">
            <span>진행률</span>
            <div>
              <i style={{ width: `${currentProgress}%` }} />
            </div>
            <strong>{currentProgress}%</strong>
          </div>
          <p className="course-progress-caption">영상의 80% 이상을 수강하면 자동으로 이수가 완료됩니다.</p>

          {/* 네비게이션 버튼 */}
          <div className="content-navigation">
            <button type="button" disabled={currentContentIndex <= 0} onClick={showPreviousCourse}>
              <ArrowBackIosNewOutlinedIcon fontSize="inherit" /> 이전 강의
            </button>

            <button
              type="button"
              disabled={currentContentIndex < 0 || currentContentIndex >= allContent.length - 1}
              onClick={showNextCourse}
            >
              다음 강의 <ArrowForwardIosOutlinedIcon fontSize="inherit" />
            </button>
          </div>
        </article>

        {/* 내 교육 리스트 */}
        <article className="education-panel required-panel learner-list-panel">
          <div className="panel-heading">
            <span className="panel-kicker">나의 수강 현황</span>
            <h3>내 교육 리스트</h3>
          </div>
          <div className="required-table-wrap">
            <table className="required-table learner-table">
              <thead>
                <tr>
                  <th>교육명</th>
                  <th>구분</th>
                  <th>마감일</th>
                  <th>진도율</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {visibleCourses.map((course, index) => {
                  const progress = getCourseProgress(course)
                  return (
                    <tr
                      className={currentContent.id === course.contentId ? 'is-selected' : ''}
                      key={course.id}
                      onClick={() => setContentId(course.contentId)}
                      onKeyDown={(event) => event.key === 'Enter' && setContentId(course.contentId)}
                      role="button"
                      tabIndex="0"
                    >
                      <td>
                        {course.title}
                        {course.isCustom && <span className="new-course-dot">NEW</span>}
                      </td>
                      <td>
                        <span className="course-type">{course.isCustom ? '신규' : index < 3 ? '필수' : '정기'}</span>
                      </td>
                      <td>{course.deadline}</td>
                      <td>
                        <span className="table-progress">
                          <b>{progress}%</b>
                          <i>
                            <em style={{ width: `${progress}%` }} />
                          </i>
                        </span>
                      </td>
                      <td>
                        <span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="required-footer">
            <span>총 {allCourses.length}개 과정</span>
            <div className="required-pagination">
              <button type="button" aria-label="이전 교육 목록" disabled={requiredPage === 0} onClick={() => setRequiredPage((v) => v - 1)}>
                <ArrowBackIosNewOutlinedIcon fontSize="inherit" />
              </button>
              <span>
                {requiredPage + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="다음 교육 목록"
                disabled={requiredPage === pageCount - 1}
                onClick={() => setRequiredPage((v) => v + 1)}
              >
                <ArrowForwardIosOutlinedIcon fontSize="inherit" />
              </button>
            </div>
          </div>
        </article>
      </div>

      <div className="learner-bottom-grid">
        <article className="education-panel learner-completion-panel">
          <div className="panel-heading">
            <span className="panel-kicker">나의 학습 현황</span>
            <h3>교육 이수 현황</h3>
          </div>
          <div className="learner-rings">
            {completionSummaryData.map((item, index) => (
              <CompletionRing key={item.label} {...item} toneIndex={index} />
            ))}
          </div>
        </article>
        <article className="education-panel learning-guide-card">
          <div className="guide-copy">
            <span className="panel-kicker">학습 안내</span>
            <h3>
              <SchoolOutlinedIcon /> 수강 전 확인하세요
            </h3>
            <ul>
              <li>영상의 80% 이상을 시청하면 자동으로 이수가 완료됩니다.</li>
              <li>이수 여부에 상관없이 [다음 강의] 버튼을 눌러 목록을 순회할 수 있습니다.</li>
              <li>타임라인 건너뛰기는 제한되며, 중간에 벗어나도 마지막 시청 위치가 자동 저장됩니다.</li>
            </ul>
          </div>
          <div className="guide-illustration">
            <MenuBookOutlinedIcon />
            <CheckCircleOutlineRoundedIcon />
          </div>
        </article>
      </div>
      {summaryModal && (
        <LearningSummaryModal summary={summaryModal} getProgress={getCourseProgress} onClose={() => setSummaryModal(null)} />
      )}
    </section>
  )
}

function EducationLoadingSkeleton() {
  return (
    <section className="education-page learner-education-page education-loading-skeleton" aria-busy="true" aria-label="교육 데이터를 불러오는 중입니다">
      <div className="education-summary rich-summary">
        {[1, 2, 3].map((item) => (
          <article className="summary-card" key={item}>
            <span className="skeleton-block skeleton-icon" />
            <div>
              <span className="skeleton-block skeleton-line short" />
              <span className="skeleton-block skeleton-line medium" />
              <span className="skeleton-block skeleton-line long" />
            </div>
          </article>
        ))}
      </div>
      <div className="education-top-grid learner-grid">
        <article className="education-panel">
          <span className="skeleton-block skeleton-line short" />
          <span className="skeleton-block skeleton-line title" />
          <div className="skeleton-block skeleton-video" />
          <span className="skeleton-block skeleton-line long" />
          <div className="skeleton-actions">
            <span className="skeleton-block" />
            <span className="skeleton-block" />
          </div>
        </article>
        <article className="education-panel learner-list-panel">
          <span className="skeleton-block skeleton-line short" />
          <span className="skeleton-block skeleton-line title" />
          <div className="skeleton-table">
            {[1, 2, 3, 4, 5].map((item) => (
              <span className="skeleton-block" key={item} />
            ))}
          </div>
        </article>
      </div>
      <div className="learner-bottom-grid">
        <article className="education-panel skeleton-panel" />
        <article className="education-panel skeleton-panel" />
      </div>
    </section>
  )
}

function SummaryCard({ icon, tone, label, value, description, onClick }) {
  return (
    <article className="summary-card" role="button" tabIndex="0" onClick={onClick} onKeyDown={(event) => event.key === 'Enter' && onClick()}>
      <span className={`summary-icon summary-icon-${tone}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{description}</p>
      </div>
      <ArrowForwardIosOutlinedIcon />
    </article>
  )
}

function LearningSummaryModal({ summary, getProgress, onClose }) {
  return (
    <div className="learning-summary-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="learning-summary-modal" role="dialog" aria-modal="true" aria-label={`${summary.label} 교육 목록`} onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span>내 교육 현황</span>
            <h3>{summary.label}</h3>
            <p>{summary.description}</p>
          </div>
          <button type="button" aria-label="교육 목록 창 닫기" onClick={onClose}>
            <CloseRoundedIcon />
          </button>
        </header>
        <div className="learning-summary-modal-count">
          <strong>{summary.value}</strong>
          <span>현재 내 교육 리스트 기준</span>
        </div>
        <div className="learning-summary-course-list">
          {summary.courses.length ? (
            summary.courses.map((course) => {
              const progress = getProgress(course)
              return (
                <div key={course.id} className="learning-summary-course-row">
                  <div>
                    <strong>{course.title}</strong>
                    <span>
                      {course.target} · 마감 {course.deadline}
                    </span>
                  </div>
                  <div>
                    <b>{progress}%</b>
                    <i>
                      <em style={{ width: `${progress}%` }} />
                    </i>
                  </div>
                  <span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>
                    {course.status}
                  </span>
                </div>
              )
            })
          ) : (
            <p className="learning-summary-empty">해당하는 교육이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function CompletionRing({ label, value, detail, toneIndex }) {
  return (
    <div className="completion-ring-item" style={{ '--ring-color': completionRingColors[toneIndex], '--ring-delay': `${toneIndex * 110}ms` }}>
      <div className="completion-ring" style={{ '--completion-rate': `${value}%` }}>
        <strong>{value}%</strong>
      </div>
      <strong>{label}</strong>
      <span>{detail}</span>
    </div>
  )
}

export default EducationPage