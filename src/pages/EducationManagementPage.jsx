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

const API_BASE_URL = BACKEND_API_URL

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
const educationCategoryOptions = ['공통', '지게차', '화물트럭', '토잉카', '팔레트', '적재', '현장보조', '유지보수', '재고', '위험물']
const generalUserCategoryOptions = educationCategoryOptions.filter((category) => category !== '공통')
const educationTypes = ['필수', '정기']
const targetGroups = ['공통', '안전관리자', '관제사', '현장관리자', '일반유저']
const getTodayDate = () => {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
const completionColors = ['#4f75d1', '#2f9b73', '#c48a22', '#df7a32', '#df626c']
const ALL_EMPLOYEE_CATEGORIES = new Set(['전체', '공통'])
const targetCompletionColors = {
  전체: '#4f75d1',
  '신규 근로자': '#2f9b73',
  '일반 작업자': '#c48a22',
  '특수 작업자': '#df7a32',
  '안전 관리자': '#df626c',
}
function EducationManagementPage({ addedCourses = [], onAddCourse = () => {} }) {
  const [apiCourses, setApiCourses] = useState(null)
  const [apiCompletion, setApiCompletion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const educationDashboardRef = useRef(null)

  const fetchAdminEducationData = async () => {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.get(`${API_BASE_URL}/api/admin/education/dashboard`, { headers })
    const dashboard = response.data
    educationDashboardRef.current = dashboard
    setApiCourses((dashboard.courses ?? []).map((course) => {
        const completed = course.completed_count ?? course.status_counts?.find((item) => item.status === '이수')?.count ?? 0
        return {
          id: `api-${course.education_id}`,
          educationId: course.education_id,
          title: course.title,
          videoUrl: course.video_url,
          target: course.category ?? '전체',
          deadline: course.due_date ?? '-',
          status: completed === course.target_count ? '이수 완료' : '진행 중',
          apiMetric: {
            progress: course.completion_rate ?? 0,
            assigned: course.target_count ?? 0,
            completed,
          },
        }
      }))

    const categoryItems = (dashboard.categories ?? []).filter((item) => !ALL_EMPLOYEE_CATEGORIES.has(item.category))
    setApiCompletion([
        {
          label: '전체',
          value: dashboard.total_completion_rate ?? 0,
          total: dashboard.total_target_count ?? 0,
          completed: dashboard.total_completed_count ?? 0,
        },
        ...categoryItems.map((item) => ({
          label: item.category,
          value: item.completion_rate ?? 0,
          total: item.target_count ?? 0,
          completed: item.completed_count ?? 0,
        })),
      ])
  }

  useEffect(() => {
    fetchAdminEducationData()
      .catch((error) => {
        console.error('교육 관리 API 조회 실패:', error)
        setApiError('교육 관리 데이터를 불러오지 못해 기존 화면 데이터를 표시합니다.')
      })
      .finally(() => setLoading(false))
  }, [])

  const baseCourses = apiCourses ?? []
  const displayedCompletion = apiCompletion ?? []
  const allCourses = useMemo(() => [
    ...addedCourses,
    ...baseCourses.slice().reverse(),
  ], [addedCourses, baseCourses])
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
    targetCategory: generalUserCategoryOptions[0],
    workType: workTypes[0],
    educationType: educationTypes[0],
    deadline: getTodayDate(),
    videoUrl: '',
  })
  const [aiForm, setAiForm] = useState({
    title: '',
    workType: workTypes[0],
    target: targetGroups[0],
    category: '공통',
    educationType: educationTypes[0],
    equipment: '',
    riskFactor: '',
    request: '',
    dueDate: getTodayDate(),
  })
  const [materialFile, setMaterialFile] = useState(null)
  const [aiStatus, setAiStatus] = useState('idle')
  const [aiTaskId, setAiTaskId] = useState(null)
  const [initialGenerationRequest, setInitialGenerationRequest] = useState('')
  const [regenerationRequests, setRegenerationRequests] = useState([])
  const [regenerationRequestDraft, setRegenerationRequestDraft] = useState('')
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [publishError, setPublishError] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isCancellingReview, setIsCancellingReview] = useState(false)
  const [attendanceDetail, setAttendanceDetail] = useState(null)
  const [attendanceList, setAttendanceList] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceFilter, setAttendanceFilter] = useState('전체')
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const videoInputRef = useRef(null)
  const materialInputRef = useRef(null)
  const registerCardRef = useRef(null)
  const generatedCardRef = useRef(null)
  const courseTableCardRef = useRef(null)
  const [generatedCardHeight, setGeneratedCardHeight] = useState(null)
  const [generatedMeasureWidth, setGeneratedMeasureWidth] = useState(null)

  useEffect(() => {
    if (generatedCardHeight || !registerCardRef.current) return undefined

    const frameId = window.requestAnimationFrame(() => {
      setGeneratedMeasureWidth(Math.ceil(registerCardRef.current?.getBoundingClientRect().width ?? 0))
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [generatedCardHeight])

  useEffect(() => {
    if (!generatedMeasureWidth || !generatedCardRef.current) return
    const measuredHeight = Math.max(
      Math.ceil(generatedCardRef.current.getBoundingClientRect().height),
      Math.ceil(courseTableCardRef.current?.getBoundingClientRect().height ?? 0),
    )
    setGeneratedCardHeight(measuredHeight)
    setGeneratedMeasureWidth(null)
  }, [generatedMeasureWidth])

  useEffect(() => {
    if (videoAction !== 'generate' || !generatedCardRef.current) return undefined

    const card = generatedCardRef.current
    const syncHeight = () => setGeneratedCardHeight((current) => Math.max(current ?? 0, Math.ceil(card.getBoundingClientRect().height)))
    const observer = new ResizeObserver(syncHeight)
    syncHeight()
    observer.observe(card)
    return () => observer.disconnect()
  }, [videoAction])

  useEffect(() => {
    const restorePersistedVideoJob = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const { data: jobs } = await axios.get(`${API_BASE_URL}/api/education/veo-generate/pending`, { headers })
        const job = jobs?.find((item) => item.publication_status === 'REVIEW_REQUIRED') ?? jobs?.[0]
        if (!job) return

        setAiForm((current) => ({
          ...current,
          title: job.title ?? current.title,
          category: job.category ?? current.category,
          educationType: job.type ?? current.educationType,
          dueDate: job.due_date ?? current.dueDate,
        }))

        if (job.publication_status === 'REVIEW_REQUIRED') {
          setAiStatus('review')
          setGeneratedVideo({ taskId: job.task_id, videoUrl: job.video_url, qualityReport: job.quality_report })
          setNotice('검토 대기 중인 AI 교육 영상을 복원했습니다.')
          return
        }

        setAiStatus('queued')
        setAiTaskId(job.task_id)
        setNotice('진행 중인 AI 교육 영상 생성을 다시 확인합니다.')
      } catch (error) {
        console.error('저장된 AI 교육 영상 작업 복원 실패:', error)
      }
    }

    restorePersistedVideoJob()
  }, [])

  useEffect(() => {
    if (!aiTaskId) return undefined

    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const pollTaskStatus = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/education/veo-generate/${aiTaskId}/status`, { headers })
        if (data.status === 'COMPLETED') {
          const requiresHumanReview = data.quality_report?.hitl_required === true
          setAiTaskId(null)
          setIsRegenerating(false)
          setPublishError('')
          if (requiresHumanReview) {
            setAiStatus('review')
            setRegenerationRequestDraft('')
            setGeneratedVideo({ taskId: aiTaskId, videoUrl: data.video_url, qualityReport: data.quality_report })
            setNotice('품질 기준 미달 영상입니다. 검수 후 등록하거나 추가 요청으로 재생성해 주세요.')
          } else {
            setAiStatus('published')
            setGeneratedVideo(null)
            setNotice('품질 검수를 통과해 교육 목록에 자동 등록되었습니다.')
            await fetchAdminEducationData()
          }
        } else if (data.status === 'FAILED' || data.publication_status === 'TIMED_OUT') {
          setAiStatus('error')
          setAiTaskId(null)
          setIsRegenerating(false)
          setNotice(`AI 교육 영상 생성에 실패했습니다. ${data.error_message ?? ''}`)
        }
      } catch (error) {
        console.error('AI 교육 영상 작업 상태 조회 실패:', error)
      }
    }

    pollTaskStatus()
    const intervalId = window.setInterval(pollTaskStatus, 5000)
    return () => window.clearInterval(intervalId)
  }, [aiTaskId])

  const orderedCompletion = [
    ...displayedCompletion.filter((item) => item.label === '전체'),
    ...displayedCompletion.filter((item) => item.label !== '전체'),
  ]
  const selectedCompletion = displayedCompletion.find((item) => item.label === selectedTarget) ?? orderedCompletion[0] ?? { label: '전체', value: 0, total: 0, completed: 0 }
  const selectedTargetCourses = allCourses.filter(
    (course) => selectedTarget === '전체' || course.target === selectedTarget || course.target === '전체',
  )
  const targetOptions = ['전체', ...new Set(allCourses.map((course) => course.target).filter((target) => target !== '전체'))]
  const filteredCourses = useMemo(() => allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(courseSearch.trim().toLowerCase())
    const matchesTarget = tableTarget === '전체' || course.target === tableTarget || course.target === '전체'
    return matchesSearch && matchesTarget
  }), [allCourses, courseSearch, tableTarget])
  const coursePageCount = Math.max(1, Math.ceil(filteredCourses.length / 8))
  const activeCoursePage = Math.min(coursePage, coursePageCount - 1)
  const visibleCourses = filteredCourses.slice(activeCoursePage * 8, (activeCoursePage + 1) * 8)
  const visibleAttendees = attendanceList.filter((person) => {
    const matchesStatus = attendanceFilter === '전체' || person.status === attendanceFilter
    const query = attendeeSearch.trim()
    const matchesSearch = !query || person.name.includes(query) || person.team.includes(query)
    return matchesStatus && matchesSearch
  })

  const updateCourseForm = (key, value) => setCourseForm((current) => ({ ...current, [key]: value }))
  const updateAiForm = (key, value) => setAiForm((current) => ({ ...current, [key]: value }))
  const updateAiTarget = (target) => setAiForm((current) => ({
    ...current,
    target,
    category: target === '일반유저'
      ? (generalUserCategoryOptions.includes(current.category) ? current.category : generalUserCategoryOptions[0])
      : target,
  }))
  /* 이전 개별 사용자 조회 방식: 단일 dashboard 응답으로 대체됨
  const openAttendanceModalLegacy = async (detail) => {
    setAttendanceDetail(detail)
    setAttendanceFilter('전체')
    setAttendeeSearch('')
    setAttendanceList([])
    try {
      setAttendanceLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const users = await getAdminUsers(headers)
      const targetUsers = detail.educationId
        ? targetUsersForCourse(users, detail.target)
        : detail.target === '전체' ? users : users.filter((user) => user.category === detail.target)
      const userEducations = await Promise.all(targetUsers.map(async (user) => [user, await getUserEducations(user, headers)]))
      const attendees = userEducations.map(([user, educations]) => {
        if (detail.educationId) {
          const education = courseStatusForUser(educations, detail.educationId)
          return {
            id: `${user.uid}-${detail.educationId}`,
            name: user.name,
            educationTitle: detail.title,
            team: user.category ?? '-',
            status: education?.status ?? '미이수',
            date: education?.completed_date ? String(education.completed_date).replaceAll('-', '. ') : null,
          }
        }
        const applicableCourses = educations.filter((education) => ALL_EMPLOYEE_CATEGORIES.has(education.category) || education.category === user.category)
        const completed = applicableCourses.length > 0 && applicableCourses.every((education) => education.status === '이수')
        return {
          id: `${user.uid}-summary`, name: user.name, educationTitle: `${detail.target} 교육 현황`, team: user.category ?? '-', status: completed ? '이수' : '미이수', date: null,
        }
      })
      const completedCount = attendees.filter((attendee) => attendee.status === '이수').length
      setAttendanceDetail((current) => current ? { ...current, total: attendees.length, completed: completedCount } : current)
      setAttendanceList(attendees)
    } catch (error) {
      console.error('교육 대상자 목록 조회 실패:', error)
    } finally {
      setAttendanceLoading(false)
    }
  }
  */

  const openAttendanceModal = (detail) => {
    setAttendanceDetail(detail)
    setAttendanceFilter('전체')
    setAttendeeSearch('')
    setAttendanceLoading(false)

    const dashboard = educationDashboardRef.current
    const source = detail.educationId
      ? dashboard?.courses?.find((course) => Number(course.education_id) === Number(detail.educationId))
      : detail.target === '전체'
        ? {
            target_count: dashboard?.total_target_count ?? 0,
            completed_count: dashboard?.total_completed_count ?? 0,
            attendees: dashboard?.attendees ?? [],
          }
        : dashboard?.categories?.find((category) => category.category === detail.target)
    const attendees = source?.attendees ?? []
    const completed = source?.completed_count ?? attendees.filter((attendee) => attendee.status === '이수').length
    const total = source?.target_count ?? attendees.length

    setAttendanceDetail((current) => current ? { ...current, total, completed } : current)
    setAttendanceList(attendees.map((attendee) => ({
      id: `${attendee.uid}-${attendee.education_id ?? detail.educationId ?? detail.target ?? 'all'}`,
      name: attendee.name,
      educationTitle: attendee.education_title ?? detail.title,
      team: attendee.category ?? '-',
      status: attendee.status,
      date: attendee.completed_date ? String(attendee.completed_date).replaceAll('-', '. ') : null,
    })))
  }

  const addVideoCourse = (event) => {
    event.preventDefault()
    if (!courseForm.title.trim() || !courseForm.workType || !courseForm.educationType || !courseForm.deadline || (videoSourceType === 'file' ? !videoFile : !courseForm.videoUrl.trim())) {
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
      duration: courseForm.educationType,
      category: courseForm.workType,
      videoUrl: videoSourceType === 'file' ? fileUrl : courseForm.videoUrl.trim(),
      sourceName: videoSourceType === 'file' ? videoFile.name : '외부 영상 URL',
      isCustom: true,
    })
    setCourseForm({ title: '', target: targetGroups[0], targetCategory: generalUserCategoryOptions[0], workType: workTypes[0], educationType: educationTypes[0], deadline: getTodayDate(), videoUrl: '' })
    setVideoFile(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
    setNotice('교육 영상이 대상자 교육 리스트와 내 교육 리스트에 추가되었습니다.')
  }

  const requestAiVideo = async (event, isRegeneration = false) => {
    event?.preventDefault()
    if (!aiForm.title.trim() || !aiForm.equipment.trim() || !aiForm.riskFactor.trim() || !aiForm.dueDate) {
      setAiStatus('error')
      return
    }

    try {
      const additionalRequest = regenerationRequestDraft.trim()
      const requestToSend = isRegeneration
        ? [initialGenerationRequest, ...regenerationRequests, additionalRequest].filter(Boolean).join('\n\n')
        : aiForm.request.trim()

      if (isRegeneration) {
        if (additionalRequest) setRegenerationRequests((current) => [...current, additionalRequest])
      } else {
        // 새 생성은 이전 영상의 재생성 요청 이력을 이어받지 않는다.
        setInitialGenerationRequest(requestToSend)
        setRegenerationRequests([])
      }
      setIsRegenerating(isRegeneration)
      setAiStatus('queued')
      setGeneratedVideo(null)
      setPublishError('')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const formData = new FormData()
      if (materialFile) formData.append('file', materialFile)
      else formData.append('text_content', `작업 유형: ${aiForm.workType}\n사용 장비: ${aiForm.equipment.trim()}\n위험 요인: ${aiForm.riskFactor.trim()}`)
      formData.append('title', aiForm.title.trim() || `${aiForm.workType} 안전 교육`)
      formData.append('category', aiForm.category)
      formData.append('type', aiForm.educationType)
      formData.append('due_date', aiForm.dueDate)
      formData.append('request', requestToSend)
      const response = await axios.post(`${API_BASE_URL}/api/education/veo-generate`, formData, { headers })
      setAiTaskId(response.data.task_id)
      setNotice('AI 교육 영상 생성을 시작했습니다. 완료되면 교육 목록에 자동으로 반영됩니다.')

    } catch (error) {
      console.error('AI 교육 자료 생성 실패:', error)
      setAiStatus('error')
      setIsRegenerating(false)
      setNotice(`AI 교육 자료 생성에 실패했습니다. ${error.response?.data?.detail ?? ''}`)
    }
  }

  const publishGeneratedVideo = async (taskId = generatedVideo?.taskId, isAutomatic = false) => {
    if (!taskId || !aiForm.dueDate) {
      setPublishError('교육 목록에 등록하려면 마감일을 지정해 주세요.')
      return false
    }

    try {
      setIsPublishing(true)
      setPublishError('')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const formData = new FormData()
      formData.append('due_date', aiForm.dueDate)
      formData.append('title', aiForm.title.trim() || `${aiForm.workType} 안전 교육`)
      formData.append('category', aiForm.category)
      formData.append('type', aiForm.educationType)
      await axios.post(`${API_BASE_URL}/api/education/veo-generate/${taskId}/publish`, formData, { headers })
      setAiStatus('published')
      setGeneratedVideo(null)
      setNotice(isAutomatic ? 'AI 품질 검수를 통과해 교육 목록에 자동 등록되었습니다.' : '검토한 AI 교육 영상이 교육 목록에 등록되었습니다.')
      // 등록은 이미 완료됐으므로 목록 갱신 실패가 등록 실패로 보이지 않도록 분리한다.
      try {
        await fetchAdminEducationData()
      } catch (refreshError) {
        console.warn('교육 목록을 새로고침하지 못했습니다. 화면을 새로고침하면 등록된 항목을 확인할 수 있습니다.', refreshError)
      }
      return true
    } catch (error) {
      console.error('AI 교육 영상 최종 등록 실패:', error)
      setPublishError(error.response?.data?.detail ?? error.message ?? '교육 목록 등록에 실패했습니다. 다시 시도해 주세요.')
      return false
    } finally {
      setIsPublishing(false)
    }
  }

  const cancelReview = () => {
    if (isCancellingReview) return
    setIsCancellingReview(true)
    window.setTimeout(() => {
      setGeneratedVideo(null)
      setAiStatus('idle')
      setPublishError('')
      setInitialGenerationRequest('')
      setRegenerationRequests([])
      setRegenerationRequestDraft('')
      setIsCancellingReview(false)
      setNotice('등록 전 검수를 취소했습니다.')
    }, 180)
  }

  if (loading) {
    return <EducationManagementLoadingSkeleton />
  }

  return (
    <section className="education-page education-management-page">
      <div className="education-creation-grid">
        <article ref={registerCardRef} className={`education-panel video-register-card${videoAction !== 'register' ? ' is-action-hidden' : ''}`} style={generatedCardHeight ? { height: `${generatedCardHeight}px` } : undefined}>
          <div className="card-heading-row">
            <PanelTitle icon={VideoFileOutlinedIcon} kicker="교육 영상 등록" title="교육 영상 추가" />
            <VideoActionTabs value={videoAction} onChange={setVideoAction} />
          </div>
          <p className="card-intro">영상을 등록하면 선택한 대상자의 교육 목록에 즉시 표시됩니다.</p>
          <form className="video-register-form" onSubmit={addVideoCourse}>
            <FormField label="교육명" required>
              <input value={courseForm.title} onChange={(event) => updateCourseForm('title', event.target.value)} placeholder="예: 3분기 지게차 안전교육" />
            </FormField>
            <FormField label="작업 유형" required>
              <StyledSelect value={courseForm.workType} options={workTypes} onChange={(value) => updateCourseForm('workType', value)} ariaLabel="작업 유형" />
            </FormField>
            <div className={courseForm.target === '일반유저' ? 'three-column-fields' : 'two-column-fields'}>
              <FormField label="이수 대상" required>
                <StyledSelect value={courseForm.target} options={targetGroups} onChange={(value) => updateCourseForm('target', value)} ariaLabel="이수 대상" />
              </FormField>
              {courseForm.target === '일반유저' && <FormField label="세부 카테고리" required>
                <StyledSelect value={courseForm.targetCategory} options={generalUserCategoryOptions} onChange={(value) => updateCourseForm('targetCategory', value)} ariaLabel="일반유저 세부 카테고리" />
              </FormField>}
              <FormField label="이수 유형" required>
                <StyledSelect value={courseForm.educationType} options={educationTypes} onChange={(value) => updateCourseForm('educationType', value)} ariaLabel="이수 유형" />
              </FormField>
            </div>
            <FormField label="마감일" required>
                <input type="date" value={courseForm.deadline} onChange={(event) => updateCourseForm('deadline', event.target.value)} />
            </FormField>
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

        <article ref={generatedCardRef} className={`education-panel ai-video-card${videoAction !== 'generate' && !generatedMeasureWidth ? ' is-action-hidden' : ''}${generatedMeasureWidth ? ' is-generated-measurement' : ''}${aiStatus === 'queued' ? ' is-generating' : ''}`} style={generatedMeasureWidth ? { width: `${generatedMeasureWidth}px` } : undefined} aria-busy={aiStatus === 'queued'}>
          <div className="ai-card-glow" />
          <div className="card-heading-row">
            <PanelTitle icon={MovieCreationOutlinedIcon} kicker="교육 영상 생성" title="교육 영상 생성" dark />
            <VideoActionTabs value={videoAction} onChange={setVideoAction} dark />
          </div>
          {!generatedVideo && <>
          {aiStatus === 'published' && <div className="ai-publish-notice" role="status"><CheckCircleOutlineRoundedIcon /><span><strong>교육 목록에 등록되었습니다.</strong> 교육 관리와 내 교육 리스트에서 확인할 수 있습니다.</span></div>}
          <p className="card-intro">교육 자료를 업로드하면 핵심 내용을 분석해 교육용 영상 초안을 만듭니다.</p>
          <form className="ai-video-form" onSubmit={requestAiVideo}>
            <label className="education-select"><span>교육명<b>*</b></span><input value={aiForm.title} onChange={(event) => updateAiForm('title', event.target.value)} placeholder="예: 창고 화재 예방 안전 교육" /></label>
            <EducationSelect label="작업 유형" value={aiForm.workType} options={workTypes} onChange={(value) => updateAiForm('workType', value)} required />
            <div className={aiForm.target === '일반유저' ? 'three-column-fields ai-generation-metadata' : 'two-column-fields ai-generation-metadata'}>
              <EducationSelect label="이수 대상" value={aiForm.target} options={targetGroups} onChange={updateAiTarget} required />
              {aiForm.target === '일반유저' && <EducationSelect label="세부 카테고리" value={aiForm.category} options={generalUserCategoryOptions} onChange={(value) => updateAiForm('category', value)} required />}
              <EducationSelect label="이수 유형" value={aiForm.educationType} options={educationTypes} onChange={(value) => updateAiForm('educationType', value)} required />
            </div>
            <label className="education-select"><span>교육 마감일<b>*</b></span><input type="date" value={aiForm.dueDate} onChange={(event) => updateAiForm('dueDate', event.target.value)} required /></label>
            <label className="education-select"><span>사용 장비<b>*</b></span><input value={aiForm.equipment} onChange={(event) => updateAiForm('equipment', event.target.value)} placeholder="예: 지게차, 안전모, 절단기" /></label>
            <label className="education-select"><span>위험 요인<b>*</b></span><input value={aiForm.riskFactor} onChange={(event) => updateAiForm('riskFactor', event.target.value)} placeholder="예: 충돌, 낙하, 끼임" /></label>
            <label className="education-select generation-request"><span>요청 사항</span><textarea value={aiForm.request} onChange={(event) => updateAiForm('request', event.target.value)} placeholder="예: 지게차 운전자의 시점으로, 보호구 착용을 강조해 주세요." rows="3" /></label>
            <button className={`upload-dropzone ai-upload${materialFile ? ' has-file' : ''}`} type="button" onClick={() => materialInputRef.current?.click()}>
              <input ref={materialInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.hwp,.txt" onChange={(event) => setMaterialFile(event.target.files?.[0] ?? null)} />
              <CloudUploadOutlinedIcon />
              <span><strong>{materialFile?.name ?? '교육 자료 업로드'}</strong><small>PDF, Word, PPT, HWP · 원본은 서버에 저장하지 않습니다</small></span>
            </button>
            <button className="ai-generate-button" type="submit"><VideoLibraryOutlinedIcon /> AI 교육 영상 생성</button>
            {aiStatus === 'error' && <p className="ai-form-status is-error">교육명, 사용 장비, 위험 요인, 교육 마감일을 입력해 주세요.</p>}
          </form>
          </>}
          {generatedVideo && aiStatus !== 'queued' && (
            <section className="ai-review-panel" aria-label="생성된 교육 영상 검토">
              <div className="ai-review-heading"><div><span>생성 결과 검토</span><h4>등록 전 영상을 확인해 주세요</h4></div></div>
              {generatedVideo.qualityReport?.visual_qa?.visual_score != null && <p className="ai-quality-score"><span className="ai-quality-warning" role="img" aria-label="주의">⚠️</span> AI 영상 품질 점수가 <strong>{generatedVideo.qualityReport.visual_qa.visual_score}점</strong>입니다. 기준 미달로 등록 전 검수가 필요합니다.</p>}
              <video className="ai-review-video" controls preload="metadata" src={generatedVideo.videoUrl}>생성된 교육 영상 미리보기</video>
              <section className="ai-request-editor is-editing">
                <span className="ai-request-tab">재생성 요청 사항</span>
                <div className="ai-request-editor-body"><textarea value={regenerationRequestDraft} onChange={(event) => setRegenerationRequestDraft(event.target.value)} placeholder="수정하고 싶은 장면, 강조할 내용, 말투 등을 입력해 주세요." rows="3" /><button className="ai-regenerate-confirm" type="button" disabled={aiStatus === 'queued' || isPublishing} onClick={() => requestAiVideo(null, true)}>영상 재생성</button></div>
              </section>
              <div className="ai-review-actions">
                <button className="ai-cancel-review-button" type="button" disabled={isCancellingReview || isPublishing} onClick={cancelReview}>{isCancellingReview ? '취소하는 중...' : '등록 취소'}</button>
                <button className="ai-publish-button" type="button" disabled={isPublishing} onClick={() => publishGeneratedVideo()}>{isPublishing ? '등록 중...' : '교육 목록에 등록 ▶'}</button>
              </div>
              {publishError && <p className="ai-review-error">{publishError}</p>}
            </section>
          )}
          {aiStatus === 'queued' && (
            <div className="ai-generation-overlay" role="status" aria-live="polite" aria-label={isRegenerating ? '교육 영상을 재생성하고 있습니다' : 'AI 교육 영상을 생성하고 있습니다'}>
              <span className="ai-generation-spinner" aria-hidden="true" />
              <strong>{isRegenerating ? '교육 영상을 재생성하고 있습니다' : 'AI 교육 영상을 생성하고 있습니다'}</strong>
              <p>자료를 분석하고 장면을 제작 중입니다.</p>
            </div>
          )}
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
        <article ref={courseTableCardRef} className="education-panel management-course-table-card">
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
                return <tr className={`${course.isCustom ? 'is-new-course ' : ''}is-course-row`} key={course.id} role="button" tabIndex="0" onClick={() => openAttendanceModal({ title: course.title, target: course.target, total: metric.assigned, completed: metric.completed, educationId: course.educationId })} onKeyDown={(event) => event.key === 'Enter' && openAttendanceModal({ title: course.title, target: course.target, total: metric.assigned, completed: metric.completed, educationId: course.educationId })}><td>{course.title}{course.isCustom && <span className="new-course-dot">NEW</span>}</td><td>{course.target}</td><td>{course.deadline}</td><td>{metric.assigned}명</td><td>{metric.completed}명</td><td><span className="course-rate"><b>{metric.progress}%</b><i><em style={{ width: `${metric.progress}%` }} /></i></span></td><td><span className={`education-status${course.isCustom ? ' status-waiting' : ` status-${course.id}`}`}>{course.status}</span></td></tr>
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
      {attendanceDetail && <AttendanceModal detail={attendanceDetail} attendees={visibleAttendees} loading={attendanceLoading} filter={attendanceFilter} onFilterChange={setAttendanceFilter} search={attendeeSearch} onSearchChange={setAttendeeSearch} onClose={() => setAttendanceDetail(null)} />}
    </section>
  )
}

function EducationManagementLoadingSkeleton() {
  return <section className="education-page education-management-page education-management-loading-skeleton" aria-busy="true" aria-label="교육 관리 데이터를 불러오는 중입니다">
    <div className="education-creation-grid skeleton-creation-grid"><article className="education-panel video-register-card skeleton-form-card"><div className="skeleton-card-heading"><div><span className="skeleton-block skeleton-line short" /><span className="skeleton-block skeleton-line title" /></div><span className="skeleton-block skeleton-tabs" /></div><span className="skeleton-block skeleton-line long" /><div className="skeleton-form-fields"><span className="skeleton-block skeleton-input" /><div><span className="skeleton-block skeleton-input" /><span className="skeleton-block skeleton-input" /></div></div><span className="skeleton-block skeleton-tabs" /><span className="skeleton-block skeleton-upload" /><span className="skeleton-block skeleton-button" /></article><article className="education-panel ai-video-card skeleton-form-card"><div className="skeleton-card-heading"><div><span className="skeleton-block skeleton-line short" /><span className="skeleton-block skeleton-line title" /></div><span className="skeleton-block skeleton-tabs" /></div><span className="skeleton-block skeleton-line long" /><div className="skeleton-form-fields"><span className="skeleton-block skeleton-input" /><span className="skeleton-block skeleton-input" /><span className="skeleton-block skeleton-upload" /></div><span className="skeleton-block skeleton-button" /></article></div>
    <div className="management-overview-row"><article className="education-panel completion-summary-card skeleton-completion-card"><div className="skeleton-card-heading"><div><span className="skeleton-block skeleton-line short" /><span className="skeleton-block skeleton-line title" /></div><span className="skeleton-block skeleton-select" /></div><div className="skeleton-metrics">{[1, 2, 3, 4, 5].map((item) => <span className="skeleton-block" key={item} />)}</div></article><article className="education-panel management-course-table-card skeleton-course-table-card"><div className="skeleton-card-heading"><div><span className="skeleton-block skeleton-line short" /><span className="skeleton-block skeleton-line title" /></div><span className="skeleton-block skeleton-count" /></div><div className="skeleton-toolbar"><span className="skeleton-block" /><span className="skeleton-block" /></div><div className="skeleton-management-table"><span className="skeleton-block skeleton-table-header" />{[1, 2, 3, 4, 5].map((item) => <span className="skeleton-block skeleton-table-row" key={item} />)}</div><div className="skeleton-table-footer"><span className="skeleton-block" /><span className="skeleton-block" /></div></article></div>
  </section>
}

function CompletionMetric({ item, overall, metricIndex, onOpen }) {
  const MetricIcon = completionMetricIcons[metricIndex] ?? GroupsOutlinedIcon
  return <div className={`completion-metric metric-tone-${metricIndex}${overall ? ' is-featured is-overall' : ''}`} style={{ '--metric-color': completionColors[metricIndex % completionColors.length], '--animation-delay': `${metricIndex * 90}ms` }} role="button" tabIndex="0" onClick={onOpen} onKeyDown={(event) => event.key === 'Enter' && onOpen()}><div className="metric-label"><span className="metric-icon"><MetricIcon /></span><strong>{item.label}</strong></div><div className="metric-value-row"><strong>{item.value}<small>%</small></strong><span className="metric-ring" style={{ '--completion-rate': `${item.value}%` }}><i /></span></div><small>{item.completed} / {item.total}명</small></div>
}

function AttendanceModal({ detail, attendees, loading, filter, onFilterChange, search, onSearchChange, onClose }) {
  const filters = ['전체', '이수', '미이수']
  const total = detail.total
  const incomplete = Math.max(0, total - detail.completed)
  const rate = total ? Math.round((detail.completed / total) * 100) : 0
  return <div className="attendance-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="attendance-modal" role="dialog" aria-modal="true" aria-busy={loading} aria-label={`${detail.title} 대상자 현황`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="attendance-modal-header"><div><span>교육 대상자 현황</span><h3>{detail.title}</h3><p>{detail.target} · 이수 현황을 확인하고 대상자를 검색할 수 있습니다.</p></div><button type="button" aria-label="상세 창 닫기" onClick={onClose}><CloseRoundedIcon /></button></header>
      <div className="attendance-summary"><div className="attendance-total"><span>이수 대상</span><AnimatedNumber value={total} suffix="명" /></div><div className="attendance-complete"><span>이수 완료</span><AnimatedNumber value={detail.completed} suffix="명" /></div><div className="attendance-incomplete"><span>미이수</span><AnimatedNumber value={incomplete} suffix="명" /></div><div className="attendance-rate"><span>이수율</span><AnimatedNumber value={rate} suffix="%" /><i><em style={{ width: `${rate}%` }} /></i></div></div>
      <div className="attendance-tools"><div className="attendance-filter-tabs" role="tablist">{filters.map((item) => <button className={filter === item ? 'is-active' : ''} key={item} type="button" onClick={() => onFilterChange(item)}>{item}</button>)}</div><label className="attendance-search"><SearchRoundedIcon /><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="이름 또는 부서 검색" /></label></div>
      <div className="attendance-list" key={`${filter}-${search}`}><div className="attendance-list-head"><span>대상자</span><span>교육명</span><span>소속</span><span>이수 상태</span><span>이수 일시</span></div>{attendees.length ? attendees.map((person, index) => <div className="attendance-list-row" key={person.id} style={{ '--row-delay': `${Math.min(index, 10) * 45}ms` }}><span><b>{person.name.slice(0, 1)}</b>{person.name}</span><span className="attendance-education-title">{person.educationTitle}</span><span>{person.team}</span><span><i className={person.status === '이수' ? 'is-complete' : ''}>{person.status}</i></span><span>{person.date ?? '-'}</span></div>) : <p className="attendance-empty">조건에 맞는 대상자가 없습니다.</p>}</div>
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

function EducationSelect({ label, value, options, onChange, required = false }) {
  return <label className="education-select"><span>{label}{required && <b>*</b>}</span><StyledSelect value={value} options={options} onChange={onChange} ariaLabel={label} /></label>
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
import { BACKEND_API_URL } from '../config/api.js'
