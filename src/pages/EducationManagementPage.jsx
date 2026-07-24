import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DonutSmallRoundedIcon from '@mui/icons-material/DonutSmallRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import operationGuideImage from '../assets/education-operation-guide.png'
import { EDUCATION_MOCK_DATA } from '../mocks/mockData.js'

const API_BASE_URL = 'http://127.0.0.1:8000'

const outputIcons = {
  Word: DescriptionOutlinedIcon,
  PowerPoint: SlideshowOutlinedIcon,
  PDF: PictureAsPdfOutlinedIcon,
}

const completionMetricIcons = [
  GroupsOutlinedIcon,
  PersonAddAltRoundedIcon,
  BadgeOutlinedIcon,
  EngineeringRoundedIcon,
  HealthAndSafetyOutlinedIcon,
]

function EducationManagementPage() {
  const { generationOptions } = EDUCATION_MOCK_DATA

  const [roleStats, setRoleStats] = useState([])
  const [courseList, setCourseList] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [selectedTarget, setSelectedTarget] = useState('전체')
  const [courseSearch, setCourseSearch] = useState('')
  const [tableTarget, setTableTarget] = useState('전체')

  const [options, setOptions] = useState({
    workTypes: generationOptions.workTypes[0],
    equipment: generationOptions.equipment[0],
    risks: generationOptions.risks[0],
    output: 'Word',
    request: '',
  })

  // ==========================================
  // 백엔드 API 연동 (상/하단 데이터 동기화)
  // ==========================================
  useEffect(() => {
    fetchAdminEducationData()
  }, [])

  const fetchAdminEducationData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // 1. 하단 '대상자별 교육 리스트' API 호출
      const statusRes = await axios.get(`${API_BASE_URL}/api/admin/education/status`, { headers })

      if (statusRes.data && Array.isArray(statusRes.data)) {
        const today = new Date().toISOString().slice(0, 10)

        // 2. 하단 리스트 데이터 포맷팅
        const formattedCourses = statusRes.data.map((item) => {
          const completedObj = item.status_counts?.find((s) => s.status === '이수')
          const completedCount = completedObj ? completedObj.count : 0
          const totalTargetCount = item.target_count ?? 0

          const dueDate = item.due_date ? String(item.due_date).slice(0, 10) : '-'
          const isPastDue = dueDate !== '-' && dueDate < today

          let displayStatus = '진행 중'
          if (totalTargetCount > 0 && completedCount === totalTargetCount) {
            displayStatus = '이수 완료'
          } else if (isPastDue) {
            displayStatus = '미이수'
          }

          return {
            id: item.education_id,
            title: item.title,
            target: item.role || '전체',
            deadline: dueDate,
            assigned: totalTargetCount,
            completed: completedCount,
            progress: item.completion_rate ?? 0,
            status: displayStatus,
          }
        })

        setCourseList(formattedCourses)

        // 3. 🚀 [핵심] 하단 리스트 수치를 바탕으로 상단 카드 수치 자동 합산 집계
        const roles = ['신규 근로자', '일반 작업자', '특수 작업자', '안전 관리자']

        const calcRoleStats = (roleName) => {
          const roleCourses = formattedCourses.filter(
            (c) => c.target === roleName || c.target === '전체'
          )
          const totalAssigned = roleCourses.reduce((sum, c) => sum + c.assigned, 0)
          const totalCompleted = roleCourses.reduce((sum, c) => sum + c.completed, 0)
          const rate = totalAssigned > 0 ? Number(((totalCompleted / totalAssigned) * 100).toFixed(1)) : 0

          return { total: totalAssigned, completed: totalCompleted, value: rate }
        }

        const grandTotal = formattedCourses.reduce((sum, c) => sum + c.assigned, 0)
        const grandCompleted = formattedCourses.reduce((sum, c) => sum + c.completed, 0)
        const grandRate = grandTotal > 0 ? Number(((grandCompleted / grandTotal) * 100).toFixed(1)) : 0

        const formattedStats = [
          {
            label: '전체',
            value: grandRate,
            completed: grandCompleted,
            total: grandTotal,
          },
          ...roles.map((roleName) => {
            const stat = calcRoleStats(roleName)
            return {
              label: roleName,
              value: stat.value,
              completed: stat.completed,
              total: stat.total,
            }
          }),
        ]

        setRoleStats(formattedStats)
      }
    } catch (error) {
      console.error('API 요청 실패 에러 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      console.warn('관리자 교육 데이터 연동 실패, Mock 데이터를 표시합니다:', error)
      setRoleStats(EDUCATION_MOCK_DATA.completion)
      setCourseList(
        EDUCATION_MOCK_DATA.requiredCourses.map((c) => ({
          ...c,
          assigned: 40,
          completed: 28,
          progress: 70,
        }))
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAIGenerate = async () => {
    try {
      setGenerating(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const payload = {
        work_type: options.workTypes,
        equipment: options.equipment,
        risk_factor: options.risks,
        output_format: options.output,
        additional_request: options.request,
      }

      const response = await axios.post(`${API_BASE_URL}/api/admin/education/ai-generate`, payload, { headers })
      alert(`AI 교육 자료가 생성되었습니다!\n자료 제목: ${response.data.title || '생성 완료'}`)
      fetchAdminEducationData()
    } catch (error) {
      console.error('AI 교육 자료 생성 실패:', error)
      alert('AI 교육 자료 생성 도중 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const orderedCompletion = useMemo(() => {
    if (!roleStats || roleStats.length === 0) return []
    return [...roleStats.filter((item) => item.label === '전체'), ...roleStats.filter((item) => item.label !== '전체')]
  }, [roleStats])

  const selectedCompletion = roleStats.find((item) => item.label === selectedTarget) ?? orderedCompletion[0] ?? { value: 0, completed: 0, total: 0, label: '전체' }
  const selectedTargetCourses = courseList.filter((course) => selectedTarget === '전체' || course.target === selectedTarget || course.target === '전체')
  const targetOptions = ['전체', ...new Set(courseList.map((course) => course.target).filter((target) => target !== '전체'))]

  const visibleCourses = useMemo(() => {
    return courseList.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(courseSearch.trim().toLowerCase())
      const matchesTarget = tableTarget === '전체' || course.target === tableTarget || course.target === '전체'
      return matchesSearch && matchesTarget
    }).slice(0, 5)
  }, [courseSearch, courseList, tableTarget])

  const updateOption = (key, value) => setOptions((current) => ({ ...current, [key]: value }))
  const OutputIcon = outputIcons[options.output]

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        교육 관리 데이터 연결 중...
      </div>
    )
  }

  return (
    <section className="education-page education-management-page management-dashboard">
      {statusStyles}
      <div className="management-dashboard-main">

        {/* 상단 카드: 교육 이수 현황 */}
        <article className="education-panel completion-summary-card">
          <div className="management-card-heading">
            <PanelTitle icon={DonutSmallRoundedIcon} kicker="교육 현황" title="교육 이수 현황" />
            <select
              className="management-filter-select"
              aria-label="교육 이수 현황 기준"
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
            >
              {orderedCompletion.map((item) => (
                <option key={item.label}>{item.label}</option>
              ))}
            </select>
          </div>

          {selectedTarget === '전체' ? (
            <div className="completion-metric-grid">
              {orderedCompletion.map((item, index) => (
                <CompletionMetric item={item} key={item.label} overall={item.label === '전체'} metricIndex={index} />
              ))}
            </div>
          ) : (
            <div className="completion-focus-card">
              <div className="completion-focus-chart" style={{ '--completion-rate': `${selectedCompletion.value}%` }}>
                <div>
                  <strong>{selectedCompletion.value}%</strong>
                  <span>이수율</span>
                </div>
              </div>
              <div className="completion-focus-copy">
                <span>선택 대상</span>
                <h4>{selectedCompletion.label}</h4>
                <p>
                  <strong>{selectedCompletion.completed}명</strong> 이수 / 전체 {selectedCompletion.total}명
                </p>
                <div className="completion-focus-progress">
                  <i style={{ width: `${selectedCompletion.value}%` }} />
                </div>
              </div>
              <div className="completion-focus-courses">
                <div>
                  <strong>이수 대상 교육</strong>
                  <span>{selectedTargetCourses.length}개 과정</span>
                </div>
                {selectedTargetCourses.slice(0, 2).map((course) => (
                  <p key={course.id}>
                    <span>{course.title}</span>
                    <b className={`education-status status-${course.id}`}>{course.status}</b>
                  </p>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* 하단 테이블: 대상자별 교육 리스트 */}
        <article className="education-panel management-course-table-card">
          <div className="management-card-heading table-card-heading">
            <PanelTitle icon={GroupsOutlinedIcon} kicker="교육 대상자" title="대상자별 교육 리스트" />
            <span className="course-count">총 {courseList.length}개 과정</span>
          </div>

          <div className="course-table-toolbar">
            <label className="course-search">
              <SearchRoundedIcon />
              <input
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="교육명 검색"
              />
            </label>
            <select
              value={tableTarget}
              onChange={(event) => setTableTarget(event.target.value)}
              aria-label="교육 대상 필터"
            >
              {targetOptions.map((target) => (
                <option key={target}>{target}</option>
              ))}
            </select>
          </div>

          <div className="management-table-wrap">
            <table className="management-course-table">
              <thead>
                <tr>
                  <th>교육명</th>
                  <th>대상</th>
                  <th>마감일</th>
                  <th>이수 대상</th>
                  <th>이수 완료</th>
                  <th>이수율</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {visibleCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.target}</td>
                    <td>{course.deadline}</td>
                    <td>{course.assigned}명</td>
                    <td>{course.completed}명</td>
                    <td>
                      <span className="course-rate">
                        <b>{course.progress}%</b>
                        <i>
                          <em style={{ width: `${course.progress}%` }} />
                        </i>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`education-status ${course.status === '미이수'
                          ? 'status-red'
                          : course.status === '이수 완료'
                            ? 'status-yellow'
                            : 'status-blue'
                          }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="management-table-footer">
            <span>표시 중 {visibleCourses.length}개</span>
            <span>1 / {Math.max(1, Math.ceil(visibleCourses.length / 5))}</span>
          </div>
        </article>
      </div>

      {/* 우측 사이드 영역 */}
      <aside className="management-dashboard-side">
        <article className="education-panel generation-panel management-generation-panel dashboard-generation-card">
          <PanelTitle icon={PostAddOutlinedIcon} kicker="교육 자료 제작" title="AI 교육 자료 생성" dark />
          <div className="generation-steps">
            <span className="is-current">
              <b>1</b> 정보 입력
            </span>
            <span>
              <b>2</b> 자료 생성
            </span>
            <span>
              <b>3</b> 결과 확인
            </span>
          </div>

          <div className="generation-form management-form">
            <EducationSelect
              label="작업 유형"
              value={options.workTypes}
              options={generationOptions.workTypes}
              onChange={(value) => updateOption('workTypes', value)}
            />
            <EducationSelect
              label="사용 장비"
              value={options.equipment}
              options={generationOptions.equipment}
              onChange={(value) => updateOption('equipment', value)}
            />
            <EducationSelect
              label="위험 요인"
              value={options.risks}
              options={generationOptions.risks}
              onChange={(value) => updateOption('risks', value)}
            />
            <EducationSelect
              label="출력 산출물"
              value={options.output}
              options={['Word', 'PowerPoint', 'PDF']}
              onChange={(value) => updateOption('output', value)}
            />
            <label className="generation-request">
              <span>요청사항</span>
              <textarea
                value={options.request}
                placeholder="강조할 작업 절차, 대상자 수준, 포함할 항목을 입력하세요."
                onChange={(event) => updateOption('request', event.target.value)}
              />
            </label>
          </div>

          <button
            className="generation-button"
            type="button"
            onClick={handleAIGenerate}
            disabled={generating}
          >
            {generating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <>
                <OutputIcon fontSize="small" /> {options.output} 자료 생성
              </>
            )}
          </button>
          <p className="generation-helper">입력한 현장 조건을 기준으로 교육 자료 초안을 생성합니다.</p>
        </article>

        <article className="education-panel dashboard-operation-card">
          <div className="operation-compact-copy">
            <PanelTitle icon={AdminPanelSettingsOutlinedIcon} title="교육 운영 기준" />
            <p>대상자별 수강 상태와 마감 일정을 정기적으로 확인해 주세요.</p>
            <ul>
              <li>
                <CheckCircleOutlineRoundedIcon /> 필수 교육의 이수율과 마감일 우선 확인
              </li>
              <li>
                <CheckCircleOutlineRoundedIcon /> 미이수자에게 마감 전 수강 일정 안내
              </li>
              <li>
                <CheckCircleOutlineRoundedIcon /> 생성 자료 검토 후 현장 배포
              </li>
            </ul>
          </div>
          <img src={operationGuideImage} alt="" aria-hidden="true" />
        </article>
      </aside>
    </section>
  )
}

function CompletionMetric({ item, overall, metricIndex }) {
  const MetricIcon = completionMetricIcons[metricIndex] ?? GroupsOutlinedIcon
  return (
    <div className={`completion-metric metric-tone-${metricIndex}${overall ? ' is-featured is-overall' : ''}`}>
      <div className="metric-label">
        <span className="metric-icon">
          <MetricIcon />
        </span>
        <strong>{item.label}</strong>
      </div>
      <div className="metric-value-row">
        <strong>{item.value}%</strong>
        {overall && (
          <span className="metric-ring" style={{ '--completion-rate': `${item.value}%` }}>
            <i />
          </span>
        )}
      </div>
      {!overall && (
        <div className="metric-progress">
          <i style={{ width: `${item.value}%` }} />
        </div>
      )}
      <small>
        {item.completed} / {item.total}명
      </small>
    </div>
  )
}

function EducationSelect({ label, value, options, onChange }) {
  return (
    <label className="education-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
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