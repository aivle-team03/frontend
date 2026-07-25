import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { useState } from 'react'
import '../styles/SafetyManagementPage.css'

const initialPolicy = {
  policy: '근로자의 생명과 건강을 최우선 가치로 두고, 모든 작업에서 위험요인을 사전에 확인하고 개선한다.',
  goal: '중대재해 0건, 위험성 평가 이행률 100%, 개선조치 기한 준수율 95% 이상',
  acceptableRisk: 'low',
}

const riskLevels = [
  { key: 'high', label: '높음', description: '높음까지 허용하며 주요 위험은 책임자 승인 후 관리합니다.' },
  { key: 'medium', label: '보통', description: '보통 이하만 허용하며 높은 위험은 개선 전 작업을 제한합니다.' },
  { key: 'low', label: '낮음', description: '낮음만 허용하며 보통 이상 위험은 개선 후 진행합니다.' },
]

const initialRoles = [
  { id: 1, team: '안전보건관리책임자', owner: '유진', responsibility: '안전보건 방침 승인 및 주요 위험 개선 의사결정' },
  { id: 2, team: '관리감독자', owner: '현장 팀장', responsibility: '작업 전 위험요인 확인, 근로자 교육 및 개선조치 확인' },
  { id: 3, team: '근로자', owner: '전 직원', responsibility: '위험요인 발견 시 즉시 신고하고 안전수칙 준수' },
]

function SafetyManagementPage() {
  const [policyForm, setPolicyForm] = useState(initialPolicy)
  const [roles, setRoles] = useState(initialRoles)

  const updatePolicy = (field, value) => {
    setPolicyForm((current) => ({ ...current, [field]: value }))
  }

  const updateRole = (roleId, field, value) => {
    setRoles((currentRoles) => currentRoles.map((role) => (
      role.id === roleId ? { ...role, [field]: value } : role
    )))
  }

  const addRole = () => {
    setRoles((currentRoles) => [
      ...currentRoles,
      { id: Date.now(), team: '', owner: '', responsibility: '' },
    ])
  }

  const saveSettings = () => {
    alert('안전보건 관리 설정이 저장되었습니다.')
  }

  return (
    <section className="safety-management-page" aria-label="안전보건 관리 설정">
      <section className="safety-policy-card">
        <div className="safety-card-heading">
          <span><FlagOutlinedIcon /> 방침과 목표</span>
          <h2>안전보건 방침과 목표 수립</h2>
        </div>

        <div className="safety-form-grid">
          <label>
            <span>안전보건 방침</span>
            <textarea value={policyForm.policy} onChange={(event) => updatePolicy('policy', event.target.value)} />
          </label>
          <label>
            <span>안전보건 목표</span>
            <textarea value={policyForm.goal} onChange={(event) => updatePolicy('goal', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> 조직과 역할</span>
            <h2>위험성 평가 실시 조직 구성 및 역할부여</h2>
          </div>
          <button className="safety-add-button" type="button" onClick={addRole}>
            <AddRoundedIcon /> 역할 추가
          </button>
        </div>

        <div className="safety-role-table">
          <div className="safety-role-head">
            <span>조직/역할</span>
            <span>담당자</span>
            <span>주요 책임</span>
          </div>
          {roles.map((role) => (
            <div className="safety-role-row" key={role.id}>
              <input value={role.team} placeholder="조직 또는 역할" onChange={(event) => updateRole(role.id, 'team', event.target.value)} />
              <input value={role.owner} placeholder="담당자" onChange={(event) => updateRole(role.id, 'owner', event.target.value)} />
              <input value={role.responsibility} placeholder="주요 책임" onChange={(event) => updateRole(role.id, 'responsibility', event.target.value)} />
            </div>
          ))}
        </div>
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading">
          <span><SecurityOutlinedIcon /> 위험성 기준</span>
          <h2>허용가능한 위험도 설정</h2>
        </div>

        <div className="safety-standard-grid">
          {riskLevels.map((risk) => (
            <button
              className={`safety-risk-option standard-${risk.key}${policyForm.acceptableRisk === risk.key ? ' is-selected' : ''}`}
              type="button"
              key={risk.key}
              onClick={() => updatePolicy('acceptableRisk', risk.key)}
              aria-pressed={policyForm.acceptableRisk === risk.key}
            >
              <strong>{risk.label}</strong>
              <span>{risk.description}</span>
            </button>
          ))}
        </div>

        <p className="safety-risk-note">
          현재 허용가능한 최대 위험도는 <strong>{riskLevels.find((risk) => risk.key === policyForm.acceptableRisk)?.label}</strong>입니다.
        </p>
      </section>

      <div className="safety-page-actions">
        <button type="button" onClick={saveSettings}>
          <SaveRoundedIcon /> 저장
        </button>
      </div>
    </section>
  )
}

export default SafetyManagementPage
