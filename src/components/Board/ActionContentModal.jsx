import { useState } from 'react'

function ActionContentModal({ report, onClose, onSubmit }) {
  const [actionContent, setActionContent] = useState(report?.actionContent ?? '')

  const submitActionContent = (event) => {
    event.preventDefault()

    if (!actionContent.trim()) {
      alert('조치내용을 입력해 주세요.')
      return
    }

    onSubmit(actionContent.trim())
  }

  return (
    <div className="board-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="board-report-modal board-action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-action-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="board-modal-header">
          <div>
            <span>조치 완료</span>
            <h2 id="board-action-modal-title">조치내용 등록</h2>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>

        <form className="board-action-form" onSubmit={submitActionContent}>
          <div className="board-action-target">
            <span>대상 신고</span>
            <strong>{report?.title}</strong>
          </div>

          <label>
            <span>조치내용 <em>*</em></span>
            <textarea
              value={actionContent}
              placeholder="완료한 조치 내용, 확인 결과, 후속 관리 사항을 입력하세요"
              onChange={(event) => setActionContent(event.target.value)}
            />
          </label>

          <div className="board-modal-actions">
            <button className="board-modal-cancel" type="button" onClick={onClose}>취소</button>
            <button className="board-modal-submit" type="submit">등록</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ActionContentModal
