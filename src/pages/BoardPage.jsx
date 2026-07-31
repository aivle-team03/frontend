import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Filtering from '../components/Board/Filtering.jsx'
import FormModal from '../components/Board/FormModal.jsx'
import ReportList from '../components/Board/ReportList.jsx'
import ReportDetail from '../components/Board/ReportDetail.jsx'
import {
  getStoredBoardReportStatuses,
  getStoredChecklistManagementRecords,
  saveBoardReportStatus,
  saveChecklistManagementRecords,
} from '../utils/checklistStatusStorage.js'
import '../styles/board.css'

function BoardPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('전체')
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [keyword, setKeyword] = useState('')
  const [summaryFilter, setSummaryFilter] = useState('all')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(null)

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.get(`${API_BASE_URL}/api/boards`, {
        headers,
        params: { page: 1, size: 100 },
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
      setBoardCategoryOptions([])
      setReports([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBoards()
  }, [fetchBoards])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const userData = response.data
        setCurrentUserName(userData?.name || userData?.user_id || '익명')
      } catch (error) {
        console.error('현재 사용자 정보 로드 실패:', error)
      }
    }

    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const syncStoredStatuses = () => {
      setReports((currentReports) => currentReports.map(applyStoredBoardStatus))
    }

    window.addEventListener('focus', syncStoredStatuses)
    window.addEventListener('storage', syncStoredStatuses)
    window.addEventListener('board-report-statuses-updated', syncStoredStatuses)

    return () => {
      window.removeEventListener('focus', syncStoredStatuses)
      window.removeEventListener('storage', syncStoredStatuses)
      window.removeEventListener('board-report-statuses-updated', syncStoredStatuses)
    }
  }, [])

  const boardSummary = useMemo(() => {
    const statusCount = reports.reduce((counts, report) => ({
      ...counts,
      [report.statusKey]: (counts[report.statusKey] ?? 0) + 1,
    }), {})

    return SUMMARY_OPTIONS.map((item) => ({
      ...item,
      value: item.key === 'all' ? reports.length : statusCount[item.key] ?? 0,
    }))
  }, [reports])

  const filteredReports = useMemo(() => reports
    .filter((report) => {
      const matchesCategory = selectedCategory === '전체' || report.category === selectedCategory
      const matchesRisk = selectedRiskLevel === '전체' || report.riskLevel === selectedRiskLevel
      const matchesSummary = summaryFilter === 'all' || report.statusKey === summaryFilter
      const matchesDate = report.reportedAt >= startDate && report.reportedAt <= endDate
      const searchTarget = `${report.title} ${report.description} ${report.location}`.toLowerCase()
      const matchesKeyword = searchTarget.includes(keyword.trim().toLowerCase())

      return matchesCategory && matchesRisk && matchesSummary && matchesDate && matchesKeyword
    })
    .sort((a, b) => {
      const dateOrder = b.reportedAt.localeCompare(a.reportedAt)
      if (dateOrder !== 0) return dateOrder

      return getSortableReportId(b.id) - getSortableReportId(a.id)
    }), [endDate, keyword, reports, selectedCategory, selectedRiskLevel, startDate, summaryFilter])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId),
    [reports, selectedReportId],
  )
  const selectedReceivableCount = reports.filter((report) => selectedReportIds.includes(report.id) && report.statusKey === 'registered').length

  const updateReportStatus = async (reportId, statusKey) => {
    const nextStatus = STATUS_OPTIONS.find((status) => status.key === statusKey)
    if (!nextStatus) return false

    const reportToUpdate = reports.find((report) => report.id === reportId)
    const applyLocalUpdate = (serverStatus = nextStatus.label) => {
      const nextStatusKey = getStatusKey(serverStatus)
      setReports((currentReports) => currentReports.map((report) => (
        report.id === reportId
          ? {
              ...report,
              status: getStatusLabel(nextStatusKey),
              statusKey: nextStatusKey,
            }
          : report
      )))
      saveBoardReportStatus(reportId, { status: getStatusLabel(nextStatusKey), statusKey: nextStatusKey })
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(`${API_BASE_URL}/api/boards/${reportId}/status`, { status: nextStatus.label }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      applyLocalUpdate(response.data.status)
    } catch (error) {
      console.error(`게시글 #${reportId} 상태 변경 실패:`, error)
      applyLocalUpdate()
    }

    if (statusKey === 'received' && reportToUpdate) {
      saveBoardReportToChecklistManagement({ ...reportToUpdate, status: '접수', statusKey: 'received' })
    }

    return true
  }

  const toggleSelectedReport = (reportId) => {
    setSelectedReportIds((current) => (
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId]
    ))
  }

  const toggleAllVisibleReports = (checked) => {
    const receivableIds = filteredReports
      .filter((report) => report.statusKey === 'registered')
      .map((report) => report.id)

    setSelectedReportIds((current) => (
      checked
        ? [...new Set([...current, ...receivableIds])]
        : current.filter((id) => !receivableIds.includes(id))
    ))
  }

  const receiveSelectedReports = async () => {
    const selectedReports = reports.filter((report) => selectedReportIds.includes(report.id) && report.statusKey === 'registered')
    if (!selectedReports.length) return

    await Promise.all(selectedReports.map((report) => updateReportStatus(report.id, 'received')))
    setSelectedReportIds((current) => current.filter((id) => !selectedReports.some((report) => report.id === id)))
  }

  const createReport = async (reportForm) => {
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()

      formData.append('title', reportForm.title.trim())
      formData.append('board_contents', reportForm.description.trim())
      formData.append('status', '등록')

      if (reportForm.location) formData.append('location', reportForm.location.trim())
      if (reportForm.categoryId) formData.append('event_category_id', reportForm.categoryId)
      if (reportForm.photoFile instanceof File) formData.append('image', reportForm.photoFile)

      await axios.post(`${API_BASE_URL}/api/boards`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      alert('위험 신고가 등록되었습니다.')
      setIsReportModalOpen(false)
      fetchBoards()
    } catch (error) {
      console.error('게시글 등록 실패:', error)
      const createdReport = {
        id: Date.now(),
        category: reportForm.category,
        title: reportForm.title.trim(),
        description: reportForm.description.trim(),
        riskLevel: reportForm.riskLevel,
        riskLabel: getRiskLabel(reportForm.riskLevel),
        location: reportForm.location.trim(),
        reporter: reportForm.reporter.trim(),
        photoName: reportForm.photoName,
        photoUrl: reportForm.photoUrl,
        reportedAt: new Date().toISOString().slice(0, 10),
        status: '등록',
        statusKey: 'registered',
        actionContent: '',
      }
      setReports((current) => [createdReport, ...current])
      setIsReportModalOpen(false)
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

  if (loading) {
    return <div className="board-page board-loading">게시글 데이터를 불러오는 중...</div>
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
        categories={['전체', ...boardCategoryOptions.map((category) => category.name)]}
        riskOptions={RISK_OPTIONS}
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

      <div className="board-bulk-toolbar">
        <span>선택 <strong>{selectedReceivableCount}</strong>건</span>
        <button type="button" disabled={!selectedReceivableCount} onClick={receiveSelectedReports}>
          접수
        </button>
      </div>

      <ReportList
        reports={filteredReports}
        selectedReportIds={selectedReportIds}
        onOpenReport={openReportDetail}
        onToggleReport={toggleSelectedReport}
        onToggleAllReports={toggleAllVisibleReports}
      />

      {isReportModalOpen && (
        <FormModal
          categories={boardCategoryOptions}
          riskOptions={RISK_OPTIONS}
          reporterName={currentUserName}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={createReport}
        />
      )}

      {selectedReport && (
        <ReportDetail report={selectedReport} onClose={closeReportDetail} />
      )}
    </section>
  )
}

export default BoardPage
