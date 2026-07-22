import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useMemo, useState } from 'react'
import actionHistory1 from '../assets/actionhistory_1.jpg'
import actionHistory2 from '../assets/actionhistory_2.jpg'
import actionHistory3 from '../assets/actionhistory_3.jpg'
import actionHistory4 from '../assets/actionhistory_4.jpg'
import actionHistory5 from '../assets/actionhistory_5.jpg'
import actionHistory6 from '../assets/actionhistory_6.jpg'
import actionHistory7 from '../assets/actionhistory_7.jpg'
import actionHistory8 from '../assets/actionhistory_8.jpg'
import PeriodSelector from '../components/dashboard/PeriodSelector.jsx'
import { APPROVAL_HISTORY_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/ActionHistoryPage.css'

const actionPhotos = {
  1: actionHistory1,
  2: actionHistory2,
  3: actionHistory3,
  4: actionHistory4,
  5: actionHistory5,
  6: actionHistory6,
  7: actionHistory7,
  8: actionHistory8,
}

// TODO: 백엔드 연동 시 조치 이력 조회·승인 결과로 이 임시 상태를 대체합니다.
let approvalRecordsCache = APPROVAL_HISTORY_MOCK_DATA

function ActionHistoryPage() {
  const [records, setRecords] = useState(approvalRecordsCache)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [photoPreviewRecord, setPhotoPreviewRecord] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)
  const [reportSnapshot, setReportSnapshot] = useState(null)

  const filteredRecords = useMemo(() => records.filter((record) => {
    const recordDate = new Date(record.completedAt.replace(' ', 'T'))
    const today = new Date()

    if (selectedPeriod === '이번 달') {
      return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()
    }

    if (selectedPeriod === '지난달') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      return recordDate.getMonth() === lastMonth.getMonth() && recordDate.getFullYear() === lastMonth.getFullYear()
    }

    if (selectedPeriod === '직접 설정' && customPeriod) {
      const startDate = new Date(`${customPeriod.startDate}T00:00:00`)
      const endDate = new Date(`${customPeriod.endDate}T23:59:59.999`)
      return recordDate >= startDate && recordDate <= endDate
    }

    return true
  }), [customPeriod, records, selectedPeriod])

  const pendingCount = useMemo(
    () => records.filter((record) => record.approvalStatus === 'pending').length,
    [records],
  )
  const approvedCount = records.length - pendingCount

  const approvalRate = useMemo(() => {
    if (records.length === 0) return 0
    return Math.round((approvedCount / records.length) * 100)
  }, [approvedCount, records.length])

  const approveRecord = (recordId) => {
    // TODO: 백엔드 연동 시 승인 처리 결과를 받은 뒤 목록을 갱신합니다.
    const approvedAt = '2026-07-15 10:30'
    const nextRecords = records.map((record) => (
      record.id === recordId
        ? { ...record, approvalStatus: 'approved', approver: '김에이블러', approvedAt }
        : record
    ))
    approvalRecordsCache = nextRecords
    setRecords(nextRecords)
    setSelectedRecord(null)
    setReportSnapshot(null)
  }

  const createReport = () => {
    setReportSnapshot({
      records: filteredRecords,
      period: selectedPeriod === '직접 설정' && customPeriod
        ? `${customPeriod.startDate} ~ ${customPeriod.endDate}`
        : selectedPeriod,
      generatedAt: new Date(),
    })
  }

  const downloadReport = () => {
    if (!reportSnapshot) return

    const rows = [
      ['조치 완료 승인 리포트'],
      ['조회 기간', reportSnapshot.period],
      ['생성 일시', reportSnapshot.generatedAt.toLocaleString('ko-KR')],
      [],
      ['완료 일시', '위치', '유형', '조치 담당자', '사진 첨부', '승인 상태', '승인자', '승인 일시'],
      ...reportSnapshot.records.map((record) => [
        record.completedAt,
        record.location,
        record.type,
        record.assignee,
        '첨부 완료',
        record.approvalStatus === 'approved' ? '승인 완료' : '승인 대기',
        record.approver ?? '-',
        record.approvedAt ?? '-',
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const file = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const downloadUrl = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = '조치완료_승인리포트.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <section className="approval-history-page" aria-label="조치 이력">
      <div className="approval-summary-row">
        <div className="approval-summary-grid">
          <article className="approval-summary-card total-summary">
            <span className="approval-summary-icon"><AssignmentTurnedInRoundedIcon /></span>
            <div className="summary-text-wrap">
              <span className="summary-label">누적 조치</span>
              <strong className="summary-count">{records.length}건</strong>
              <small>전체 등록 건수</small>
            </div>
          </article>
          <article className="approval-summary-card pending-summary">
            <span className="approval-summary-icon"><HourglassTopRoundedIcon /></span>
            <div>
              <span>승인 대기</span>
              <strong>{pendingCount}건</strong>
              <small>검토가 필요한 조치 완료 건</small>
            </div>
          </article>
          <article className="approval-summary-card approved-summary">
            <span className="approval-summary-icon"><CheckCircleOutlineRoundedIcon /></span>
            <div>
              <span>승인 완료</span>
              <strong>{approvedCount}건</strong>
              <small>승인 처리가 완료된 조치 건</small>
            </div>
          </article>
          <article className="approval-summary-card rate-summary">
            <span className="approval-summary-icon"><PieChartRoundedIcon /></span>
            <div className="summary-text-wrap">
              <span className="summary-label">조치 승인율</span>
              <strong className="summary-count">{approvalRate}%</strong>
              <small>전체 {records.length}건 중 {approvedCount}건 완료</small>
            </div>
          </article>
        </div>
      </div>

      <div className="approval-content-layout">
        <article className="approval-history-card">
          <div className="approval-history-heading">
            <div>
              <h2>조치 완료 내역</h2>
              <p>현장 담당자가 조치 사진을 첨부해 완료한 건만 확인하고 승인합니다.</p>
            </div>
          </div>

          <div className="approval-table-wrap">
            <table className="approval-history-table">
              <thead>
                <tr>
                  <th>완료 일시</th>
                  <th>위치</th>
                  <th>유형</th>
                  <th>조치 담당자</th>
                  <th>조치 사진</th>
                  <th>승인 상태</th>
                  <th>승인자 / 승인 일시</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.completedAt}</td>
                    <td>{record.location}</td>
                    <td><span className="approval-type"><TaskAltRoundedIcon />{record.type}</span></td>
                    <td>{record.assignee}</td>
                    <td>
                      <button
                        className="approval-photo-button"
                        type="button"
                        onClick={() => setPhotoPreviewRecord(record)}
                        aria-label={`${record.location} 조치 사진 크게 보기`}
                      >
                        <img
                          className="approval-photo-thumbnail"
                          src={actionPhotos[record.id]}
                          alt=""
                        />
                      </button>
                    </td>
                    <td>
                      <span className={`approval-status ${record.approvalStatus}`}>
                        {record.approvalStatus === 'pending' ? '승인 대기' : '승인 완료'}
                      </span>
                    </td>
                    <td>
                      {record.approvalStatus === 'approved'
                        ? <span className="approval-meta">{record.approver}<small>{record.approvedAt}</small></span>
                        : (
                          <button className="approval-review-button" type="button" onClick={() => setSelectedRecord(record)}>
                            승인 검토
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="approval-history-footer">전체 {filteredRecords.length}건</div>
        </article>
        <aside className="approval-control-panel">
          <div>
            <span className="approval-control-eyebrow">조회 기간</span>
            <h2>기간 설정</h2>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onSelectPeriod={setSelectedPeriod}
              onApplyCustomPeriod={setCustomPeriod}
              options={['전체', '이번 달', '지난달', '직접 설정']}
            />
          </div>
          <div className="approval-control-divider" />
          <div>
            <span className="approval-control-eyebrow">승인 리포트</span>
            <h2>리포트 관리</h2>
            <p>현재 조회 결과를 기준으로 리포트를 생성합니다.</p>
            <div className="approval-report-actions">
              <button className="approval-report-generate" type="button" onClick={createReport}>
                <DescriptionOutlinedIcon /> 리포트 생성
              </button>
              <button
                className="approval-report-download"
                type="button"
                onClick={downloadReport}
                disabled={!reportSnapshot}
                title={reportSnapshot ? '생성된 리포트 다운로드' : '먼저 리포트를 생성해 주세요'}
              >
                <DownloadRoundedIcon /> 다운로드
              </button>
            </div>
          </div>
        </aside>
      </div>

      {selectedRecord && (
        <div className="approval-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRecord(null)}>
          <section
            className="approval-review-modal-v2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-review-title"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="modal-v2-header">
              <h2 id="approval-review-title">조치 내역 관리자 승인</h2>
              <button type="button" className="modal-v2-close" onClick={() => setSelectedRecord(null)}>
                <CloseRoundedIcon />
              </button>
            </div>

            <div className="modal-v2-body">

              <div className="modal-v2-summary-bar">
                <div className="summary-item">
                  <span>위험 유형</span>
                  <strong>{selectedRecord.type}</strong>
                </div>
                <div className="summary-item">
                  <span>위치</span>
                  <strong>{selectedRecord.location}</strong>
                </div>
                <div className="summary-item">
                  <span>위험도</span>
                  <strong className="badge-danger">높음</strong>
                </div>
                <div className="summary-item">
                  <span>담당자</span>
                  <strong>{selectedRecord.assignee}</strong>
                </div>
                <div className="summary-item">
                  <span>상태</span>
                  <strong className="badge-pending">승인 대기</strong>
                </div>
                <div className="summary-item">
                  <span>탐지시간</span>
                  <small>2026-07-15 09:12</small>
                </div>
                <div className="summary-item">
                  <span>조치완료 시간</span>
                  <small>{selectedRecord.completedAt}</small>
                </div>
              </div>

              <div className="modal-v2-content-grid">

                <div className="modal-v2-card">
                  <h3>조치 전</h3>
                  <div className="img-box">
                    <img src={actionPhotos[selectedRecord.id]} alt="조치 전 사진" />
                  </div>
                  <p className="card-desc">감지 내용: {selectedRecord.type} 발생 확인</p>
                </div>

                <div className="modal-v2-card">
                  <h3>조치 후</h3>
                  <div className="img-box">
                    <img src={actionPhotos[selectedRecord.id]} alt="조치 후 사진" />
                  </div>
                  <p className="card-desc">조치 내용: 현장 이물질/장애물 제거 완료</p>
                </div>

                <div className="modal-v2-card ai-result-card">
                  <h3>AI 재확인 결과</h3>

                  <div className="ai-success-box">
                    <CheckCircleRoundedIcon className="ai-check-icon-mui" />
                    <div className="ai-result-text">
                      <span className="ai-result-label">결과</span>
                      <strong className="ai-result-value">위험요소 해소</strong>
                    </div>
                  </div>

                  <div className="ai-info-list">
                    <div><span>신뢰도</span><strong>98.4%</strong></div>
                    <div><span>분석 내용</span><strong>정상 상태 복구 감지됨</strong></div>
                  </div>
                </div>

                <div className="modal-v2-card worker-detail-card">
                  <h3>작업자 조치 내용</h3>

                  <div className="worker-detail-group">
                    <div className="detail-item">
                      <span className="detail-label">조치 담당자</span>
                      <strong className="detail-value">{selectedRecord.assignee}</strong>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">내용</span>
                      <p className="detail-value text-desc">
                        적치 박스를 제거하고 통행 및 피난동선을 안전하게 확보하였습니다.
                      </p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">비고</span>
                      <p className="detail-value text-desc">현장 사진 재촬영 후 등록 완료</p>
                    </div>
                  </div>
                </div>

                <div className="modal-v2-card reject-reason-card">
                  <h3>반려 사유</h3>
                  <textarea
                    placeholder="반려 시 사유를 입력해주세요. (승인 시 입력 불필요)"
                    rows={4}
                  />
                </div>

              </div>
            </div>

            <div className="modal-v2-footer">
              <button type="button" className="btn-v2-list" onClick={() => setSelectedRecord(null)}>
                목록
              </button>
              <div className="footer-right-actions">
                <button type="button" className="btn-v2-reject" onClick={() => setSelectedRecord(null)}>
                  반려
                </button>
                <button type="button" className="btn-v2-approve" onClick={() => approveRecord(selectedRecord.id)}>
                  승인
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {photoPreviewRecord && (
        <div className="photo-preview-backdrop" role="presentation" onMouseDown={() => setPhotoPreviewRecord(null)}>
          <section
            className="photo-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="photo-preview-header">
              <div>
                <span>조치 사진</span>
                <h2 id="photo-preview-title">{photoPreviewRecord.location}</h2>
              </div>
              <button type="button" aria-label="닫기" onClick={() => setPhotoPreviewRecord(null)}><CloseRoundedIcon /></button>
            </div>
            <img className="photo-preview-image" src={actionPhotos[photoPreviewRecord.id]} alt={`${photoPreviewRecord.location} 조치 사진`} />
          </section>
        </div>
      )}
    </section>
  )
}

export default ActionHistoryPage
