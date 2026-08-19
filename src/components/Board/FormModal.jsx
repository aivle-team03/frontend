import { useEffect, useRef, useState } from 'react'
import { useUiLanguage } from '../../utils/uiLanguage.js'

const initialReportForm = {
  category: '소방시설',
  categoryId: null,
  title: '',
  description: '',
  location: '',
  photoName: '',
  photoUrl: '',
  photoFile: null,
}

function FormModal({ categories, reporterName, onClose, onSubmit }) {
  const { t } = useUiLanguage()
  const [reportForm, setReportForm] = useState(initialReportForm)
  const reportPhotoInputRef = useRef(null)

  useEffect(() => {
    if (!categories.length) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReportForm((currentForm) => {
      const selectedCategory = categories.find((category) => category.name === currentForm.category)
      if (selectedCategory) return { ...currentForm, categoryId: selectedCategory.id }

      return { ...currentForm, category: categories[0].name, categoryId: categories[0].id }
    })
  }, [categories])

  const closeModal = () => {
    if (reportForm.photoUrl) {
      URL.revokeObjectURL(reportForm.photoUrl)
    }
    onClose()
  }

  const updateReportForm = (field, value) => {
    setReportForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const updateReportPhoto = (event) => {
    const file = event.target.files?.[0]

    setReportForm((currentForm) => {
      if (currentForm.photoUrl) {
        URL.revokeObjectURL(currentForm.photoUrl)
      }

      if (!file) {
        return {
          ...currentForm,
          photoName: '',
          photoUrl: '',
          photoFile: null,
        }
      }

      return {
        ...currentForm,
        photoName: file.name,
        photoUrl: URL.createObjectURL(file),
        photoFile: file,
      }
    })

    event.target.value = ''
  }

  const deleteReportPhoto = () => {
    setReportForm((currentForm) => {
      if (currentForm.photoUrl) {
        URL.revokeObjectURL(currentForm.photoUrl)
      }

      return {
        ...currentForm,
        photoName: '',
        photoUrl: '',
        photoFile: null,
      }
    })
  }

  const submitReport = (event) => {
    event.preventDefault()
    onSubmit({ ...reportForm, reporter: reporterName || '익명' })
  }

  return (
    <div className="board-modal-backdrop" role="presentation" onMouseDown={closeModal}>
      <section
        className="board-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-report-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="board-modal-header">
          <div>
            <span>{t('위험 신고')}</span>
            <h2 id="board-report-modal-title">{t('게시글 작성')}</h2>
          </div>
          <button type="button" aria-label={t('닫기')} onClick={closeModal}>×</button>
        </div>

        <form className="board-report-form" onSubmit={submitReport}>
          <label>
            <span>{t('카테고리')}</span>
            <select
              value={String(reportForm.categoryId ?? reportForm.category)}
              onChange={(event) => {
                const selectedCategory = categories.find((category) => String(category.id ?? category.name) === event.target.value)
                if (selectedCategory) {
                  setReportForm((currentForm) => ({ ...currentForm, category: selectedCategory.name, categoryId: selectedCategory.id }))
                }
              }}
              required
            >
              {categories.map((category) => (
                <option key={category.id ?? category.name} value={String(category.id ?? category.name)}>{t(category.name)}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t('제목')}</span>
            <input
              type="text"
              value={reportForm.title}
              onChange={(event) => updateReportForm('title', event.target.value)}
              placeholder={t('신고 제목을 입력하세요')}
              required
            />
          </label>

          <label>
            <span>{t('장소')}</span>
            <input
              type="text"
              value={reportForm.location}
              onChange={(event) => updateReportForm('location', event.target.value)}
              placeholder={t('예: A동 2층 복도')}
              required
            />
          </label>

          <label>
            <span>{t('내용')}</span>
            <textarea
              value={reportForm.description}
              onChange={(event) => updateReportForm('description', event.target.value)}
              placeholder={t('위험 상황을 자세히 입력하세요')}
              rows="4"
              required
            />
          </label>

          <div className="board-photo-upload-section">
            <div className="board-photo-upload-label">
              <strong>{t('사진')}</strong>
              <span>{reportForm.photoUrl ? 1 : 0}</span>
            </div>
            <div className="board-photo-upload-grid">
              {reportForm.photoUrl && (
                <div className="board-photo-upload-preview">
                  <img src={reportForm.photoUrl} alt={t('신고 사진 미리보기')} />
                  <button
                    className="board-delete-photo-button"
                    type="button"
                    aria-label={t('사진 삭제')}
                    onClick={deleteReportPhoto}
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                ref={reportPhotoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={updateReportPhoto}
              />
              {!reportForm.photoUrl && (
                <button
                  className="board-add-photo-button"
                  type="button"
                  onClick={() => reportPhotoInputRef.current?.click()}
                >
                  +
                </button>
              )}
            </div>
            {reportForm.photoName && <small className="board-photo-file-name">{reportForm.photoName}</small>}
          </div>

          <div className="board-modal-actions">
            <button className="board-modal-cancel" type="button" onClick={closeModal}>{t('취소')}</button>
            <button className="board-modal-submit" type="submit">{t('등록')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default FormModal
