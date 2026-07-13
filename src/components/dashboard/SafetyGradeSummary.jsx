import safetyShieldImage from '../../assets/safety-shield.png'

function SafetyGradeSummary() {
  return (
    <section className="safety-summary">
      <div className="safety-grade">
        <img className="shield-image" src={safetyShieldImage} alt="" aria-hidden="true" />
        <div className="safety-grade-copy">
          <span>종합 안전 등급</span>
          <strong>A</strong>
        </div>
      </div>
      <div className="safety-copy">
        <h2>요약</h2>
        <p>
          전반적으로 소방 안전 상태가 양호합니다. 일부 구역에서 경미한 위험 요인이
          감지되었지만 즉시 조치가 필요한 사항은 없습니다. 정기 점검 및 관리가
          적절히 이루어지고 있습니다.
        </p>
      </div>
    </section>
  )
}

export default SafetyGradeSummary
