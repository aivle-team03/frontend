import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DonutSmallRoundedIcon from '@mui/icons-material/DonutSmallRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import MovieCreationOutlinedIcon from '@mui/icons-material/MovieCreationOutlined'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined'
import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EDUCATION_MOCK_DATA } from '../mocks/mockData.js'

const API_BASE_URL = 'http://127.0.0.1:8000'

const completionMetricIcons = [
  GroupsOutlinedIcon,
  PersonAddAltRoundedIcon,
  BadgeOutlinedIcon,
  EngineeringRoundedIcon,
  HealthAndSafetyOutlinedIcon,
]

const courseMetrics = [
  { progress: 75, assigned: 24, completed: 18 },
  { progress: 91, assigned: 132, completed: 120 },
  { progress: 50, assigned: 80, completed: 40 },
  { progress: 100, assigned: 56, completed: 56 },
  { progress: 50, assigned: 28, completed: 14 },
  { progress: 72, assigned: 40, completed: 29 },
  { progress: 48, assigned: 32, completed: 15 },
]

const workTypes = ['지게차 작업', '고소 작업', '설비 점검', '화재 예방', '화학물질 취급', '기타']
const targetGroups = ['전체 임직원', '신규 입사자', '일반 작업자', '특수 작업자', '안전 관리자']
const completionColors = ['#4f75d1', '#2f9b73', '#c48a22', '#df7a32', '#df626c']
const targetCompletionColors = {
  전체: '#4f75d1',
  '신규 근로자': '#2f9b73',
  '일반 작업자': '#c48a22',
  '특수 작업자': '#df7a32',
  '안전 관리자': '#df626c',
}
const attendeeNames = ['신지함', '박동준', '한기석', '정유진', '홍혁재', '유다현', '윤도현', '서하은', '강민석', '임수빈', '조현우', '문채원', '신재윤', '오유나', '장도윤', '배수아']
const attendeeTeams = ['물류운영팀', '생산1팀', '생산2팀', '설비관리팀', '안전관리팀']

