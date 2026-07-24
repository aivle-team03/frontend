import "../styles/ActionHistoryPage.css";
import { useState, useEffect, useMemo } from "react";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import axios from "axios";
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

function ActionHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('전체')
  const [customPeriod, setCustomPeriod] = useState(null)

  const [reportSnapshot, setReportSnapshot] = useState(null)
  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [photoPreviewRecord, setPhotoPreviewRecord] = useState(null)

  // 반려 사유 상태 관리
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchActionHistory();
  }, []);

  // 1. 조치 이력 전용 API 호출 (/api/checklists/history)
  const fetchActionHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("http://127.0.0.1:8000/api/checklists/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const fetchedRecords = response.data.map((item) => {
          // 백엔드 status 값에 맞춘 승인 상태 매핑
          let appStatus = 'pending';
          if (item.status === '승인 완료') {
            appStatus = 'approved';
          } else if (item.status === '조치 필요') {
            appStatus = 'rejected';
          }

          return {
            id: item.checklist_id,
            completedAt: item.date ? String(item.date).replace('T', ' ').slice(0, 16) : '-',
            location: item.camera_id ? `CCTV #${item.camera_id} 구역` : "지정 안 됨",
            type: item.content || "현장 조치 항목",
            assignee: item.name ? `${item.name}` : "담당자 미지정",
            imageUrl: item.image_url || "/static/uploads/default.jpg",
            statusRaw: item.status, // 백엔드 원본 status
            approvalStatus: appStatus,
            approver: item.approver ?? '안전 관리자',
            approvedAt: item.approved_at ?? '-',
          }
        });
        setRecords(fetchedRecords);
      }
    } catch (error) {
      console.error("조치 이력 로드 실패:", error);
      alert("조치 이력 데이터를 불러오지 못했습니다. 로그인 상태를 확인하세요.");
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
        `http://127.0.0.1:8000/api/checklists/${selectedRecord.id}/status`,
        { status: "승인 완료" },
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
        `http://127.0.0.1:8000/api/checklists/${selectedRecord.id}/status`,
        {
          status: "조치 필요",
          reason: rejectReason.trim(),
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

  const pendingCount = useMemo(
    () => records.filter((record) => record.approvalStatus === 'pending').length,
    [records],
  )
  const approvedCount = records.filter((record) => record.approvalStatus === 'approved').length

  const approvalRate = useMemo(() => {
    if (records.length === 0) return 0
    return Math.round((approvedCount / records.length) * 100)
  }, [approvedCount, records.length])

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
        record.approvalStatus === 'approved' ? '승인 완료' : record.approvalStatus === 'rejected' ? '반려됨' : '승인 대기',
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
                          src={record.imageUrl}
                          alt=""
                        />
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
                            onClick={() => {
                              setSelectedRecord(record);
                              setRejectReason('');
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

      {/* 관리자 승인/반려 검토 모달 */}
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
                  <strong className="badge-pending">
                    {selectedRecord.approvalStatus === 'approved' ? '승인 완료' : '승인 대기'}
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
                    <img src={selectedRecord.imageUrl} alt="조치 사진" />
                  </div>
                  <p className="card-desc">등록된 현장 사진 확인</p>
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
                        {selectedRecord.type}
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

export default ActionHistoryPage
