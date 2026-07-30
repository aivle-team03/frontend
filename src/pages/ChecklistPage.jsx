import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/checklist.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

function createKey(prefix, id) {
  return `${prefix}-${id}`
}

function sortTasksByCompletion(tasks, view) {
  return [...tasks].sort((a, b) => {
    const aCompleted = view === 'inspection' ? a.inspectionStatus === '점검 완료' : a.status === '조치 완료'
    const bCompleted = view === 'inspection' ? b.inspectionStatus === '점검 완료' : b.status === '조치 완료'
    return Number(aCompleted) - Number(bCompleted)
  })
}

function ChecklistPage() {
  const [inspectionTasks, setInspectionTasks] = useState([])
  const [actionTasks, setActionTasks] = useState([])
  const [activeTaskView, setActiveTaskView] = useState('inspection')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [actionContent, setActionContent] = useState('')
  const [actionDetailContent, setActionDetailContent] = useState('')
  const [actionPhotoFiles, setActionPhotoFiles] = useState([])
  const [actionPhotoFilesByTask, setActionPhotoFilesByTask] = useState({})
  const [previewPhoto, setPreviewPhoto] = useState(null)
  const actionPhotoInputRef = useRef(null)

  // 1. 내 배정 점검 이력 불러오기 (GET /api/inspection/histories/me)
  const fetchMyInspectionHistories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/inspection/histories/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!Array.isArray(response.data)) return

      const myInspections = response.data.map((item) => {
        const isCompleted = item.status === '점검 완료'
        return {
          id: item.inspection_history_id,
          taskKey: createKey('inspection', item.inspection_history_id),
          text: item.name || '점검 항목',
          location: item.location || '현장 구역',
          date: item.date ? String(item.date).slice(0, 10) : '',
          inspectedAt: item.date ? String(item.date).slice(0, 10) : '',
          inspector: item.uid ? `User #${item.uid}` : '담당자',
          category: '정기 점검',
          category_id: item.category_id || 1,
          inspectionStatus: item.status || '점검 대기',
          movedToAction: Boolean(item.is_action_required),
          content: item.content || '',
          completed: isCompleted,
        }
      })

      setInspectionTasks(myInspections)
    } catch (error) {
      console.warn('내 점검 이력 API 조회 실패:', error)
    }
  }

  // 2. 내 배정 조치 이력 불러오기 (GET /api/action-histories/me)
  const fetchMyActionHistories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/action-histories/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const items = response.data?.items || (Array.isArray(response.data) ? response.data : [])

      const myActions = items.map((item) => {
        const isCompleted = item.action_status === '조치 완료'
        return {
          id: item.action_history_id,
          taskKey: createKey('action', item.action_history_id),
          text: item.action_name || '조치 항목',
          inspectionRef: item.action_name,
          location: item.location || '현장 구역',
          date: item.created_at ? String(item.created_at).slice(0, 10) : '',
          status: item.action_status || '조치 대기',
          category: item.category || item.category_name || '시설 안전',
          content: item.content || '',
          completed: isCompleted,
          photos: item.image_url ? [{ name: '조치 사진', url: item.image_url }] : [],
        }
      })

      setActionTasks(myActions)
    } catch (error) {
      console.warn('내 조치 이력 API 조회 실패:', error)
    }
  }

  useEffect(() => {
    fetchMyInspectionHistories()
    fetchMyActionHistories()
  }, [])

  const rawVisibleTasks = activeTaskView === 'inspection' ? inspectionTasks : actionTasks
  const visibleTasks = sortTasksByCompletion(rawVisibleTasks, activeTaskView)
  const effectiveSelectedTaskId = visibleTasks.some((task) => task.taskKey === selectedTaskId)
    ? selectedTaskId
    : visibleTasks[0]?.taskKey
  const currentTask = visibleTasks.find((task) => task.taskKey === effectiveSelectedTaskId)

  const progress = useMemo(() => {
    const done = activeTaskView === 'inspection'
      ? inspectionTasks.filter((task) => task.inspectionStatus === '점검 완료' || task.movedToAction).length
      : actionTasks.filter((task) => task.status === '조치 완료').length
    return {
      done,
      total: visibleTasks.length,
      percent: visibleTasks.length ? Math.round((done / visibleTasks.length) * 100) : 0,
    }
  }, [activeTaskView, actionTasks, inspectionTasks, visibleTasks.length])

  useEffect(() => {
    if (activeTaskView !== 'action' || !currentTask) return

    setActionDetailContent(currentTask.content || '')
    setActionPhotoFiles(actionPhotoFilesByTask[currentTask.taskKey] ?? (currentTask.photos || []))
  }, [actionPhotoFilesByTask, activeTaskView, currentTask])

  // 3. [점검 완료] 처리 (is_action_required: false)
  const completeInspection = async () => {
    if (!currentTask) return
    try {
      const token = localStorage.getItem('token')
      const payload = {
        status: '점검 완료',
        is_action_required: false,
        content: actionContent.trim() || currentTask.content || undefined,
      }

      await axios.patch(
        `${API_BASE_URL}/api/inspection/histories/${currentTask.id}`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      )

      const nextSelectedTask = inspectionTasks.find(
        (task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료'
      )

      setInspectionTasks((current) =>
        current.map((task) =>
          task.taskKey === currentTask.taskKey
            ? { ...task, inspectionStatus: '점검 완료', completed: true, content: payload.content || task.content }
            : task
        )
      )
      setActionContent('')
      setSelectedTaskId(nextSelectedTask?.taskKey ?? null)
      alert('점검이 완료 처리되었습니다.')
    } catch (error) {
      console.error('점검 완료 처리 중 오류가 발생했습니다:', error)
      alert('점검 완료 처리 실패했습니다.')
    }
  }

  // 4. [조치 필요] 처리 (점검 상태 업데이트 + POST /api/action-histories 조치 항목 생성)
  const registerAction = async () => {
    if (!currentTask) return
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      const contentText = actionContent.trim() || currentTask.content || '조치가 필요한 점검 건입니다.'

      // (1) 점검 이력 상태를 '점검 완료' & is_action_required: true 로 변경
      await axios.patch(
        `${API_BASE_URL}/api/inspection/histories/${currentTask.id}`,
        {
          status: '점검 완료',
          is_action_required: true,
          content: contentText,
        },
        { headers }
      )

      // (2) 해당 점검 이력을 출처(SourceType: "점검이력")로 하는 새로운 조치 이력 생성
      await axios.post(
        `${API_BASE_URL}/api/action-histories`,
        {
          source_type: '점검이력',
          source_id: currentTask.id,
          action_name: currentTask.text,
          category_id: currentTask.category_id || 1,
          location: currentTask.location,
          content: contentText,
        },
        { headers }
      )

      const nextSelectedTask = inspectionTasks.find(
        (task) => task.taskKey !== currentTask.taskKey && task.inspectionStatus !== '점검 완료'
      )

      setInspectionTasks((current) =>
        current.map((task) =>
          task.taskKey === currentTask.taskKey
            ? { ...task, movedToAction: true, inspectionStatus: '점검 완료', completed: true, content: contentText }
            : task
        )
      )
      setActionContent('')
      setSelectedTaskId(nextSelectedTask?.taskKey ?? null)

      // 조치 목록 최신화
      await fetchMyActionHistories()
      alert('조치가 필요한 항목으로 등록되고 조치 이력이 생성되었습니다.')
    } catch (error) {
      console.error('조치 필요 처리 중 오류가 발생했습니다:', error)
      alert(error.response?.data?.detail || '조치 필요 처리 중 오류가 발생했습니다.')
    }
  }

  const handleActionPhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length || !currentTask) return

    setActionPhotoFiles((current) => {
      const nextPhotos = [...current, ...files.map((file) => ({ file, name: file.name, url: URL.createObjectURL(file) }))]
      setActionPhotoFilesByTask((currentMap) => ({ ...currentMap, [currentTask.taskKey]: nextPhotos }))
      return nextPhotos
    })
    event.target.value = ''
  }

  const removeActionPhoto = (target) =>
    setActionPhotoFiles((current) => {
      const nextPhotos = current.filter((photo) => {
        const shouldRemove = photo.url === target.url
        if (shouldRemove && photo.file) URL.revokeObjectURL(photo.url)
        return !shouldRemove
      })

      if (currentTask) {
        setActionPhotoFilesByTask((currentMap) => ({ ...currentMap, [currentTask.taskKey]: nextPhotos }))
      }

      return nextPhotos
    })

  // 5. [조치 완료] 처리 API 연동 (PATCH /api/action-histories/{action_history_id}/complete)
  const completeAction = async () => {
    if (!currentTask) return
    if (!actionDetailContent.trim()) {
      alert('조치내용을 입력해 주세요.')
      return
    }

    const currentPhotos = actionPhotoFilesByTask[currentTask.taskKey] ?? actionPhotoFiles
    const photoToUpload = currentPhotos.find((p) => p.file)

    if (!photoToUpload) {
      alert('조치 완료 사진을 첨부해 주세요.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('content', actionDetailContent.trim())
      formData.append('image', photoToUpload.file)

      const response = await axios.patch(
        `${API_BASE_URL}/api/action-histories/${currentTask.id}/complete`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )

      setActionTasks((prev) =>
        prev.map((task) =>
          task.taskKey === currentTask.taskKey
            ? {
              ...task,
              status: '조치 완료',
              completed: true,
              content: response.data.content || actionDetailContent.trim(),
              photos: response.data.image_url ? [{ name: '조치 사진', url: response.data.image_url }] : currentPhotos,
            }
            : task
        )
      )

      alert('조치가 완료 처리되었습니다 (승인 대기).')
    } catch (error) {
      console.error('조치 완료 처리 실패:', error)
      alert(error.response?.data?.detail || '조치 완료 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        <article className="checklist-card">
          <div className="checklist-card-header">
            <div>
              <h2>점검 · 조치 목록</h2>
              <p>점검 결과를 확인하고 조치가 필요한 건을 관리하세요.</p>
            </div>
            <span className="task-badge-count">총 {visibleTasks.length}건</span>
          </div>

          <div className="daily-task-tabs" role="tablist" aria-label="점검 및 조치 목록 전환">
            <button
              className={activeTaskView === 'inspection' ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveTaskView('inspection')}
            >
              점검 목록 <span>{inspectionTasks.length}</span>
            </button>
            <button
              className={activeTaskView === 'action' ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveTaskView('action')}
            >
              조치 목록 <span>{actionTasks.length}</span>
            </button>
          </div>

          <div className="checklist-progress">
            <div>
              <strong>전체 진행률</strong>
              <span>
                {progress.done}/{progress.total} ({progress.percent}%)
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress.percent}%` }} />
            </div>
          </div>

          <div className="task-list">
            {visibleTasks.map((task) => {
              const selected = task.taskKey === effectiveSelectedTaskId
              const status = activeTaskView === 'inspection' ? task.inspectionStatus : task.status
              const isLocked = activeTaskView === 'inspection' && status === '점검 완료'
              const isCompletedAction = activeTaskView === 'action' && status === '조치 완료'
              return (
                <button
                  className={`task-item ${selected ? 'is-selected' : ''} ${isLocked || isCompletedAction ? 'is-completed' : ''}`}
                  key={task.taskKey}
                  type="button"
                  onClick={() => setSelectedTaskId(task.taskKey)}
                >
                  <div className="task-item-content">
                    <span className="task-check">{task.completed ? '✓' : '·'}</span>
                    <div className="task-text-wrap">
                      <span className="task-title">{task.text}</span>
                      <small className="task-meta">
                        {task.location} | {task.date}
                      </small>
                    </div>
                  </div>
                </button>
              )
            })}
            {!visibleTasks.length && <div className="checklist-empty">등록된 항목이 없습니다.</div>}
          </div>
        </article>

        {/* 우측 패널 */}
        <article className="checklist-card action-card">
          {activeTaskView === 'inspection' && currentTask ? (
            <div className="action-registration-panel">
              <div className="strength-request-header">
                <span>INSPECTION REGISTRATION</span>
                <h2>점검 결과 등록</h2>
                <p>배정된 점검 항목의 확인 결과를 입력하고 완료 또는 조치 필요 상태로 설정합니다.</p>
              </div>
              <section className="inspection-reference-card">
                <div>
                  <span>점검명</span>
                  <strong>{currentTask.text}</strong>
                </div>
                <div>
                  <span>현장 구역</span>
                  <strong>{currentTask.location}</strong>
                </div>
                <div>
                  <span>진행 상황</span>
                  <strong>{currentTask.inspectionStatus}</strong>
                </div>
              </section>

              {currentTask.completed ? (
                currentTask.movedToAction ? (
                  <div className="action-already-registered is-warning">
                    <strong>조치 필요 항목으로 등록되었습니다.</strong>
                    <p style={{ marginTop: '8px', color: '#555' }}>
                      이 점검 건은 추가 조치가 필요한 항목입니다.
                    </p>
                    {currentTask.content && (
                      <p style={{ marginTop: '6px', color: '#666' }}>
                        <strong>등록 내용:</strong> {currentTask.content}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="action-already-registered">
                    <strong>점검 처리가 완료되었습니다.</strong>
                    {currentTask.content && (
                      <p style={{ marginTop: '8px', color: '#666' }}>
                        <strong>입력 내용:</strong> {currentTask.content}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <div className="action-registration-form">
                  <label className="is-wide">
                    <span>점검 내용 / 메모</span>
                    <textarea
                      value={actionContent}
                      onChange={(event) => setActionContent(event.target.value)}
                      placeholder="점검 결과 또는 필요한 조치 내용을 입력하세요."
                      rows="4"
                    />
                  </label>
                  <div className="inspection-result-actions">
                    <button
                      className="inspection-complete-button"
                      type="button"
                      onClick={completeInspection}
                    >
                      점검 완료
                    </button>
                    <button
                      className="action-required-button"
                      type="button"
                      onClick={registerAction}
                    >
                      조치 필요
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTaskView === 'action' && currentTask ? (
            <div className="action-detail-panel">
              <div className="strength-request-header">
                <span>ACTION DETAIL</span>
                <h2>조치내용</h2>
                <p>점검 이력이 연결된 조치 업무입니다.</p>
              </div>
              <section className="inspection-reference-card">
                <div>
                  <span>이름</span>
                  <strong>{currentTask.inspectionRef || currentTask.text}</strong>
                </div>
                <div>
                  <span>현장 구역</span>
                  <strong>{currentTask.location}</strong>
                </div>
                <div>
                  <span>진행 상황</span>
                  <strong>{currentTask.status || '조치 대기'}</strong>
                </div>
              </section>
              <div className="action-registration-form">
                <label className="is-wide">
                  <span>조치내용</span>
                  <textarea
                    value={actionDetailContent}
                    readOnly={currentTask.completed}
                    onChange={(event) => setActionDetailContent(event.target.value)}
                    placeholder="수행한 조치 내용을 입력하세요."
                    rows="5"
                  />
                </label>
                {!currentTask.completed && (
                  <div className="upload-section">
                    <div className="upload-label">
                      <strong>사진 첨부</strong>
                      <span>{actionPhotoFiles.length}장</span>
                    </div>
                    <div className="photo-grid">
                      {actionPhotoFiles.map((photo) => (
                        <div className="photo-preview" key={photo.url}>
                          <button type="button" aria-label={`${photo.name} 크게 보기`} onClick={() => setPreviewPhoto(photo)}>
                            <img src={photo.url} alt={photo.name} />
                          </button>
                          <button
                            className="delete-photo-button"
                            type="button"
                            aria-label={`${photo.name} 삭제`}
                            onClick={() => removeActionPhoto(photo)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        ref={actionPhotoInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleActionPhotoChange}
                      />
                      <button
                        className="add-photo-button"
                        type="button"
                        aria-label="사진 추가"
                        onClick={() => actionPhotoInputRef.current?.click()}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                {!currentTask.completed && (
                  <button className="submit-action-button" type="button" onClick={completeAction}>
                    조치완료
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="checklist-empty">목록에서 항목을 선택해 주세요.</div>
          )}
        </article>
      </div>

      {previewPhoto && (
        <button className="image-modal" type="button" aria-label="사진 크게 보기 닫기" onClick={() => setPreviewPhoto(null)}>
          <img src={previewPhoto.url} alt={previewPhoto.name} />
        </button>
      )}
    </section>
  )
}

export default ChecklistPage