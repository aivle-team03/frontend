import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
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
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)

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
  }

  return (
    <section className="approval-history-page" aria-label="조치 이력">
      <div className="approval-summary-grid">
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
      </div>

      <article className="approval-history-card">
        <div className="approval-history-heading">
          <div>
            <h2>조치 완료 내역</h2>
            <p>현장 담당자가 조치 사진을 첨부해 완료한 건만 확인하고 승인합니다.</p>
          </div>
          <div className="approval-history-tools">
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onSelectPeriod={setSelectedPeriod}
              onApplyCustomPeriod={setCustomPeriod}
              options={['전체', '이번 달', '지난달', '직접 설정']}
            />
            <span className="approval-history-count">{filteredRecords.length}건</span>
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
                <th aria-label="작업" />
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
                    <img
                      className="approval-photo-thumbnail"
                      src={actionPhotos[record.id]}
                      alt={`${record.location} 조치 사진`}
                    />
                  </td>
                  <td>
                    <span className={`approval-status ${record.approvalStatus}`}>
                      {record.approvalStatus === 'pending' ? '승인 대기' : '승인 완료'}
                    </span>
                  </td>
                  <td>
                    {record.approvalStatus === 'approved'
                      ? <span className="approval-meta">{record.approver}<small>{record.approvedAt}</small></span>
                      : <span className="approval-empty">-</span>}
                  </td>
                  <td>
                    {record.approvalStatus === 'pending' ? (
                      <button className="approval-review-button" type="button" onClick={() => setSelectedRecord(record)}>
                        승인 검토
                      </button>
                    ) : <span className="approval-empty">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {selectedRecord && (
        <div className="approval-modal-backdrop" role="presentation" onMouseDown={() => setSelectedRecord(null)}>
          <section
            className="approval-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-review-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="approval-modal-header">
              <div>
                <span>조치 완료 확인</span>
                <h2 id="approval-review-title">승인 검토</h2>
              </div>
              <button type="button" aria-label="닫기" onClick={() => setSelectedRecord(null)}><CloseRoundedIcon /></button>
            </div>
            <div className="approval-modal-body">
              <img className="approval-review-photo" src={actionPhotos[selectedRecord.id]} alt={`${selectedRecord.location} 조치 사진`} />
              <div className="approval-review-details">
                <div><span>위치</span><strong>{selectedRecord.location}</strong></div>
                <div><span>유형</span><strong>{selectedRecord.type}</strong></div>
                <div><span>조치 담당자</span><strong>{selectedRecord.assignee}</strong></div>
                <div><span>완료 일시</span><strong>{selectedRecord.completedAt}</strong></div>
              </div>
            </div>
            <div className="approval-modal-actions">
              <button className="approval-modal-cancel" type="button" onClick={() => setSelectedRecord(null)}>취소</button>
              <button className="approval-modal-confirm" type="button" onClick={() => approveRecord(selectedRecord.id)}>조치 완료 승인</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default ActionHistoryPage