function EducationManagementPage({ addedCourses = [], onAddCourse = () => {} }) {
  const { completion, requiredCourses } = EDUCATION_MOCK_DATA
  const [apiCourses, setApiCourses] = useState(null)
  const [apiCompletion, setApiCompletion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  const fetchAdminEducationData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const [statusResult, roleStatsResult] = await Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/admin/education/status`, { headers }),
      axios.get(`${API_BASE_URL}/api/admin/education/role-stats`, { headers }),
    ])

    if (statusResult.status === 'fulfilled') {
      setApiCourses(statusResult.value.data.map((course) => {
        const completed = course.status_counts?.find((item) => item.status === '이수')?.count ?? 0
        return {
          id: `api-${course.education_id}`,
          title: course.title,
          target: course.role,
          deadline: course.due_date ?? '-',
          status: completed === course.target_count ? '이수 완료' : '진행 중',
          apiMetric: {
            progress: course.completion_rate ?? 0,
            assigned: course.target_count ?? 0,
            completed,
          },
        }
      }))
    } else {
      setApiError('교육 관리 데이터를 불러오지 못해 기존 화면 데이터를 표시합니다.')
    }

    if (roleStatsResult.status === 'fulfilled') {
      const roleItems = roleStatsResult.value.data.roles ?? []
      setApiCompletion([
        {
          label: '전체',
          value: roleStatsResult.value.data.total_completion_rate ?? 0,
          total: roleItems.reduce((sum, item) => sum + (item.target_count ?? 0), 0),
          completed: roleItems.reduce((sum, item) => sum + (item.completed_count ?? 0), 0),
        },
        ...roleItems.map((item) => ({
          label: item.role,
          value: item.completion_rate ?? 0,
          total: item.target_count ?? 0,
          completed: item.completed_count ?? 0,
        })),
      ])
    }
  }

  useEffect(() => {
    fetchAdminEducationData()
      .catch((error) => {
        console.error('교육 관리 API 조회 실패:', error)
        setApiError('교육 관리 데이터를 불러오지 못해 기존 화면 데이터를 표시합니다.')
      })
      .finally(() => setLoading(false))
  }, [])

  const baseCourses = apiCourses?.length ? apiCourses : requiredCourses
  const displayedCompletion = apiCompletion?.length ? apiCompletion : completion
  const allCourses = useMemo(() => [...addedCourses, ...baseCourses], [addedCourses, baseCourses])
  const [selectedTarget, setSelectedTarget] = useState('전체')
  const [courseSearch, setCourseSearch] = useState('')
  const [tableTarget, setTableTarget] = useState('전체')
  const [coursePage, setCoursePage] = useState(0)
  const [notice, setNotice] = useState('')
  const [videoAction, setVideoAction] = useState('register')
  const [videoSourceType, setVideoSourceType] = useState('file')
  const [videoFile, setVideoFile] = useState(null)
  const [courseForm, setCourseForm] = useState({
    title: '',
    target: targetGroups[0],
    deadline: '',
    videoUrl: '',
  })
  const [aiForm, setAiForm] = useState({
    workType: workTypes[0],
    equipment: '',
    riskFactor: '',
  })
  const [materialFile, setMaterialFile] = useState(null)
  const [aiStatus, setAiStatus] = useState('idle')
  const [attendanceDetail, setAttendanceDetail] = useState(null)
  const [attendanceFilter, setAttendanceFilter] = useState('전체')
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const videoInputRef = useRef(null)
  const materialInputRef = useRef(null)

  const orderedCompletion = [
    ...displayedCompletion.filter((item) => item.label === '전체'),
    ...displayedCompletion.filter((item) => item.label !== '전체'),
  ]
  const selectedCompletion = displayedCompletion.find((item) => item.label === selectedTarget) ?? orderedCompletion[0]
  const selectedTargetCourses = allCourses.filter(
    (course) => selectedTarget === '전체' || course.target === selectedTarget || course.target === '전체',
  )
  const targetOptions = ['전체', ...new Set(allCourses.map((course) => course.target).filter((target) => target !== '전체'))]
  const filteredCourses = useMemo(() => allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(courseSearch.trim().toLowerCase())
    const matchesTarget = tableTarget === '전체' || course.target === tableTarget || course.target === '전체'
    return matchesSearch && matchesTarget
  }), [allCourses, courseSearch, tableTarget])
  const coursePageCount = Math.max(1, Math.ceil(filteredCourses.length / 5))
  const activeCoursePage = Math.min(coursePage, coursePageCount - 1)
  const visibleCourses = filteredCourses.slice(activeCoursePage * 5, (activeCoursePage + 1) * 5)
  const attendanceList = useMemo(() => attendanceDetail ? createAttendanceList(attendanceDetail) : [], [attendanceDetail])
  const visibleAttendees = attendanceList.filter((person) => {
    const matchesStatus = attendanceFilter === '전체' || person.status === attendanceFilter
    const query = attendeeSearch.trim()
    const matchesSearch = !query || person.name.includes(query) || person.team.includes(query)
    return matchesStatus && matchesSearch
  })

  const updateCourseForm = (key, value) => setCourseForm((current) => ({ ...current, [key]: value }))
  const updateAiForm = (key, value) => setAiForm((current) => ({ ...current, [key]: value }))
  const openAttendanceModal = (detail) => {
    setAttendanceDetail(detail)
    setAttendanceFilter('전체')
    setAttendeeSearch('')
  }

  const addVideoCourse = (event) => {
    event.preventDefault()
    if (!courseForm.title.trim() || !courseForm.deadline || (videoSourceType === 'file' ? !videoFile : !courseForm.videoUrl.trim())) {
      setNotice('교육명, 마감일, 교육 영상을 모두 입력해 주세요.')
      return
    }

    const fileUrl = videoFile ? URL.createObjectURL(videoFile) : ''
    onAddCourse({
      id: `custom-${Date.now()}`,
      contentId: `custom-content-${Date.now()}`,
      title: courseForm.title.trim(),
      target: courseForm.target,
      deadline: courseForm.deadline,
      status: '대기',
      progress: 0,
      duration: '영상',
      category: '등록 영상',
      videoUrl: videoSourceType === 'file' ? fileUrl : courseForm.videoUrl.trim(),
      sourceName: videoSourceType === 'file' ? videoFile.name : '외부 영상 URL',
      isCustom: true,
    })
    setCourseForm({ title: '', target: targetGroups[0], deadline: '', videoUrl: '' })
    setVideoFile(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
    setNotice('교육 영상이 대상자 교육 리스트와 내 교육 리스트에 추가되었습니다.')
  }

  const requestAiVideo = async (event) => {
    event.preventDefault()
    if (!aiForm.equipment.trim() || !aiForm.riskFactor.trim()) {
      setAiStatus('error')
      return
    }

    try {
      setAiStatus('queued')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.post(`${API_BASE_URL}/api/admin/education/ai-generate`, {
        work_type: aiForm.workType,
        equipment: aiForm.equipment.trim(),
        risk_factor: aiForm.riskFactor.trim(),
      }, { headers })

      const generatedCourse = response.data
      onAddCourse({
        id: `ai-${generatedCourse.education_id ?? Date.now()}`,
        contentId: `ai-content-${generatedCourse.education_id ?? Date.now()}`,
        title: generatedCourse.title,
        target: '전체 임직원',
        deadline: '-',
        status: '대기',
        progress: 0,
        duration: 'AI 생성 영상',
        category: 'AI 생성 교육',
        videoUrl: generatedCourse.generated_video_url ?? '',
        isCustom: true,
      })
      await fetchAdminEducationData()
      setNotice(`AI 교육 자료가 생성되었습니다. ${generatedCourse.summary ?? ''}`)
      setAiStatus('complete')
    } catch (error) {
      console.error('AI 교육 자료 생성 실패:', error)
      setAiStatus('error')
      setNotice(`AI 교육 자료 생성에 실패했습니다. ${error.response?.data?.detail ?? ''}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        교육 관리 데이터 연결 중...
      </div>
    )
  }

  return (
    <section className="education-page education-management-page">
      <div className="education-creation-grid">
        <article className={`education-panel video-register-card${videoAction !== 'register' ? ' is-action-hidden' : ''}`}>
          <div className="card-heading-row">
            <PanelTitle icon={VideoFileOutlinedIcon} kicker="교육 영상 등록" title="교육 영상 추가" />
            <VideoActionTabs value={videoAction} onChange={setVideoAction} />
          </div>
          <p className="card-intro">영상을 등록하면 선택한 대상자의 교육 목록에 즉시 표시됩니다.</p>
          <form className="video-register-form" onSubmit={addVideoCourse}>
            <FormField label="교육명" required>
              <input value={courseForm.title} onChange={(event) => updateCourseForm('title', event.target.value)} placeholder="예: 3분기 지게차 안전교육" />
            </FormField>
            <div className="two-column-fields">
              <FormField label="이수 대상" required>
                <StyledSelect value={courseForm.target} options={targetGroups} onChange={(value) => updateCourseForm('target', value)} ariaLabel="이수 대상" />
              </FormField>
              <FormField label="마감일" required>
                <input type="date" value={courseForm.deadline} onChange={(event) => updateCourseForm('deadline', event.target.value)} />
              </FormField>
            </div>
            <div className="source-tabs" role="tablist" aria-label="영상 등록 방식">
              <button className={videoSourceType === 'file' ? 'is-active' : ''} type="button" onClick={() => setVideoSourceType('file')}><CloudUploadOutlinedIcon /> 파일 첨부</button>
              <button className={videoSourceType === 'url' ? 'is-active' : ''} type="button" onClick={() => setVideoSourceType('url')}><LinkRoundedIcon /> URL 입력</button>
            </div>
            {videoSourceType === 'file' ? (
              <button className={`upload-dropzone compact${videoFile ? ' has-file' : ''}`} type="button" onClick={() => videoInputRef.current?.click()}>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />
                <VideoFileOutlinedIcon />
                <span><strong>{videoFile?.name ?? '교육 영상 파일을 선택하세요'}</strong><small>MP4, MOV, WebM 등 영상 파일</small></span>
                <b>{videoFile ? '변경' : '찾아보기'}</b>
              </button>
            ) : (
              <FormField label="영상 URL" required>
                <input type="url" value={courseForm.videoUrl} onChange={(event) => updateCourseForm('videoUrl', event.target.value)} placeholder="https://..." />
              </FormField>
            )}
            <button className="primary-course-button" type="submit"><AddCircleOutlineRoundedIcon /> 교육 리스트에 추가</button>
            {(notice || apiError) && <p className={`form-notice${notice.includes('추가되었습니다') ? ' is-success' : ''}`} role="status">{notice || apiError}</p>}
          </form>
        </article>

        <article className={`education-panel ai-video-card${videoAction !== 'generate' ? ' is-action-hidden' : ''}`}>
          <div className="ai-card-glow" />
          <div className="card-heading-row">
            <PanelTitle icon={MovieCreationOutlinedIcon} kicker="교육 영상 생성" title="교육 영상 생성" dark />
            <VideoActionTabs value={videoAction} onChange={setVideoAction} dark />
          </div>
          <p className="card-intro">교육 자료를 업로드하면 핵심 내용을 분석해 교육용 영상 초안을 만듭니다.</p>
          <form className="ai-video-form" onSubmit={requestAiVideo}>
            <EducationSelect label="작업 유형" value={aiForm.workType} options={workTypes} onChange={(value) => updateAiForm('workType', value)} />
            <label className="education-select"><span>사용 장비</span><input value={aiForm.equipment} onChange={(event) => updateAiForm('equipment', event.target.value)} placeholder="예: 지게차, 안전모, 절단기" /></label>
            <label className="education-select"><span>위험 요인</span><input value={aiForm.riskFactor} onChange={(event) => updateAiForm('riskFactor', event.target.value)} placeholder="예: 충돌, 낙하, 끼임" /></label>
            <button className={`upload-dropzone ai-upload${materialFile ? ' has-file' : ''}`} type="button" onClick={() => materialInputRef.current?.click()}>
              <input ref={materialInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.hwp,.txt" onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)} />
              <CloudUploadOutlinedIcon />
              <span><strong>{materialFile?.name ?? '교육 자료 업로드'}</strong><small>PDF, Word, PPT, HWP · 원본은 서버에 저장하지 않습니다</small></span>
            </button>
            <button className="ai-generate-button" type="submit"><VideoLibraryOutlinedIcon /> AI 교육 영상 생성</button>
            {aiStatus === 'error' && <p className="ai-form-status is-error">사용 장비와 위험 요인을 입력해 주세요.</p>}
            {aiStatus === 'queued' && <p className="ai-form-status"><CheckCircleOutlineRoundedIcon /> AI 교육 자료를 생성하고 있습니다.</p>}
            {aiStatus === 'complete' && <p className="ai-form-status"><CheckCircleOutlineRoundedIcon /> AI 교육 자료가 교육 목록에 추가되었습니다.</p>}
          </form>
        </article>
      </div>

      <div className="management-overview-row">
        <article className="education-panel completion-summary-card">
          <div className="management-card-heading">
            <PanelTitle icon={DonutSmallRoundedIcon} kicker="교육 현황" title="교육 이수 현황" />
            <StyledSelect className="management-filter-select" ariaLabel="교육 이수 현황 기준" value={selectedTarget} options={orderedCompletion.map((item) => item.label)} onChange={setSelectedTarget} />
          </div>
          {selectedTarget === '전체' ? (
            <div className="completion-metric-grid" key={selectedTarget}>
              {orderedCompletion.map((item, index) => <CompletionMetric item={item} key={item.label} overall={item.label === '전체'} metricIndex={index} onOpen={() => openAttendanceModal({ title: `${item.label} 교육 이수 현황`, target: item.label, total: item.total, completed: item.completed })} />)}
            </div>
          ) : (
            <div className="completion-focus-card is-clickable" key={selectedTarget} style={{ '--focus-color': targetCompletionColors[selectedTarget] ?? '#4f75d1' }} role="button" tabIndex="0" onClick={() => openAttendanceModal({ title: `${selectedCompletion.label} 교육 이수 현황`, target: selectedCompletion.label, total: selectedCompletion.total, completed: selectedCompletion.completed })} onKeyDown={(event) => event.key === 'Enter' && openAttendanceModal({ title: `${selectedCompletion.label} 교육 이수 현황`, target: selectedCompletion.label, total: selectedCompletion.total, completed: selectedCompletion.completed })}>
              <div className="completion-focus-chart" style={{ '--completion-rate': `${selectedCompletion.value}%` }}><div><strong>{selectedCompletion.value}<small>%</small></strong><span>이수율</span></div></div>
              <div className="completion-focus-copy"><span>선택 대상</span><h4>{selectedCompletion.label}</h4><p><strong>{selectedCompletion.completed}명</strong> 이수 / 전체 {selectedCompletion.total}명</p><div className="completion-focus-progress"><i style={{ width: `${selectedCompletion.value}%` }} /></div></div>
              <div className="completion-focus-courses"><div><strong>대상 교육</strong><span>{selectedTargetCourses.length}개 과정</span></div>{selectedTargetCourses.slice(0, 2).map((course) => <p key={course.id}><span>{course.title}</span><b>{course.status}</b></p>)}</div>
            </div>
          )}
        </article>

        {/* 하단 테이블: 대상자별 교육 리스트 */}
        <article className="education-panel management-course-table-card">
          <div className="management-card-heading table-card-heading"><PanelTitle icon={GroupsOutlinedIcon} kicker="교육 대상자" title="대상자별 교육 리스트" /><span className="course-count">총 {allCourses.length}개 과정</span></div>
          <div className="course-table-toolbar">
            <label className="course-search"><SearchRoundedIcon /><input value={courseSearch} onChange={(event) => { setCourseSearch(event.target.value); setCoursePage(0) }} placeholder="교육명 검색" /></label>
            <StyledSelect className="course-target-select" value={tableTarget} options={targetOptions} onChange={(value) => { setTableTarget(value); setCoursePage(0) }} ariaLabel="교육 대상 필터" />
          </div>
          <div className="management-table-wrap">
            <table className="management-course-table">
              <thead><tr><th>교육명</th><th>대상</th><th>마감일</th><th>이수 대상</th><th>이수 완료</th><th>이수율</th><th>상태</th></tr></thead>
              <tbody>{visibleCourses.map((course, index) => {
                const metric = course.isCustom ? { progress: 0, assigned: course.target === '전체 임직원' ? 152 : 24, completed: 0 } : (course.apiMetric ?? courseMetrics[course.id - 1] ?? courseMetrics[index])
                return <tr className={`${course.isCustom ? 'is-new-course ' : ''}is-course-row`} key={course.id} role="button" tabIndex="0" onClick={() => openAttendanceModal({ title: course.title, target: course.target, total: metric.assigned, completed: metric.completed })} onKeyDown={(event) => event.key === 'Enter' && openAttendanceModal({ title: course.title, target: course.target, total: metric.assigned, completed: metric.completed })}><td>{course.title}{course.isCustom && <span className="new-course-dot">NEW</span>}</td><td>{course.target}</td><td>{course.deadline}</td><td>{metric.assigned}명</td><td>{metric.completed}명</td><td><span className="course-rate"><b>{metric.progress}%</b><i><em style={{ width: `${metric.progress}%` }} /></i></span></td><td><span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>{course.status}</span></td></tr>
              })}</tbody>
            </table>
          </div>
          <div className="management-table-footer">
            <span>최근 등록순 {visibleCourses.length}개 표시</span>
            <div className="management-pagination">
              <button type="button" aria-label="이전 교육 목록" disabled={activeCoursePage === 0} onClick={() => setCoursePage((page) => Math.max(0, page - 1))}><ArrowBackIosNewRoundedIcon /></button>
              <span>{activeCoursePage + 1} / {coursePageCount}</span>
              <button type="button" aria-label="다음 교육 목록" disabled={activeCoursePage >= coursePageCount - 1} onClick={() => setCoursePage((page) => Math.min(coursePageCount - 1, page + 1))}><ArrowForwardIosRoundedIcon /></button>
            </div>
          </div>
        </article>
      </div>
      {attendanceDetail && <AttendanceModal detail={attendanceDetail} attendees={visibleAttendees} filter={attendanceFilter} onFilterChange={setAttendanceFilter} search={attendeeSearch} onSearchChange={setAttendeeSearch} onClose={() => setAttendanceDetail(null)} />}
    </section>
  )
}

