import { useMemo, useState } from 'react'
import Filtering from '../components/Board/Filtering.jsx'
import FormModal from '../components/Board/FormModal.jsx'
import ReportList from '../components/Board/ReportList.jsx'
import ReportDetail from '../components/Board/ReportDetail.jsx'
import { BOARD_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/board.css'

function Board() {
  const [reports, setReports] = useState(BOARD_MOCK_DATA.reports)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('전체')
  const [startDate, setStartDate] = useState('2026-07-20')
  const [endDate, setEndDate] = useState('2026-07-20')
  const [keyword, setKeyword] = useState('')
  const [summaryFilter, setSummaryFilter] = useState('all')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const canEditStatus = true

  const boardSummary = useMemo(() => {
    const statusCount = reports.reduce((counts, report) => ({
      ...counts,
      [report.statusKey]: (counts[report.statusKey] ?? 0) + 1,
    }), {})

    return BOARD_MOCK_DATA.summary.map((item) => ({
      ...item,
      value: item.key === 'all' ? reports.length : statusCount[item.key] ?? 0,
    }))
  }, [reports])

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

  const updateReportStatus = (reportId, statusKey) => {
    const nextStatus = BOARD_MOCK_DATA.statusOptions.find((status) => status.key === statusKey)
    if (!nextStatus) return

    setReports((currentReports) => currentReports.map((report) => (
      report.id === reportId
        ? { ...report, status: nextStatus.label, statusKey: nextStatus.key }
        : report
    )))
  }

  const resetFilters = () => {
    setSelectedCategory('전체')
    setSelectedRiskLevel('전체')
    setStartDate('2026-07-20')
    setEndDate('2026-07-20')
    setKeyword('')
    setSummaryFilter('all')
  }

  const createReport = (reportForm) => {
    const selectedRisk = BOARD_MOCK_DATA.riskOptions.find((risk) => risk.level === reportForm.riskLevel)
    if (!selectedRisk) return

    const today = new Date().toISOString().slice(0, 10)
    const nextId = Math.max(...reports.map((report) => report.id), 0) + 1

    setReports((currentReports) => [
      {
        id: nextId,
        category: reportForm.category,
        title: reportForm.title.trim(),
        description: reportForm.description.trim(),
        riskLevel: selectedRisk.level,
        riskLabel: selectedRisk.label,
        location: reportForm.location.trim(),
        reporter: reportForm.reporter.trim(),
        photoName: reportForm.photoName,
        photoUrl: reportForm.photoUrl,
        reportedAt: today,
        status: '등록',
        statusKey: 'registered',
      },
      ...currentReports,
    ])
    setStartDate((currentStartDate) => (today < currentStartDate ? today : currentStartDate))
    setEndDate((currentEndDate) => (today > currentEndDate ? today : currentEndDate))
    setIsReportModalOpen(false)
  }

  const openReportDetail = (reportId) => {
    setSelectedReportId(reportId)
  }

  const closeReportDetail = () => {
    setSelectedReportId(null)
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
        onUpdateStatus={updateReportStatus}
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
    </section>
  )
}

export default Board
