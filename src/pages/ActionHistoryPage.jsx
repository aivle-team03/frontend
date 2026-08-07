import "../styles/ActionHistoryPage.css";
import { useState, useEffect, useMemo } from "react";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import axios from "axios";
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'

function ActionHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)
  const [historyType, setHistoryType] = useState('점검')

  const [reportSnapshot, setReportSnapshot] = useState(null)
  const [records, setRecords] = useState([])
  const [inspectionhistory, setinspectionHistory] = useState([])
  const [selectedRecord, setSelectedRecord] = useState()
  const [selectedInspectionRecord, setSelectedInspectionRecord] = useState(null)
  const [selectedActionRecord, setSelectedActionRecord] = useState(null)
  const [photoPreviewRecord, setPhotoPreviewRecord] = useState(null)

  // 반려 사유 상태 관리
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    Promise.all([fetchActionHistory(), fetchInspectionHistory()])
      .finally(() => setIsInitialLoading(false))
  }, []);

  // 1. 조치 이력 전용 API 호출 (/api/action-histories)
  const fetchActionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://127.0.0.1:8000/api/action-histories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          action_status: '조치 완료',
          size: 100,
        },
      });

      const actionItems = Array.isArray(response.data) ? response.data : (response.data?.items ?? [])
      if (actionItems.length) {
        const fetchedRecords = actionItems.filter((item) => item.action_status === '조치 완료').map((item) => {
          const approvalStatus = item.approval_status === '승인 완료'
            ? 'approved'
            : item.approval_status === '반려'
              ? 'rejected'
              : 'pending'
          return {
            id: item.action_history_id,
            eventId: item.event_id ?? null,
            inspectionHistoryId: item.inspection_history_id ?? null,
            completedAt: item.completed_at ? String(item.completed_at).replace('T', ' ').slice(0, 16) : '-',
            location: item.location || "지정 안 됨",
            type: item.type || item.action_name || "일반 조치",
            actionName: item.action_name ?? null,
            assignee: item.handler_name || "담당자 미지정",
            content: item.content ?? '',
            imageUrl: item.image_url || "",
            statusRaw: item.approval_status,
            approvalStatus,
            approver: item.approver_name ?? null,
            approvedAt: item.approval_date ? String(item.approval_date).replace('T', ' ').slice(0, 16) : null,

            // 💡 AI 연동 데이터 바인딩 추가
            aiVerified: item.ai_verified,
            aiConfidence: item.ai_confidence,
            aiSummary: item.ai_summary,
          }
        });
        setRecords(fetchedRecords);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("조치 이력 로드 실패:", error);
      alert("조치 이력 데이터를 불러오지 못했습니다. 로그인 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://127.0.0.1:8000/api/inspection/histories/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const fetchedRecords = response.data.filter((item) => item.status === '점검 완료').map((item) => {
          return {
            id: item.inspection_history_id ?? item.inspection_id,
            inspectionId: item.inspection_id ?? '-',
            name: item.name || "현장 점검 항목",
            completedAt: item.date ? String(item.date).replace('T', ' ').slice(0, 16) : '-',
            location: item.location ? item.location : "지정 안 됨",
            type: item.name || "현장 점검 항목",
            assignee: item.user_name || "담당자 미지정",
            memo: item.content || "입력된 점검 메모가 없습니다.",
            content: item.content || "",
            imageUrl: item.image_url || "",
            statusRaw: item.status,
          }
        });
        const uniqueRecords = Array.from(new Map(fetchedRecords.map((record) => [
          `${record.id}-${record.completedAt}-${record.location}-${record.type}-${record.assignee}`,
          record,
        ])).values())
        setinspectionHistory(uniqueRecords);
      }
    } catch (error) {
      console.error("점검 이력 로드 실패:", error);
      alert("점검 이력 데이터를 불러오지 못했습니다. 로그인 상태를 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  // 2. 관리자 승인 처리 API 연동
  const handleApprove = async () => {
    if (!selectedRecord) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `http://127.0.0.1:8000/api/action-histories/${selectedRecord.id}/approve`,
        {},
        { headers }
      );

      alert('승인 처리가 완료되었습니다.');
      setSelectedRecord(null);
      fetchActionHistory(); // 목록 최신화
    } catch (error) {
      console.error('승인 처리 실패:', error);
      alert('승인 처리 실패: ' + (error.response?.data?.detail || error.message));
    }
  };

  // 3. 관리자 반려 처리 API 연동
  const handleReject = async () => {
    if (!selectedRecord) return;

    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `http://127.0.0.1:8000/api/action-histories/${selectedRecord.id}/reject`,
        {
          rejection_reason: rejectReason.trim(),
        },
        { headers }
      );

      alert('반려 처리가 완료되었습니다. 해당 항목이 현장 작업자 조치 리스트로 되돌아갑니다.');
      setSelectedRecord(null);
      setRejectReason('');
      fetchActionHistory(); // 목록 최신화
    } catch (error) {
      console.error('반려 처리 실패:', error);
      alert('반려 처리 실패: ' + (error.response?.data?.detail || error.message));
    }
  };

  const openActionDetail = async (record) => {
    setSelectedActionRecord(record)

    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.get(`http://127.0.0.1:8000/api/action-histories/${record.id}`, { headers })

      setSelectedActionRecord((current) => (
        current?.id === record.id
          ? {
            ...current,
            content: response.data?.content ?? '',
            aiVerified: response.data?.ai_verified,
            aiConfidence: response.data?.ai_confidence,
            aiSummary: response.data?.ai_summary,
          }
          : current
      ))
    } catch (error) {
      console.error('조치 상세 내용 조회 실패:', error)
    }
  }

  const openApprovalReview = async (record) => {
    setSelectedRecord(record)
    setRejectReason('')

    try {
      const token = localStorage.getItem("token")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const response = await axios.get(`http://127.0.0.1:8000/api/action-histories/${record.id}`, { headers })

      setSelectedRecord((current) => (
        current?.id === record.id
          ? {
            ...current,
            content: response.data?.content ?? '',
            // 💡 모달 오픈 시 최신 DB AI 결과로 갱신
            aiVerified: response.data?.ai_verified,
            aiConfidence: response.data?.ai_confidence,
            aiSummary: response.data?.ai_summary,
          }
          : current
      ))
    } catch (error) {
      console.error('조치 승인 검토 상세 내용 조회 실패:', error)
    }
  }

  const filteredRecords = useMemo(() => records.filter((record) => {
    if (!record.completedAt || record.completedAt === '-') return true;
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

  const filteredInspectionRecords = useMemo(() => inspectionhistory.filter((record) => {
    if (!record.completedAt || record.completedAt === '-') return true
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
  }), [customPeriod, inspectionhistory, selectedPeriod])

  const createReport = () => {
    setReportSnapshot({
      type: historyType,
      records: historyType === '점검' ? filteredInspectionRecords : filteredRecords,
      period: selectedPeriod === '직접 설정' && customPeriod
        ? `${customPeriod.startDate} ~ ${customPeriod.endDate}`
        : selectedPeriod,
      generatedAt: new Date(),
    })
  }

  const downloadReport = () => {
    if (!reportSnapshot) return
    const reportValue = (value) => value === undefined || value === null || value === '' ? '-' : value

    const rows = [
      [reportSnapshot.type === '점검' ? '점검 완료 리포트' : '조치 완료 승인 리포트'],
      ['조회 기간', reportSnapshot.period],
      ['생성 일시', reportSnapshot.generatedAt.toLocaleString('ko-KR')],
      [],
      ...(reportSnapshot.type === '점검'
        ? [
          ['inspection_id', 'name', 'content', '완료 일시', '위치', '유형', '점검 담당자', '점검 사진', '점검 상태'],
          ...reportSnapshot.records.map((record) => [reportValue(record.inspectionId), reportValue(record.name), reportValue(record.content), reportValue(record.completedAt), reportValue(record.location), reportValue(record.type), reportValue(record.assignee), record.imageUrl ? '첨부 완료' : '사진 없음', reportValue(record.statusRaw)]),
        ]
        : [
          ['event_id', 'inspection_history_id', 'action_name', 'type', 'content', 'image_url', '완료 일시', '위치', '조치 담당자', '승인 상태', 'AI 검증 여부', '승인자', '승인 일시'],
          ...reportSnapshot.records.map((record) => [record.eventId, record.inspectionHistoryId, record.actionName, record.type, record.content, record.imageUrl, record.completedAt, record.location, record.assignee, record.approvalStatus === 'approved' ? '승인 완료' : record.approvalStatus === 'rejected' ? '반려됨' : '승인 대기', record.aiVerified === 1 ? '해소 (승인)' : record.aiVerified === 0 ? '미해소 (거부)' : '미검증', record.approver, record.approvedAt]),
        ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const file = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const downloadUrl = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = reportSnapshot.type === '점검'
      ? '점검완료_리포트.csv'
      : '조치완료_승인리포트.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <section className="approval-history-page" aria-label="조치 이력">
      <div className="approval-summary-row">
        <div className="approval-summary-grid">
          <article className="approval-summary-card pending-summary">
            <span className="approval-summary-icon"><CheckCircleOutlineRoundedIcon /></span>
            <div>
              <span>전체 점검</span>
              <strong>{inspectionhistory.length}건</strong>
              <small>점검 완료 건수</small>
            </div>
          </article>

          <article className="approval-summary-card total-summary">
            <span className="approval-summary-icon"><AssignmentTurnedInRoundedIcon /></span>
            <div className="summary-text-wrap">
              <span className="summary-label">전체 조치</span>
              <strong className="summary-count">{records.length}건</strong>
              <small>조치 완료 건수</small>
            </div>
          </article>
        </div>
      </div>

      <div className="approval-content-layout">
        <article className="approval-history-card">
          <div className="approval-history-heading">
            <div>
              <h2>{historyType === '점검' ? '점검 완료 내역' : '조치 완료 내역'}</h2>
              <p>{historyType === '점검' ? '현장 담당자가 점검을 완료한 것만 확인합니다.' : '현장 담당자가 조치 사진을 첨부해 완료한 건만 확인하고 승인합니다.'}</p>
            </div>
            <div className="approval-history-toggle" role="group" aria-label="조치 점검 선택">
              {['점검', '조치'].map((type) => (
                <button
                  key={type}
                  className={historyType === type ? 'is-active' : ''}
                  type="button"
                  onClick={() => setHistoryType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {historyType === '점검' ? (
            <>
              <div className="approval-table-wrap">
                <table className="approval-history-table">
                  <thead>
                    <tr>
                      <th>완료 일시</th>
                      <th>위치</th>
                      <th>유형</th>
                      <th>점검 담당자</th>
                      <th>점검 사진</th>
                      <th>점검 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? <HistoryTableSkeletonRows columns={6} /> : inspectionhistory.map((record) => (
                      <tr key={record.id} className="inspection-history-row" onClick={() => setSelectedInspectionRecord(record)}>
                        <td>{record.completedAt}</td>
                        <td>{record.location}</td>
                        <td><span className="approval-type"><TaskAltRoundedIcon />{record.type}</span></td>
                        <td>{record.assignee}</td>
                        <td>
                          <button
                            className="approval-photo-button"
                            type="button"
                            disabled={!record.imageUrl}
                            onClick={(event) => { event.stopPropagation(); setPhotoPreviewRecord(record) }}
                            aria-label={`${record.location} 점검 사진 크게 보기`}
                          >
                            {record.imageUrl ? <img className="approval-photo-thumbnail" src={record.imageUrl} alt="" /> : <span className="no-photo">사진 없음</span>}
                          </button>
                        </td>
                        <td>
                          <span className="approval-status approved">
                            {record.statusRaw}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="approval-history-footer">전체 {inspectionhistory.length}건</div>
            </>
          ) : (
            <>
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
                    {isInitialLoading ? <HistoryTableSkeletonRows columns={7} /> : filteredRecords.map((record) => (
                      <tr
                        key={record.id}
                        className="inspection-history-row"
                        tabIndex={0}
                        onClick={() => openActionDetail(record)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openActionDetail(record)
                          }
                        }}
                      >
                        <td>{record.completedAt}</td>
                        <td>{record.location}</td>
                        <td><span className="approval-type"><TaskAltRoundedIcon />{record.actionName || record.type}</span></td>
                        <td>{record.assignee}</td>
                        <td>
                          <button
                            className="approval-photo-button"
                            type="button"
                            disabled={!record.imageUrl}
                            onClick={(event) => { event.stopPropagation(); setPhotoPreviewRecord(record) }}
                            aria-label={`${record.location} 조치 사진 크게 보기`}
                          >
                            {record.imageUrl ? <img className="approval-photo-thumbnail" src={record.imageUrl} alt="" /> : <span className="no-photo">사진 없음</span>}
                          </button>
                        </td>
                        <td>
                          <span className={`approval-status ${record.approvalStatus}`}>
                            {record.approvalStatus === 'approved'
                              ? '승인 완료'
                              : record.approvalStatus === 'rejected'
                                ? '조치 필요 (반려)'
                                : '승인 대기'}
                          </span>
                        </td>
                        <td>
                          {record.approvalStatus === 'approved'
                            ? <span className="approval-meta">{record.approver}<small>{record.approvedAt}</small></span>
                            : (
                              <button
                                className="approval-review-button"
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openApprovalReview(record);
                                }}
                              >
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
            </>
          )}
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

      {/* 점검 완료 상세 모달 */}
      {selectedInspectionRecord && (
        <div className="approval-modal-backdrop" role="presentation" onMouseDown={() => setSelectedInspectionRecord(null)}>
          <section className="inspection-history-detail-modal" role="dialog" aria-modal="true" aria-labelledby="inspection-history-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><span>INSPECTION HISTORY</span><h2 id="inspection-history-detail-title">{selectedInspectionRecord.type}</h2><p>완료된 점검의 담당자 메모를 확인합니다.</p></div>
              <button type="button" aria-label="닫기" onClick={() => setSelectedInspectionRecord(null)}><CloseRoundedIcon /></button>
            </header>
            <div className="inspection-history-detail-grid">
              <div><span>완료 일시</span><strong>{selectedInspectionRecord.completedAt}</strong></div>
              <div><span>위치</span><strong>{selectedInspectionRecord.location}</strong></div>
              <div><span>점검 담당자</span><strong>{selectedInspectionRecord.assignee}</strong></div>
              <div><span>진행 상태</span><strong className="inspection-complete-badge">{selectedInspectionRecord.statusRaw}</strong></div>
            </div>
            <section className="inspection-history-memo"><span>점검자 메모</span><p>{selectedInspectionRecord.memo}</p></section>
            <footer><button type="button" onClick={() => setSelectedInspectionRecord(null)}>닫기</button></footer>
          </section>
        </div>
      )}

      {/* 조치 완료 상세 모달 */}
      {selectedActionRecord && (
        <div className="approval-modal-backdrop" role="presentation" onMouseDown={() => setSelectedActionRecord(null)}>
          <section className="inspection-history-detail-modal" role="dialog" aria-modal="true" aria-labelledby="action-history-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><span>ACTION HISTORY</span><h2 id="action-history-detail-title">{selectedActionRecord.actionName || selectedActionRecord.type}</h2><p>완료된 조치 항목의 상세 정보를 확인합니다.</p></div>
              <button type="button" aria-label="닫기" onClick={() => setSelectedActionRecord(null)}><CloseRoundedIcon /></button>
            </header>
            <div className="inspection-history-detail-grid">
              <div><span>완료 일시</span><strong>{selectedActionRecord.completedAt}</strong></div>
              <div><span>위치</span><strong>{selectedActionRecord.location}</strong></div>
              <div><span>조치 담당자</span><strong>{selectedActionRecord.assignee}</strong></div>
              <div><span>승인 상태</span><strong className="inspection-complete-badge">{selectedActionRecord.statusRaw}</strong></div>
            </div>
            <section className="inspection-history-memo"><span>조치 내용</span><p>{selectedActionRecord.content ?? ''}</p></section>
            <section className="action-history-detail-photo">
              <span>조치 사진</span>
              {selectedActionRecord.imageUrl
                ? <button type="button" onClick={() => setPhotoPreviewRecord(selectedActionRecord)}><img src={selectedActionRecord.imageUrl} alt={`${selectedActionRecord.location} 조치 사진`} /></button>
                : <p>등록된 조치 사진이 없습니다.</p>}
            </section>
            <footer><button type="button" onClick={() => setSelectedActionRecord(null)}>닫기</button></footer>
          </section>
        </div>
      )}

      {/* 💡 관리자 승인/반려 검토 모달 (실시간 DB AI 연동 데이터 적용) */}
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
                  <span>담당자</span>
                  <strong>{selectedRecord.assignee}</strong>
                </div>
                <div className="summary-item">
                  <span>상태</span>
                  <strong className="badge-pending">
                    {selectedRecord.approvalStatus === 'approved' ? '승인 완료' : selectedRecord.approvalStatus === 'rejected' ? '반려됨' : '승인 대기'}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>조치완료 시간</span>
                  <small>{selectedRecord.completedAt}</small>
                </div>
              </div>

              <div className="modal-v2-content-grid">
                <div className="modal-v2-card">
                  <h3>조치 등록 사진</h3>
                  <div className="img-box">
                    {selectedRecord.imageUrl ? (
                      <img src={selectedRecord.imageUrl} alt="조치 사진" />
                    ) : (
                      <p style={{ padding: '40px', textAlign: 'center', color: '#888' }}>등록된 사진이 없습니다.</p>
                    )}
                  </div>
                  <p className="card-desc">등록된 현장 사진 확인</p>
                </div>

                {/* 💡 실시간 DB AI 검증 결과 동적 바인딩 카드 */}
                <div className="modal-v2-card ai-result-card">
                  <h3>AI 재확인 결과</h3>
                  {selectedRecord.aiVerified === 1 ? (
                    <>
                      <div className="ai-success-box">
                        <CheckCircleRoundedIcon className="ai-check-icon-mui" style={{ color: '#2e7d32' }} />
                        <div className="ai-result-text">
                          <span className="ai-result-label">결과</span>
                          <strong className="ai-result-value" style={{ color: '#2e7d32' }}>위험요소 해소</strong>
                        </div>
                      </div>
                      <div className="ai-info-list">
                        <div>
                          <span>신뢰도</span>
                          <strong>{selectedRecord.aiConfidence != null ? `${selectedRecord.aiConfidence}%` : '-'}</strong>
                        </div>
                        <div>
                          <span>분석 내용</span>
                          <strong>{selectedRecord.aiSummary || '안전 상태 복구가 확인되었습니다.'}</strong>
                        </div>
                      </div>
                    </>
                  ) : selectedRecord.aiVerified === 0 ? (
                    <>
                      <div className="ai-success-box" style={{ backgroundColor: '#fff3e0' }}>
                        <WarningRoundedIcon className="ai-check-icon-mui" style={{ color: '#ed6c02' }} />
                        <div className="ai-result-text">
                          <span className="ai-result-label">결과</span>
                          <strong className="ai-result-value" style={{ color: '#ed6c02' }}>위험요소 미해소 (확인 필요)</strong>
                        </div>
                      </div>
                      <div className="ai-info-list">
                        <div>
                          <span>신뢰도</span>
                          <strong>{selectedRecord.aiConfidence != null ? `${selectedRecord.aiConfidence}%` : '-'}</strong>
                        </div>
                        <div>
                          <span>분석 내용</span>
                          <strong>{selectedRecord.aiSummary || '위험 요소가 완전히 해소되지 않았을 수 있습니다.'}</strong>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ai-success-box" style={{ backgroundColor: '#f5f5f5' }}>
                        <HourglassEmptyRoundedIcon className="ai-check-icon-mui" style={{ color: '#9e9e9e' }} />
                        <div className="ai-result-text">
                          <span className="ai-result-label">결과</span>
                          <strong className="ai-result-value" style={{ color: '#757575' }}>AI 검증 진행 중 / 미실행</strong>
                        </div>
                      </div>
                      <div className="ai-info-list">
                        <div>
                          <span>안내</span>
                          <strong>백그라운드에서 AI 검증이 처리 중이거나 아직 진행되지 않았습니다.</strong>
                        </div>
                      </div>
                    </>
                  )}
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
                        {selectedRecord.content || '입력된 내용이 없습니다.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="modal-v2-card reject-reason-card">
                  <h3>반려 사유</h3>
                  <textarea
                    placeholder="반려 시 사유를 입력해주세요. (승인 시 입력 불필요)"
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-v2-footer">
              <button type="button" className="btn-v2-list" onClick={() => setSelectedRecord(null)}>
                목록
              </button>
              <div className="footer-right-actions">
                <button type="button" className="btn-v2-reject" onClick={handleReject}>
                  반려
                </button>
                <button type="button" className="btn-v2-approve" onClick={handleApprove}>
                  승인
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 조치 사진 대형 미리보기 모달 */}
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
            <img className="photo-preview-image" src={photoPreviewRecord.imageUrl} alt={`${photoPreviewRecord.location} 조치 사진`} />
          </section>
        </div>
      )}
    </section>
  )
}

function HistoryTableSkeletonRows({ columns }) { return Array.from({ length: 7 }, (_, rowIndex) => <tr className="history-table-skeleton-row" key={rowIndex}>{Array.from({ length: columns }, (_, columnIndex) => <td key={columnIndex}><span className={`history-table-skeleton-block column-${columnIndex}`} /></td>)}</tr>) }

export default ActionHistoryPage;