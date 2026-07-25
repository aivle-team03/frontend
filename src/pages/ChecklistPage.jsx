import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TODAY_INSPECTION_MOCK_DATA } from '../mocks/mockData'
import '../styles/checklist.css'
import {
  applyChecklistInspectionResults,
  getStoredSafetyRiskThreshold,
  saveChecklistActionRiskResult,
  saveChecklistInspectionResult,
} from '../utils/checklistStatusStorage'

const API_BASE_URL = 'http://127.0.0.1:8000'
const STRENGTH_OPTIONS = Array.from({ length: 9 }, (_, index) => String(index + 1))
const FREQUENCY_OPTIONS = [
  { key: 'frequent', label: '빈번', score: 3 },
  { key: 'sometimes', label: '가끔', score: 2 },
  { key: 'rare', label: '드묾', score: 1 },
]

function getRiskSelectionFromTask(task) {
  const strength = Number(task?.strength)
  const frequency = FREQUENCY_OPTIONS.find((option) => option.score === Number(task?.frequency))

  if (Number.isFinite(strength) && strength >= 1 && strength <= 9 && frequency) {
    return { strength: String(strength), frequency }
  }

  return { strength: '5', frequency: FREQUENCY_OPTIONS[1] }
}

function applyStoredResultsToTasks(tasks) {
  return applyChecklistInspectionResults(tasks.map((task) => ({ ...task, progress: task.status })))
    .map((task) => ({
      ...task,
      status: task.progress,
      completed: task.progress === '점검 완료' || task.completed,
    }))
}

function ChecklistPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [activeTaskView, setActiveTaskView] = useState('inspection')
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  // 조치 보고용 입력 상태
  const [actionContent, setActionContent] = useState('')
  const [afterImages, setAfterImages] = useState([])
  const [imageFiles, setImageFiles] = useState([]) // 실제 업로드할 File 객체
  const [selectedImage, setSelectedImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedStrength, setSelectedStrength] = useState('5')
  const [selectedFrequency, setSelectedFrequency] = useState(FREQUENCY_OPTIONS[1])
  const [actionBeforeStrength, setActionBeforeStrength] = useState('5')
  const [actionBeforeFrequency, setActionBeforeFrequency] = useState(FREQUENCY_OPTIONS[1])

  const afterInputRef = useRef(null)

  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.get(`${API_BASE_URL}/api/checklists`, { headers })

      if (response.data && Array.isArray(response.data)) {
        const formattedTasks = response.data.map((item) => ({
          id: item.checklist_id,
          text: item.content || '지정된 점검/조치 항목',
          type: item.type || (item.event_id ? '조치' : '점검'),
          status: item.status || '미조치',
          location: item.camera_id ? `CCTV #${item.camera_id} 구역` : '현장 구역',
          date: item.date ? String(item.date).slice(0, 10) : '-',
          imageUrl: item.image_url || '',
          completed: item.status === '승인 대기' || item.status === '승인 완료' || item.status === '조치 완료',
          riskScore: item.risk_score ?? item.riskScore ?? item.before_risk_score,
          inspectionRiskScore: item.inspection_risk_score ?? item.before_risk_score,
          actionRiskScore: item.action_risk_score ?? item.after_risk_score,
          beforeRiskScore: item.before_risk_score,
          strength: item.strength ?? item.severity ?? item.before_risk_strength,
          frequency: item.frequency ?? item.before_risk_frequency,
          actionStrength: item.action_strength ?? item.after_risk_strength,
          actionFrequency: item.action_frequency ?? item.after_risk_frequency,
        }))
        const mergedTasks = applyStoredResultsToTasks([...TODAY_INSPECTION_MOCK_DATA, ...formattedTasks])

        setTasks(mergedTasks)

        // 첫 번째 조치/점검 항목 기본 선택
        if (mergedTasks.length > 0) {
          setSelectedTaskId(mergedTasks[0].id)
        }
      }
    } catch (error) {
      console.error('체크리스트 로드 실패:', error)
      setTasks(applyStoredResultsToTasks(TODAY_INSPECTION_MOCK_DATA))
      setSelectedTaskId(TODAY_INSPECTION_MOCK_DATA[0]?.id ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // 1. 백엔드에서 체크리스트 목록 조회 (GET /api/checklists)
  // ==========================================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChecklists()
  }, [fetchChecklists])

  const { inspectionTasks, actionTasks, visibleTasks } = useMemo(() => {
    const isActionTask = (task) => task.type === '조치' || task.status === '조치 대기' || task.status === '조치 필요' || task.status === '반려'
    const nextInspectionTasks = tasks.filter((task) => !isActionTask(task))
    const nextActionTasks = tasks.filter((task) => isActionTask(task))

    return {
      inspectionTasks: nextInspectionTasks,
      actionTasks: nextActionTasks,
      visibleTasks: activeTaskView === 'inspection' ? nextInspectionTasks : nextActionTasks,
    }
  }, [activeTaskView, tasks])

  // 진행률 계산
  const completedCount = visibleTasks.filter((task) => task.completed).length
  const totalCount = visibleTasks.length
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  const effectiveSelectedTaskId = visibleTasks.some((task) => task.id === selectedTaskId)
    ? selectedTaskId
    : visibleTasks[0]?.id

  // 현재 선택된 체크리스트 항목
  const currentTask = tasks.find((t) => t.id === effectiveSelectedTaskId)

  useEffect(() => {
    if (activeTaskView !== 'action' || !currentTask) return

    const { strength, frequency } = getRiskSelectionFromTask(currentTask)
    setActionBeforeStrength(strength)
    setActionBeforeFrequency(frequency)
  }, [activeTaskView, currentTask])

  // 이미지 파일 선택 처리
  const handleFileChange = (event) => {
    const [file] = Array.from(event.target.files ?? [])
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageFiles([file])
      setAfterImages([reader.result])
    }
    reader.readAsDataURL(file)

    event.target.value = ''
  }

  // 이미지 삭제
  const deleteImage = (index) => {
    setAfterImages((prev) => prev.filter((_, idx) => idx !== index))
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index))
  }

  // ==========================================
  // 2. 조치 완료 보고 제출 (PATCH /api/checklists/{id}/complete)
  // ==========================================
  const handleSubmitAction = async () => {
    if (!currentTask) {
      alert('선택된 체크리스트 항목이 없습니다.')
      return
    }

    if (!actionContent.trim()) {
      alert('조치 내용을 입력해 주세요.')
      return
    }

    if (imageFiles.length === 0) {
      alert('조치 완료 사진을 1장 첨부해 주세요.')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      const formData = new FormData()
      formData.append('content', actionContent.trim())
      formData.append('image', imageFiles[0])
      formData.append('risk_score', String(Number(actionBeforeStrength) * actionBeforeFrequency.score))
      formData.append('risk_strength', actionBeforeStrength)
      formData.append('risk_frequency', String(actionBeforeFrequency.score))
      formData.append('before_risk_score', String(Number(actionBeforeStrength) * actionBeforeFrequency.score))
      formData.append('before_risk_strength', actionBeforeStrength)
      formData.append('before_risk_frequency', String(actionBeforeFrequency.score))

      await axios.patch(`${API_BASE_URL}/api/checklists/${currentTask.id}/complete`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      saveChecklistActionRiskResult({
        id: currentTask.id,
        riskScore: Number(actionBeforeStrength) * actionBeforeFrequency.score,
        strength: Number(actionBeforeStrength),
        frequency: actionBeforeFrequency.score,
      })

      alert('조치 완료 보고가 성공적으로 등록되었습니다. (승인 대기 상태로 전환)')

      // 입력 폼 초기화 후 리스트 재조회
      setActionContent('')
      setAfterImages([])
      setImageFiles([])
      fetchChecklists()
    } catch (error) {
      console.error('완료 보고 실패:', error)
      alert('완료 보고 처리 실패: ' + (error.response?.data?.detail || error.message))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitStrength = () => {
    if (!currentTask) {
      alert('선택된 점검 항목이 없습니다.')
      return
    }

    const riskScore = Number(selectedStrength) * selectedFrequency.score
    const riskThreshold = getStoredSafetyRiskThreshold()
    const result = saveChecklistInspectionResult({
      id: currentTask.id,
      riskScore,
      riskThreshold,
      strength: Number(selectedStrength),
      frequency: selectedFrequency.score,
    })
    const nextStatus = result?.progress ?? '점검 완료'

    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === currentTask.id
        ? {
          ...task,
          status: nextStatus,
          completed: nextStatus === '점검 완료',
          riskScore,
          inspectionRiskScore: riskScore,
          strength: Number(selectedStrength),
          frequency: selectedFrequency.score,
          inspectionStrength: Number(selectedStrength),
          inspectionFrequency: selectedFrequency.score,
        }
        : task
    )))

    alert(`${currentTask.text} 항목의 강도 ${selectedStrength}, 빈도 ${selectedFrequency.label}(${selectedFrequency.score}점), 위험도 ${riskScore}점 제출이 완료되었습니다. 진행 상태: ${nextStatus}`)
  }

  const handleUpdateActionBeforeRisk = () => {
    if (!currentTask) {
      alert('선택된 조치 항목이 없습니다.')
      return
    }

    const riskScore = Number(actionBeforeStrength) * actionBeforeFrequency.score
    saveChecklistActionRiskResult({
      id: currentTask.id,
      riskScore,
      strength: Number(actionBeforeStrength),
      frequency: actionBeforeFrequency.score,
    })

    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === currentTask.id
        ? {
          ...task,
          actionRiskScore: riskScore,
          actionStrength: Number(actionBeforeStrength),
          actionFrequency: actionBeforeFrequency.score,
        }
        : task
    )))

    alert(`위험도가 ${riskScore}점으로 재설정되었습니다.`)
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>체크리스트 데이터 연결 중...</div>
  }

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        {/* 1. 오늘의 업무 (체크리스트 & 조치 필요 목록) */}
        <article className="checklist-card">
          <div className="checklist-card-header">
            <div>
              <h2>점검 목록</h2>
              <p>오늘 필요한 점검과 조치 업무를 구분해 확인하세요.</p>
            </div>
            <span className="task-badge-count">총 {totalCount}건</span>
          </div>

          <div className="daily-task-tabs" role="tablist" aria-label="점검 목록 보기 전환">
            <button
              className={activeTaskView === 'inspection' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTaskView === 'inspection'}
              onClick={() => setActiveTaskView('inspection')}
            >
              오늘의 점검
              <span>{inspectionTasks.length}</span>
            </button>
            <button
              className={activeTaskView === 'action' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTaskView === 'action'}
              onClick={() => setActiveTaskView('action')}
            >
              조치 업무
              <span>{actionTasks.length}</span>
            </button>
          </div>

          <div className="checklist-progress">
            <div>
              <strong>전체 진행률</strong>
              <span>
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="task-list">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => {
                const isSelected = task.id === effectiveSelectedTaskId
                const isRejected = task.status === '조치 필요' || task.status === '반려'

                return (
                  <button
                    className={`task-item ${task.completed ? 'is-completed' : ''} ${isSelected ? 'is-selected' : ''
                      } ${isRejected ? 'is-rejected' : ''}`}
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    style={{
                      borderLeft: isRejected ? '4px solid #ef4444' : undefined,
                      backgroundColor: isSelected ? '#f3f4f6' : undefined,
                    }}
                  >
                    <div className="task-item-content">
                      <span className="task-check">
                        {task.completed ? '✓' : isRejected ? '!' : '•'}
                      </span>
                      <div className="task-text-wrap">
                        <span className="task-title">{task.text}</span>
                        <small className="task-meta">
                          {task.location} | {task.date}
                        </small>
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                {activeTaskView === 'inspection'
                  ? '오늘 할당된 점검 항목이 없습니다.'
                  : '현재 필요한 조치 업무가 없습니다.'}
              </div>
            )}
          </div>
        </article>

        <article className="checklist-card action-card">
          {activeTaskView === 'inspection' ? (
            currentTask ? (
              <div className="strength-request-panel">
                <div className="strength-request-header">
                  <span>INSPECTION REVIEW</span>
                  <h2>위험도 제출</h2>
                  <p>오늘의 점검 항목 확인 후 강도와 빈도를 선택해 위험도를 제출하세요.</p>
                </div>

                <div className="selected-task-info">
                  <span>선택 점검 항목 (#{currentTask.id})</span>
                  <h4>{currentTask.text}</h4>
                  <p>
                    위치: {currentTask.location} | 현재 상태: <strong>{currentTask.status}</strong>
                  </p>
                </div>

                <div className="strength-options" role="radiogroup" aria-label="강도 선택">
                  {STRENGTH_OPTIONS.map((strength) => (
                    <button
                      className={selectedStrength === strength ? 'is-active' : ''}
                      type="button"
                      role="radio"
                      aria-checked={selectedStrength === strength}
                      key={strength}
                      onClick={() => setSelectedStrength(strength)}
                    >
                      {strength}
                    </button>
                  ))}
                </div>

                <div className="frequency-section">
                  <div className="frequency-heading">
                    <strong>빈도 선택</strong>
                    <span>위험도 = 강도 x 빈도</span>
                  </div>
                  <div className="frequency-options" role="radiogroup" aria-label="빈도 선택">
                    {FREQUENCY_OPTIONS.map((frequency) => (
                      <button
                        className={selectedFrequency.key === frequency.key ? 'is-active' : ''}
                        type="button"
                        role="radio"
                        aria-checked={selectedFrequency.key === frequency.key}
                        key={frequency.key}
                        onClick={() => setSelectedFrequency(frequency)}
                      >
                        <strong>{frequency.label}</strong>
                        <span>{frequency.score}점</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="strength-submit-button" type="button" onClick={handleSubmitStrength}>
                  위험도 {Number(selectedStrength) * selectedFrequency.score}점 제출
                </button>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                목록에서 점검 항목을 선택해주세요.
              </div>
            )
          ) : currentTask ? (
            <>
              <h2>조치 진행 보고</h2>
              <div className="selected-task-info" style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>선택 항목 (#{currentTask.id})</span>
                <h4 style={{ margin: '4px 0', fontSize: '15px' }}>{currentTask.text}</h4>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
                  위치: {currentTask.location} | 현재 상태: <strong style={{ color: currentTask.status === '조치 필요' ? '#ef4444' : '#10b981' }}>{currentTask.status}</strong>
                </p>
              </div>

              {/* 현장 원본 사진 미리보기 (있을 경우) */}
              {currentTask.imageUrl && (
                <div className="upload-section">
                  <div className="upload-label">
                    <strong>현장 감지 사진</strong>
                  </div>
                  <div className="photo-preview" style={{ width: '120px', height: '120px' }}>
                    <img
                      src={currentTask.imageUrl}
                      alt="현장 사진"
                      onClick={() => setSelectedImage(currentTask.imageUrl)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

              {/* 조치 내용 작성 입력란 */}
              <div className="upload-section" style={{ marginTop: '12px' }}>
                <div className="upload-label">
                  <strong>조치 내용 입력</strong>
                </div>
                <textarea
                  placeholder="현장에서 수행한 조치 작업 내용을 상세히 입력하세요."
                  value={actionContent}
                  onChange={(e) => setActionContent(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* 조치 완료 사진 업로드 */}
              <ImageUploadSection
                count={afterImages.length}
                inputRef={afterInputRef}
                label="조치 완료 사진 첨부"
                images={afterImages}
                onAdd={handleFileChange}
                onDelete={deleteImage}
                onPreview={setSelectedImage}
              />

              <div className="action-risk-editor">
                <div className="frequency-heading">
                  <strong>위험도 재설정</strong>
                  <span>위험도 = 강도 x 빈도</span>
                </div>
                <div className="action-risk-current">
                  <span>기본값</span>
                  <strong>{Number(actionBeforeStrength) * actionBeforeFrequency.score}점</strong>
                  <small>조치 전 위험도를 기준으로 표시됩니다.</small>
                </div>
                <div className="strength-options is-compact" role="radiogroup" aria-label="조치 전 강도 선택">
                  {STRENGTH_OPTIONS.map((strength) => (
                    <button
                      className={actionBeforeStrength === strength ? 'is-active' : ''}
                      type="button"
                      role="radio"
                      aria-checked={actionBeforeStrength === strength}
                      key={`action-strength-${strength}`}
                      onClick={() => setActionBeforeStrength(strength)}
                    >
                      {strength}
                    </button>
                  ))}
                </div>
                <div className="frequency-options" role="radiogroup" aria-label="조치 전 빈도 선택">
                  {FREQUENCY_OPTIONS.map((frequency) => (
                    <button
                      className={actionBeforeFrequency.key === frequency.key ? 'is-active' : ''}
                      type="button"
                      role="radio"
                      aria-checked={actionBeforeFrequency.key === frequency.key}
                      key={`action-frequency-${frequency.key}`}
                      onClick={() => setActionBeforeFrequency(frequency)}
                    >
                      <strong>{frequency.label}</strong>
                      <span>{frequency.score}점</span>
                    </button>
                  ))}
                </div>
                <button className="action-risk-save-button" type="button" onClick={handleUpdateActionBeforeRisk}>
                  위험도 {Number(actionBeforeStrength) * actionBeforeFrequency.score}점 저장
                </button>
              </div>

              <button
                className="submit-action-button"
                type="button"
                onClick={handleSubmitAction}
                disabled={submitting || currentTask.completed}
                style={{
                  backgroundColor: currentTask.completed ? '#9ca3af' : '#2563eb',
                  cursor: currentTask.completed ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? '제출 중...' : currentTask.completed ? '보고 완료됨' : '완료 보고'}
              </button>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              목록에서 조치할 항목을 선택해주세요.
            </div>
          )}
        </article>
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div className="image-modal" role="presentation" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="업로드 이미지 확대 보기" />
        </div>
      )}
    </section>
  )
}

function ImageUploadSection({ count, images, inputRef, label, onAdd, onDelete, onPreview }) {
  return (
    <div className="upload-section">
      <div className="upload-label">
        <strong>{label}</strong>
        <span>{count}장</span>
      </div>
      <div className="photo-grid">
        {images.map((image, index) => (
          <div className="photo-preview" key={`${label}-${index}`}>
            <button type="button" onClick={() => onPreview(image)}>
              <img src={image} alt={`${label} ${index + 1}`} />
            </button>
            <button
              className="delete-photo-button"
              type="button"
              aria-label="사진 삭제"
              onClick={() => onDelete(index)}
            >
              <CloseIcon fontSize="inherit" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onAdd}
        />
        <button className="add-photo-button" type="button" onClick={() => inputRef.current?.click()}>
          +
        </button>
      </div>
    </div>
  )
}

export default ChecklistPage
