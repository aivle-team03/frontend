import CloseIcon from '@mui/icons-material/Close'
import { useRef, useState } from 'react'
import { CHECKLIST_MOCK_DATA } from '../mocks/mockData.js'
import '../styles/checklist.css'

function ChecklistPage() {
  const [dataByLocation, setDataByLocation] = useState(CHECKLIST_MOCK_DATA)
  const [selectedLocation, setSelectedLocation] = useState(Object.keys(CHECKLIST_MOCK_DATA)[0])
  const [beforeImages, setBeforeImages] = useState([])
  const [afterImages, setAfterImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const beforeInputRef = useRef(null)
  const afterInputRef = useRef(null)

  const currentTasks = dataByLocation[selectedLocation] ?? []
  const completedCount = currentTasks.filter((task) => task.completed).length
  const totalCount = currentTasks.length
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  const toggleTask = (taskId) => {
    setDataByLocation((currentData) => ({
      ...currentData,
      [selectedLocation]: currentData[selectedLocation].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }))
  }

  const handleFileChange = (event, setImages) => {
    const files = Array.from(event.target.files ?? [])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((currentImages) => [...currentImages, reader.result])
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  const deleteImage = (index, setImages) => {
    setImages((currentImages) => currentImages.filter((_, imageIndex) => imageIndex !== index))
  }

  return (
    <section className="checklist-page">
      <div className="checklist-grid">
        <article className="checklist-card">
          <div className="checklist-card-header">
            <h2>오늘의 업무</h2>
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
            >
              {Object.keys(dataByLocation).map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="checklist-progress">
            <div>
              <strong>진행률</strong>
              <span>
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="task-list">
            {currentTasks.map((task) => (
              <button
                className={task.completed ? 'task-item is-completed' : 'task-item'}
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
              >
                <span className="task-check">{task.completed && '✓'}</span>
                <span>{task.text}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="checklist-card action-card">
          <h2>조치 진행</h2>
          <ImageUploadSection
            count={beforeImages.length}
            inputRef={beforeInputRef}
            label="현장 사진"
            images={beforeImages}
            onAdd={(event) => handleFileChange(event, setBeforeImages)}
            onDelete={(index) => deleteImage(index, setBeforeImages)}
            onPreview={setSelectedImage}
          />
          <ImageUploadSection
            count={afterImages.length}
            inputRef={afterInputRef}
            label="조치 완료 사진"
            images={afterImages}
            onAdd={(event) => handleFileChange(event, setAfterImages)}
            onDelete={(index) => deleteImage(index, setAfterImages)}
            onPreview={setSelectedImage}
          />
          <button className="submit-action-button" type="button">
            완료 보고
          </button>
        </article>
      </div>

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
        <span>{count}</span>
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
          multiple
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