function CompletionMetric({ item, overall, metricIndex, onOpen }) {
  const MetricIcon = completionMetricIcons[metricIndex] ?? GroupsOutlinedIcon
  return <div className={`completion-metric metric-tone-${metricIndex}${overall ? ' is-featured is-overall' : ''}`} style={{ '--metric-color': completionColors[metricIndex], '--animation-delay': `${metricIndex * 90}ms` }} role="button" tabIndex="0" onClick={onOpen} onKeyDown={(event) => event.key === 'Enter' && onOpen()}><div className="metric-label"><span className="metric-icon"><MetricIcon /></span><strong>{item.label}</strong></div><div className="metric-value-row"><strong>{item.value}<small>%</small></strong><span className="metric-ring" style={{ '--completion-rate': `${item.value}%` }}><i /></span></div><small>{item.completed} / {item.total}명</small></div>
}

function AttendanceModal({ detail, attendees, filter, onFilterChange, search, onSearchChange, onClose }) {
  const filters = ['전체', '이수', '미이수']
  const total = detail.total
  const incomplete = Math.max(0, total - detail.completed)
  const rate = total ? Math.round((detail.completed / total) * 100) : 0
  return <div className="attendance-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="attendance-modal" role="dialog" aria-modal="true" aria-label={`${detail.title} 대상자 현황`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="attendance-modal-header"><div><span>교육 대상자 현황</span><h3>{detail.title}</h3><p>{detail.target} · 이수 현황을 확인하고 대상자를 검색할 수 있습니다.</p></div><button type="button" aria-label="상세 창 닫기" onClick={onClose}><CloseRoundedIcon /></button></header>
      <div className="attendance-summary"><div className="attendance-total"><span>이수 대상</span><AnimatedNumber value={total} suffix="명" /></div><div className="attendance-complete"><span>이수 완료</span><AnimatedNumber value={detail.completed} suffix="명" /></div><div className="attendance-incomplete"><span>미이수</span><AnimatedNumber value={incomplete} suffix="명" /></div><div className="attendance-rate"><span>이수율</span><AnimatedNumber value={rate} suffix="%" /><i><em style={{ width: `${rate}%` }} /></i></div></div>
      <div className="attendance-tools"><div className="attendance-filter-tabs" role="tablist">{filters.map((item) => <button className={filter === item ? 'is-active' : ''} key={item} type="button" onClick={() => onFilterChange(item)}>{item}</button>)}</div><label className="attendance-search"><SearchRoundedIcon /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="이름 또는 부서 검색" /></label></div>
      <div className="attendance-list" key={`${filter}-${search}`}><div className="attendance-list-head"><span>대상자</span><span>소속</span><span>이수 상태</span><span>이수 일시</span></div>{attendees.length ? attendees.map((person, index) => <div className="attendance-list-row" key={person.id} style={{ '--row-delay': `${Math.min(index, 10) * 45}ms` }}><span><b>{person.name.slice(0, 1)}</b>{person.name}</span><span>{person.team}</span><span><i className={person.status === '이수' ? 'is-complete' : ''}>{person.status}</i></span><span>{person.date ?? '-'}</span></div>) : <p className="attendance-empty">조건에 맞는 대상자가 없습니다.</p>}</div>
    </section>
  </div>
}

