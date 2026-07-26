import CloseIcon from '@mui/icons-material/Close'
import { useRef, useState } from 'react'
import { CHECKLIST_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/checklist.css'

function ChecklistPage() {
  const [dataByLocation, setDataByLocation] = useState(CHECKLIST_MOCK_DATA)
  const [selectedLocation, setSelectedLocation] = useState(Object.keys(CHECKLIST_MOCK_DATA)[0])
  const [selectedTaskId, setSelectedTaskId] = useState(CHECKLIST_MOCK_DATA[Object.keys(CHECKLIST_MOCK_DATA)[0]][0]?.id)
  const [actionRecords, setActionRecords] = useState({})
  const [selectedImage, setSelectedImage] = useState(null)
  const photoInputRef = useRef(null)

  const currentTasks = dataByLocation[selectedLocation] ?? []
  const selectedTask = currentTasks.find((task) => task.id === selectedTaskId) ?? currentTasks[0]
  const selectedAction = actionRecords[selectedTask?.id] ?? { content: '', images: [] }
  const completedCount = currentTasks.filter((task) => task.completed).length
  const totalCount = currentTasks.length
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  const selectLocation = (location) => {
    setSelectedLocation(location)
    setSelectedTaskId(dataByLocation[location]?.[0]?.id)
  }

  const toggleTask = (taskId) => {
    setDataByLocation((currentData) => ({
      ...currentData,
      [selectedLocation]: currentData[selectedLocation].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }))
  }

  const updateSelectedAction = (patch) => {
    if (!selectedTask) return
    setActionRecords((current) => ({
      ...current,
      [selectedTask.id]: { content: '', images: [], ...current[selectedTask.id], ...patch },
    }))
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files ?? [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setActionRecords((current) => {
          const record = current[selectedTask.id] ?? { content: '', images: [] }
          return { ...current, [selectedTask.id]: { ...record, images: [...record.images, reader.result] } }
        })
      }
      reader.readAsDataURL(file)
    })
    event.target.value = ''
  }

  const deleteImage = (index) => updateSelectedAction({ images: selectedAction.images.filter((_, imageIndex) => imageIndex !== index) })

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        <article className="checklist-card">
          <div className="checklist-card-header">
            <h2>오늘의 점검 목록</h2>
            <select value={selectedLocation} onChange={(event) => selectLocation(event.target.value)}>
              {Object.keys(dataByLocation).map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
          </div>

          <div className="checklist-progress">
            <div><strong>진행률</strong><span>{completedCount}/{totalCount} ({progressPercent}%)</span></div>
            <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
          </div>

          <div className="task-list">
            {currentTasks.map((task) => (
              <div className={`task-item${task.completed ? ' is-completed' : ''}${task.id === selectedTask?.id ? ' is-selected' : ''}`} key={task.id} role="button" tabIndex={0} onClick={() => setSelectedTaskId(task.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedTaskId(task.id) }}>
                <button className="task-check" type="button" aria-label={`${task.text} 완료 처리`} onClick={(event) => { event.stopPropagation(); toggleTask(task.id) }}>{task.completed && '✓'}</button>
                <span>{task.text}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="checklist-card action-card">
          <h2>조치 내용 등록</h2>
          {selectedTask ? <>
            <div className="selected-task-summary">
              <span>선택 항목 (#{selectedTask.id})</span>
              <strong>{selectedTask.text}</strong>
              <p>위치: {selectedLocation}</p>
            </div>
            <label className="action-content-field">
              <strong>조치 내용 입력</strong>
              <textarea value={selectedAction.content} onChange={(event) => updateSelectedAction({ content: event.target.value })} placeholder="현장에서 확인하거나 조치한 내용을 상세히 입력하세요." />
            </label>
            <ImageUploadSection count={selectedAction.images.length} images={selectedAction.images} inputRef={photoInputRef} onAdd={handleFileChange} onDelete={deleteImage} onPreview={setSelectedImage} />
          </> : <p className="no-selected-task">점검 항목을 선택해 주세요.</p>}
          <button className="submit-action-button" type="button">완료 보고</button>
        </article>
      </div>

      {selectedImage && <div className="image-modal" role="presentation" onClick={() => setSelectedImage(null)}><img src={selectedImage} alt="첨부 이미지 크게 보기" /></div>}
    </section>
  )
}

function ImageUploadSection({ count, images, inputRef, onAdd, onDelete, onPreview }) {
  return <div className="upload-section">
    <div className="upload-label"><strong>점검 완료 사진 첨부</strong><span>{count}장</span></div>
    <div className="photo-grid">
      {images.map((image, index) => <div className="photo-preview" key={image}><button type="button" onClick={() => onPreview(image)}><img src={image} alt={`점검 완료 사진 ${index + 1}`} /></button><button className="delete-photo-button" type="button" aria-label="사진 삭제" onClick={() => onDelete(index)}><CloseIcon fontSize="inherit" /></button></div>)}
      <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={onAdd} />
      <button className="add-photo-button" type="button" aria-label="사진 첨부" onClick={() => inputRef.current?.click()}>+</button>
    </div>
  </div>
}

export default ChecklistPage
