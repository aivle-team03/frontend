import { useState } from 'react'

const initialRiskForm = {
  type: '',
  item: '',
  risk: '',
  severity: '1',
}

function RiskFormModal({ onClose, onSubmit }) {
  const [riskForm, setRiskForm] = useState(initialRiskForm)

  const updateRiskForm = (field, value) => {
    setRiskForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const submitRisk = (event) => {
    event.preventDefault()
    onSubmit({
      ...riskForm,
      severity: Number(riskForm.severity),
      frequency: 1,
    })
  }

  return (
    <div className="risk-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="risk-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-form-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="risk-modal-header">
          <div>
            <span>위험 요인 편집</span>
            <h2 id="risk-form-modal-title">항목 추가</h2>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>

        <form className="risk-form" onSubmit={submitRisk}>
          <label>
            <span>유형</span>
            <input
              type="text"
              value={riskForm.type}
              onChange={(event) => updateRiskForm('type', event.target.value)}
              placeholder="예: 소방"
              required
            />
          </label>

          <label>
            <span>항목</span>
            <input
              type="text"
              value={riskForm.item}
              onChange={(event) => updateRiskForm('item', event.target.value)}
              placeholder="예: 화재"
              required
            />
          </label>

          <div className="risk-form-grid">
            <label>
              <span>위험도</span>
              <select
                value={riskForm.risk}
                onChange={(event) => updateRiskForm('risk', event.target.value)}
                required
              >
                <option value="">위험도 선택</option>
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </select>
            </label>

            <label>
              <span>강도</span>
              <select
                value={riskForm.severity}
                onChange={(event) => updateRiskForm('severity', event.target.value)}
                required
              >
                {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="risk-modal-actions">
            <button className="risk-modal-cancel" type="button" onClick={onClose}>취소</button>
            <button className="risk-modal-submit" type="submit">등록</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default RiskFormModal