function AnimatedNumber({ value, suffix }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let frameId
    const duration = 620
    const startedAt = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - ((1 - progress) ** 3)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [value])

  return <strong>{displayValue}<small>{suffix}</small></strong>
}

function createAttendanceList({ total, completed, target }) {
  return Array.from({ length: total }, (_, index) => ({
    id: `${target}-${index}`,
    name: attendeeNames[index % attendeeNames.length],
    team: attendeeTeams[index % attendeeTeams.length],
    status: index < completed ? '이수' : '미이수',
    date: index < completed ? `2026. 07. ${String((index % 20) + 1).padStart(2, '0')}` : null,
  }))
}

function EducationSelect({ label, value, options, onChange }) {
  return <label className="education-select"><span>{label}</span><StyledSelect value={value} options={options} onChange={onChange} ariaLabel={label} /></label>
}

function StyledSelect({ value, options, onChange, ariaLabel, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  return <div className={`styled-select ${className}${isOpen ? ' is-open' : ''}`} ref={selectRef}>
    <button className="styled-select-trigger" type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} onKeyDown={(event) => event.key === 'Escape' && setIsOpen(false)}>
      <span>{value}</span><KeyboardArrowDownRoundedIcon />
    </button>
    {isOpen && <div className="styled-select-menu" role="listbox" aria-label={ariaLabel}>
      {options.map((option) => <button className={option === value ? 'is-selected' : ''} type="button" role="option" aria-selected={option === value} key={option} onClick={() => { onChange(option); setIsOpen(false) }}><span>{option}</span>{option === value && <CheckRoundedIcon />}</button>)}
    </div>}
  </div>
}

