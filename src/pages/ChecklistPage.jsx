import CloseIcon from '@mui/icons-material/Close'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import '../styles/checklist.css'

const API_BASE_URL = 'http://127.0.0.1:8000'

function ChecklistPage() {
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  // 조치 보고용 입력 상태
  const [actionContent, setActionContent] = useState('')
  const [afterImages, setAfterImages] = useState([])
  const [imageFiles, setImageFiles] = useState([]) // 실제 업로드할 File 객체
  const [selectedImage, setSelectedImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const afterInputRef = useRef(null)

  // ==========================================
  // 1. 백엔드에서 체크리스트 목록 조회 (GET /api/checklists)
  // ==========================================
  useEffect(() => {
    fetchChecklists()
  }, [])

  const fetchChecklists = async () => {
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
        }))

        setTasks(formattedTasks)

        // 첫 번째 조치/점검 항목 기본 선택
        if (formattedTasks.length > 0) {
          setSelectedTaskId(formattedTasks[0].id)
        }
      }
    } catch (error) {
      console.error('체크리스트 로드 실패:', error)
      alert('체크리스트 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 현재 선택된 체크리스트 항목
  const currentTask = tasks.find((t) => t.id === selectedTaskId)

  // 진행률 계산
  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

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

      await axios.patch(`${API_BASE_URL}/api/checklists/${currentTask.id}/complete`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
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

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>체크리스트 데이터 연결 중...</div>
  }

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        {/* 1. 오늘의 업무 (체크리스트 & 조치 필요 목록) */}
        <article className="checklist-card">
          <div className="checklist-card-header">
            <h2>오늘의 점검 및 조치 업무</h2>
            <span className="task-badge-count">총 {totalCount}건</span>
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
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const isSelected = task.id === selectedTaskId
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

                    <span
                      className={`task-status-tag ${isRejected
                        ? 'tag-red'
                        : task.type === '조치'
                          ? 'tag-orange'
                          : 'tag-blue'
                        }`}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        color: isRejected ? '#ef4444' : task.type === '조치' ? '#f59e0b' : '#3b82f6',
                        backgroundColor: isRejected ? '#fef2f2' : '#fef3c7',
                      }}
                    >
                      {isRejected ? '조치 필요 (반려)' : task.status}
                    </span>
                  </button>
                )
              })
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                현재 할당된 점검 및 조치 항목이 없습니다.
              </div>
            )}
          </div>
        </article>

        {/* 2. 조치 진행 및 보고 작성 카드 */}
        <article className="checklist-card action-card">
          <h2>조치 진행 보고</h2>

          {currentTask ? (
            <>
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
