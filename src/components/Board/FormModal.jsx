import { useRef, useState } from 'react'

const initialReportForm = {
  category: '소방시설',
  title: '',
  description: '',
  riskLevel: '',
  location: '',
  reporter: '',
  photoName: '',
  photoUrl: '',
}

function FormModal({ categories, riskOptions, onClose, onSubmit }) {
  const [reportForm, setReportForm] = useState(initialReportForm)
  const reportPhotoInputRef = useRef(null)

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
        return { ...currentForm, photoName: '', photoUrl: '' }
      }

      return {
        ...currentForm,
        photoName: file.name,
        photoUrl: URL.createObjectURL(file),
      }
    })

    event.target.value = ''
  }

  const deleteReportPhoto = () => {
    setReportForm((currentForm) => {
      if (currentForm.photoUrl) {
        URL.revokeObjectURL(currentForm.photoUrl)
      }

      return { ...currentForm, photoName: '', photoUrl: '' }
    })
  }

  const submitReport = (event) => {
    event.preventDefault()
    onSubmit(reportForm)
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
            <span>위험 신고</span>
            <h2 id="board-report-modal-title">게시글 작성</h2>
          </div>
          <button type="button" aria-label="닫기" onClick={closeModal}>×</button>
        </div>

        <form className="board-report-form" onSubmit={submitReport}>
          <div className="board-form-grid">
            <label>
              <span>카테고리</span>
              <select
                value={reportForm.category}
                onChange={(event) => updateReportForm('category', event.target.value)}
                required
              >
                {categories.filter((category) => category !== '전체').map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              <span>위험도 <em>*</em></span>
              <select
                value={reportForm.riskLevel}
                onChange={(event) => updateReportForm('riskLevel', event.target.value)}
                required
              >
                <option value="">위험도 선택</option>
                {riskOptions.map((risk) => (
                  <option key={risk.level} value={risk.level}>{risk.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>제목</span>
            <input
              type="text"
              value={reportForm.title}
              onChange={(event) => updateReportForm('title', event.target.value)}
              placeholder="신고 제목을 입력하세요"
              required
            />
          </label>

          <label>
            <span>장소</span>
            <input
              type="text"
              value={reportForm.location}
              onChange={(event) => updateReportForm('location', event.target.value)}
              placeholder="예: A동 2층 복도"
              required
            />
          </label>

          <label>
            <span>신고자</span>
            <input
              type="text"
              value={reportForm.reporter}
              onChange={(event) => updateReportForm('reporter', event.target.value)}
              placeholder="신고자 이름"
              required
            />
          </label>

          <label>
            <span>내용</span>
            <textarea
              value={reportForm.description}
              onChange={(event) => updateReportForm('description', event.target.value)}
              placeholder="위험 상황을 자세히 입력하세요"
              rows="4"
              required
            />
          </label>

          <div className="board-photo-upload-section">
            <div className="board-photo-upload-label">
              <strong>사진</strong>
              <span>{reportForm.photoUrl ? 1 : 0}</span>
            </div>
            <div className="board-photo-upload-grid">
              {reportForm.photoUrl && (
                <div className="board-photo-upload-preview">
                  <img src={reportForm.photoUrl} alt="신고 사진 미리보기" />
                  <button
                    className="board-delete-photo-button"
                    type="button"
                    aria-label="사진 삭제"
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
            <button className="board-modal-cancel" type="button" onClick={closeModal}>취소</button>
            <button className="board-modal-submit" type="submit">등록</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default FormModal