function FormField({ label, required, children }) {
  return <label className="form-field"><span>{label}{required && <b>*</b>}</span>{children}</label>
}

function VideoActionTabs({ value, onChange, dark = false }) {
  return <div className={`video-action-tabs${dark ? ' is-dark' : ''}`} role="tablist" aria-label="교육 영상 추가 방식">
    <button className={value === 'register' ? 'is-active' : ''} type="button" role="tab" aria-selected={value === 'register'} onClick={() => onChange('register')}>등록</button>
    <button className={value === 'generate' ? 'is-active' : ''} type="button" role="tab" aria-selected={value === 'generate'} onClick={() => onChange('generate')}>생성</button>
  </div>
}

function PanelTitle({ icon: Icon, kicker, title, dark = false }) {
  return (
    <div className={`panel-title-with-icon${dark ? ' is-dark' : ''}`}>
      {kicker && <span className="panel-kicker">{kicker}</span>}
      <div className="panel-title-main">
        <span className="panel-title-icon" aria-hidden="true">
          <Icon />
        </span>
        <h3>{title}</h3>
      </div>
    </div>
  )
}

const statusStyles = (
  <style>{`
    .education-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    /* 미이수 : 빨간색 */
    .education-status.status-red {
      color: #ef4444;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
    }

    /* 진행 중 : 파란색 */
    .education-status.status-blue {
      color: #3b82f6;
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    /* 이수 완료 : 노란색 */
    .education-status.status-yellow {
      color: #ca8a04;
      background-color: #fefce8;
      border: 1px solid #fef08a;
    }
  `}`</style>
)

export default EducationManagementPage
