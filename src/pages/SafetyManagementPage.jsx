import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { useMemo, useState } from 'react'
import '../styles/SafetyManagementPage.css'
import {
  getStoredSafetyRiskThreshold,
  saveSafetyRiskThreshold,
} from '../utils/checklistStatusStorage'

const initialPolicy = {
  policy: '근로자의 생명과 건강을 최우선 가치로 두고, 모든 작업에서 위험요인을 사전에 확인하고 개선한다.',
  goal: '중대재해 0건, 위험성 평가 이행률 100%, 개선조치 기한 준수율 95% 이상',
  acceptableRisk: 12,
}

const initialRoles = [
  { id: 1, team: '안전보건관리책임자', owner: '유진', responsibility: '안전보건 방침 승인 및 주요 위험 개선 의사결정' },
  { id: 2, team: '관리감독자', owner: '현장 팀장', responsibility: '작업 전 위험요인 확인, 근로자 교육 및 개선조치 확인' },
  { id: 3, team: '근로자', owner: '전 직원', responsibility: '위험요인 발견 시 즉시 신고하고 안전수칙 준수' },
]

const initialWorkerRoles = [
  { id: 1, Name: '기석', role:  '신규 근로자' },
  { id: 2, Name: '현수', role:  '일반 작업자' },
  { id: 3, Name: '유진', role:  '일반 작업자' },
  { id: 4, Name: '지함', role:  '일반 작업자' },
  { id: 5, Name: '동준', role:  '일반 작업자' },
  { id: 6, Name: '혁재', role:  '일반 작업자' },
  { id: 7, Name: '다현', role:  '안전 관리자' },
  { id: 8, Name: '원제', role:  '일반 작업자' },
  { id: 9, Name: '11', role:  '신규 근로자' },
]


function SafetyManagementPage() {
  const [policyForm, setPolicyForm] = useState(() => ({
    ...initialPolicy,
    acceptableRisk: getStoredSafetyRiskThreshold(),
  }))
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
    saveSafetyRiskThreshold(policyForm.acceptableRisk)
    alert('안전보건 관리 설정이 저장되었습니다.')
  }

  const [workerroles, setWorkerRoles] = useState(initialWorkerRoles)
  const [isWorkerRoleEditMode, setIsWorkerRoleEditMode] = useState(false)
  const [workerNameFilter, setWorkerNameFilter] = useState('')
  const [workerRoleFilter, setWorkerRoleFilter] = useState('전체')
  const [workerPage, setWorkerPage] = useState(1)

  const workerRoleOptions = ['일반 작업자', '안전 관리자','신규 근로자']

  const updateWorkerRole = (workerId, value) => {
    setWorkerRoles((currentRoles) => currentRoles.map((worker) => (
      worker.id === workerId ? { ...worker, role: value } : worker
    )))
  }

  const filteredWorkerRoles = useMemo(() => workerroles.filter((worker) => (
    (!workerNameFilter.trim() || worker.Name.includes(workerNameFilter.trim()))
    && (workerRoleFilter === '전체' || worker.role === workerRoleFilter)
  )), [workerNameFilter, workerRoleFilter, workerroles])

  const workerPageSize = 8
  const workerPageCount = Math.max(1, Math.ceil(filteredWorkerRoles.length / workerPageSize))
  const currentWorkerPage = Math.min(workerPage, workerPageCount)
  const pagedWorkerRoles = filteredWorkerRoles.slice((currentWorkerPage - 1) * workerPageSize, currentWorkerPage * workerPageSize)

  const riskPercent = Math.round(((policyForm.acceptableRisk - 1) / 26) * 100)

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
            <h2>위험성 평가 실시 조직 구성</h2>
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
        <div className="safety-card-heading safety-heading-row">
          <div>
            <span><GroupsOutlinedIcon /> 근무자 역할</span>
            <h2>역할 리스트 및 변경</h2>
          </div>
          <button className="safety-add-button" type="button" onClick={() => setIsWorkerRoleEditMode((current) => !current)}>
            <AddRoundedIcon /> {isWorkerRoleEditMode ? '변경 완료' : '역할 변경'}
          </button>
        </div>

        <div className="worker-role-filters">
          <label>
            <input value={workerNameFilter} onChange={(event) => { setWorkerNameFilter(event.target.value); setWorkerPage(1) }} placeholder="이름 검색" />
          </label>
          <label>
            <select value={workerRoleFilter} onChange={(event) => { setWorkerRoleFilter(event.target.value); setWorkerPage(1) }}>
              <option value="전체">전체</option>
              {workerRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>

        <div className="safety-role-table safety-worker-role-table">
          <div className="safety-role-head">

            <span>이름</span>
            <span>역할</span>
          </div>
          {pagedWorkerRoles.map((role) => (
            <div className="safety-role-row" key={role.id}>
              <input value={role.Name} readOnly />
              {isWorkerRoleEditMode ? (
                <select value={role.role} onChange={(event) => updateWorkerRole(role.id, event.target.value)}>
                  {workerRoleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input value={role.role} readOnly />
              )}
            </div>
          ))}
          {!pagedWorkerRoles.length && <div className="worker-role-empty">조건에 맞는 근무자가 없습니다.</div>}
        </div>
        <div className="worker-role-pagination">
          <span>총 {filteredWorkerRoles.length}명</span>
          <div>
            <button type="button" disabled={currentWorkerPage === 1} onClick={() => setWorkerPage((page) => Math.max(1, page - 1))}>이전</button>
            <strong>{currentWorkerPage} / {workerPageCount}</strong>
            <button type="button" disabled={currentWorkerPage === workerPageCount} onClick={() => setWorkerPage((page) => Math.min(workerPageCount, page + 1))}>다음</button>
          </div>
        </div>
      </section>

      <section className="safety-policy-card">
        <div className="safety-card-heading">
          <span><SecurityOutlinedIcon /> 위험성 기준</span>
          <h2>
            허용가능한 위험도 설정
            <small className="safety-risk-formula">위험도 = 강도 x 빈도</small>
          </h2>
        </div>

        <div className="safety-risk-slider-panel">
          <div className="risk-threshold-summary">
            <span>조치필요항목 설정 기준</span>
            <strong>{policyForm.acceptableRisk}점 이상</strong>
          </div>

          <label className="risk-threshold-control">
            <input
              type="range"
              min="1"
              max="27"
              step="1"
              value={policyForm.acceptableRisk}
              onChange={(event) => updatePolicy('acceptableRisk', Number(event.target.value))}
              style={{ '--risk-progress': `${riskPercent}%` }}
              aria-label="허용가능한 위험도 기준"
            />
            <div className="risk-threshold-scale">
              <span>1</span>
              <span>9</span>
              <span>18</span>
              <span>27</span>
            </div>
          </label>
        </div>

        <p className="safety-risk-note">
          체크리스트에서 계산된 위험도가 <strong>{policyForm.acceptableRisk}점 이상</strong>이면 조치필요항목으로 설정됩니다.
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
