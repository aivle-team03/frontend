import { useMemo, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Filtering from '../components/Board/Filtering.jsx'
import FormModal from '../components/Board/FormModal.jsx'
import ReportList from '../components/Board/ReportList.jsx'
import ReportDetail from '../components/Board/ReportDetail.jsx'
import ActionContentModal from '../components/Board/ActionContentModal.jsx'
import { BOARD_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/board.css'

function BoardPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  // 필터링 상태
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('전체')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [keyword, setKeyword] = useState('')
  const [summaryFilter, setSummaryFilter] = useState('all')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [pendingActionStatus, setPendingActionStatus] = useState(null)
  const canEditStatus = true

  const API_BASE_URL = 'http://127.0.0.1:8000'

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await axios.get(`${API_BASE_URL}/api/boards`, {
        headers,
        params: { page: 1, size: 100 }
      })

      const rawItems = response.data.items || response.data || []

      const formattedReports = rawItems.map((item) => {
        let photoUrl = item.image_url || ''
        if (photoUrl && photoUrl.startsWith('/static')) {
          photoUrl = `${API_BASE_URL}${photoUrl}`
        }

        let statusKey = 'registered'

        if (item.status === '등록' || item.status === 'registered') statusKey = 'registered'
        if (item.status === '접수' || item.status === 'received') statusKey = 'received'
        if (item.status === '조치 중' || item.status === '조치중' || item.status === 'in_progress') statusKey = 'progress'
        if (item.status === '조치 완료' || item.status === '완료' || item.status === 'completed') statusKey = 'done'
        if (item.status === '반려' || item.status === 'rejected') statusKey = 'rejected'

        return {
          id: item.board_id || item.id,
          category: item.category_name || item.event_category_id || '기타',
          title: item.title || '',
          description: item.board_contents || '',
          riskLevel: item.risk_level || 'M',
          riskLabel: item.risk_label || '보통',
          location: item.location || '위치 미지정',
          reporter: item.user?.name || item.author || '익명',
          photoName: item.image_url ? '첨부이미지.jpg' : '',
          photoUrl: photoUrl,
          reportedAt: item.created_at ? item.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: item.status || '접수',
          statusKey: statusKey,
          actionContent: item.action_content || item.actionContent || '',
        }
      })

      setReports(formattedReports)
    } catch (error) {
      console.error('게시글 목록 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  const boardSummary = useMemo(() => {
    const statusCount = reports.reduce((counts, report) => ({
      ...counts,
      [report.statusKey]: (counts[report.statusKey] ?? 0) + 1,
    }), {})

    return (BOARD_MOCK_DATA.summary || [
      { key: 'all', label: '전체' },
      { key: 'received', label: '접수' },
      { key: 'in_progress', label: '조치중' },
      { key: 'completed', label: '완료' },
    ]).map((item) => ({
      ...item,
      value: item.key === 'all' ? reports.length : statusCount[item.key] ?? 0,
    }))
  }, [reports])

  // 필터링 적용 목록
  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesCategory = selectedCategory === '전체' || report.category === selectedCategory
    const matchesRisk = selectedRiskLevel === '전체' || report.riskLevel === selectedRiskLevel
    const matchesSummary = summaryFilter === 'all' || report.statusKey === summaryFilter
    const matchesDate = report.reportedAt >= startDate && report.reportedAt <= endDate
    const searchTarget = `${report.title} ${report.description} ${report.location}`.toLowerCase()
    const matchesKeyword = searchTarget.includes(keyword.trim().toLowerCase())

    return matchesCategory && matchesRisk && matchesSummary && matchesDate && matchesKeyword
  }), [endDate, keyword, reports, selectedCategory, selectedRiskLevel, startDate, summaryFilter])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId),
    [reports, selectedReportId],
  )

  const updateReportStatus = async (reportId, statusKey, actionContent = '') => {
    const nextStatus = BOARD_MOCK_DATA.statusOptions.find((status) => status.key === statusKey)
    if (!nextStatus) return false

    try {
      const token = localStorage.getItem('token')

      const requestBody = actionContent
        ? { status: nextStatus.label, action_content: actionContent }
        : { status: nextStatus.label }

      const response = await axios.patch(
        `http://127.0.0.1:8000/api/boards/${reportId}/status`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const updatedBoard = response.data

      setReports((currentReports) =>
        currentReports.map((report) => {
          if (report.id === reportId) {
            const newStatus = updatedBoard.status || nextStatus.label

            let newStatusKey = statusKey
            if (newStatus === '등록') newStatusKey = 'registered'
            if (newStatus === '접수') newStatusKey = 'received'
            if (newStatus === '조치 중' || newStatus === '조치중') newStatusKey = 'progress'
            if (newStatus === '조치 완료' || newStatus === '완료') newStatusKey = 'done'
            if (newStatus === '반려') newStatusKey = 'rejected'

            return {
              ...report,
              status: newStatus,
              statusKey: newStatusKey,
              actionContent: actionContent || report.actionContent,
            }
          }
          return report
        })
      )

      return true
    } catch (error) {
      console.error(`게시글 #${reportId} 상태 변경 실패:`, error)

      if (error.response?.status === 403) {
        alert('상태 변경 권한이 없습니다.')
      } else if (error.response?.status === 404) {
        alert('존재하지 않는 게시글입니다.')
      } else {
        alert('게시글 상태 변경 중 오류가 발생했습니다.')
      }
      return false
    }
  }

  const requestReportStatusUpdate = (reportId, statusKey) => {
    if (statusKey === 'done') {
      setPendingActionStatus({ reportId, statusKey })
      return
    }

    updateReportStatus(reportId, statusKey)
  }

  const createReport = async (reportForm) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      formData.append('title', reportForm.title.trim())
      formData.append('board_contents', reportForm.description.trim())
      formData.append('status', reportForm.status || '접수')

      if (reportForm.location) {
        formData.append('location', reportForm.location.trim())
      }
      if (reportForm.categoryId) {
        formData.append('event_category_id', reportForm.categoryId)
      }

      if (reportForm.photoFile instanceof File) {
        formData.append('image', reportForm.photoFile)
      }

      await axios.post('http://127.0.0.1:8000/api/boards', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      alert('위험 신고가 성공적으로 등록되었습니다.')
      setIsReportModalOpen(false)
      fetchBoards() // 목록 재조회
    } catch (error) {
      console.error('게시글 등록 실패:', error)
      alert('위험 신고 등록 중 오류가 발생했습니다.')
    }
  }

  const resetFilters = () => {
    setSelectedCategory('전체')
    setSelectedRiskLevel('전체')
    setStartDate('2026-01-01')
    setEndDate('2026-12-31')
    setKeyword('')
    setSummaryFilter('all')
  }

  const openReportDetail = (reportId) => setSelectedReportId(reportId)
  const closeReportDetail = () => setSelectedReportId(null)
  const closeActionContentModal = () => setPendingActionStatus(null)
  const pendingActionReport = pendingActionStatus
    ? reports.find((report) => report.id === pendingActionStatus.reportId)
    : null

  const submitActionContent = async (actionContent) => {
    if (!pendingActionStatus) return

    const isUpdated = await updateReportStatus(
      pendingActionStatus.reportId,
      pendingActionStatus.statusKey,
      actionContent,
    )

    if (isUpdated) {
      setPendingActionStatus(null)
    }
  }

  if (loading) {
    return <div className="board-page" style={{ padding: '40px', textAlign: 'center' }}>게시판 데이터를 불러오는 중...</div>
  }

  return (
    <section className="board-page" aria-label="위험신고 게시판">
      <div className="board-title-row">
        <button className="board-report-button" type="button" onClick={() => setIsReportModalOpen(true)}>
          위험 신고하기
        </button>
      </div>

      <div className="board-summary-grid" aria-label="위험 신고 현황">
        {boardSummary.map((item) => (
          <button
            className={`board-summary-card summary-${item.key}${summaryFilter === item.key ? ' is-selected' : ''}`}
            type="button"
            key={item.label}
            onClick={() => setSummaryFilter(item.key)}
            aria-pressed={summaryFilter === item.key}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </button>
        ))}
      </div>

      <Filtering
        categories={BOARD_MOCK_DATA.categories}
        riskOptions={BOARD_MOCK_DATA.riskOptions}
        selectedCategory={selectedCategory}
        selectedRiskLevel={selectedRiskLevel}
        startDate={startDate}
        endDate={endDate}
        keyword={keyword}
        onChangeCategory={setSelectedCategory}
        onChangeRiskLevel={setSelectedRiskLevel}
        onChangeStartDate={setStartDate}
        onChangeEndDate={setEndDate}
        onChangeKeyword={setKeyword}
        onReset={resetFilters}
      />

      <ReportList
        reports={filteredReports}
        statusOptions={BOARD_MOCK_DATA.statusOptions}
        canEditStatus={canEditStatus}
        onOpenReport={openReportDetail}
        onUpdateStatus={requestReportStatusUpdate}
      />

      {isReportModalOpen && (
        <FormModal
          categories={BOARD_MOCK_DATA.categories}
          riskOptions={BOARD_MOCK_DATA.riskOptions}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={createReport}
        />
      )}

      {selectedReport && (
        <ReportDetail report={selectedReport} onClose={closeReportDetail} />
      )}

      {pendingActionReport && (
        <ActionContentModal
          report={pendingActionReport}
          onClose={closeActionContentModal}
          onSubmit={submitActionContent}
        />
      )}
    </section>
  )
}

export default BoardPage
