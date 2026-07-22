import "../styles/ActionHistoryPage.css";
import { useState, useEffect, useMemo } from "react";
import RecentEventstable from "../components/dashboard/RecentEventsTable";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import axios from "axios";
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded'
import actionHistory1 from '../assets/actionhistory_1.jpg'
import actionHistory2 from '../assets/actionhistory_2.jpg'
import actionHistory3 from '../assets/actionhistory_3.jpg'
import actionHistory4 from '../assets/actionhistory_4.jpg'
import actionHistory5 from '../assets/actionhistory_5.jpg'
import actionHistory6 from '../assets/actionhistory_6.jpg'
import actionHistory7 from '../assets/actionhistory_7.jpg'
import actionHistory8 from '../assets/actionhistory_8.jpg'
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
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)

  const [records, setRecords] = useState(approvalRecordsCache)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [photoPreviewRecord, setPhotoPreviewRecord] = useState(null)

  useEffect(() => {
    fetchActionHistory();
  }, []);

  const fetchActionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // 🔒 JWT 로그인 토큰 꺼내기

      const response = await axios.get("http://127.0.0.1:8000/api/checklists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChecklists(response.data);
    } catch (error) {
      console.error("조치이력 로드 실패:", error);
      alert("조치 이력 데이터를 불러오지 못했습니다. 로그인 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = checklists.filter((item) => {
    if (!item.date) return false;

    // DB의 'YYYY-MM-DD' 날짜 포맷 파싱
    const itemDate = new Date(item.date);
    const today = new Date();

    // 시간 정보 제거하고 순수 날짜 비교를 위해 초기화
    today.setHours(0, 0, 0, 0);
    itemDate.setHours(0, 0, 0, 0);

    if (selectedPeriod === "오늘") {
      return itemDate.getTime() === today.getTime();
    }

    if (selectedPeriod === "최근 7일") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }

    if (selectedPeriod === "이번 달") {
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      )
    }

    if (selectedPeriod === "지난 달") {
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      return (
        itemDate.getMonth() === lastMonth.getMonth() &&
        itemDate.getFullYear() === lastMonth.getFullYear()
      )
    }

    if (selectedPeriod === '직접 설정' && customPeriod) {
      const startDate = new Date(`${customPeriod.startDate}T00:00:00`)
      const endDate = new Date(`${customPeriod.endDate}T23:59:59.999`)

      return itemDate >= startDate && itemDate <= endDate
    }

    return true
  })


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


  const events = filteredData.map((item) => ({
    id: item.checklist_id,
    time: item.date,
    location: item.camera_id ? `CCTV #${item.camera_id} 구역` : "지정 안 됨",
    type: item.content || "정기 조치 점검",
    status: item.status,
    manager: item.uid ? `${item.uid}` : "미지정",
    imageUrl: item.image_url || "https://via.placeholder.com/150",
  }));


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
  }

  if (loading) return <div className="loading-container">조치 이력을 가져오는 중...</div>;

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
            <div className="approval-history-tools">
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
                onApplyCustomPeriod={setCustomPeriod}
                options={['전체', '이번 달', '지난달', '직접 설정']}
              />
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
      </div>

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
              <button className="approval-modal-confirm" type="button" onClick={(e) => { e.stopPropagation(); approveRecord(selectedRecord.id); }}>조치 완료 승인</button>
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
