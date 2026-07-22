import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/monitoringdetail.css';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/monitoringdetail.css'

const cameraList = [
  { id: 'CAM-01', area: '1구역', location: 'A동 1층 출입구' },
  { id: 'CAM-02', area: '2구역', location: 'A동 2층 작업장' },
  { id: 'CAM-03', area: '3구역', location: 'B동 자재 보관소' },
  { id: 'CAM-04', area: '4구역', location: 'B동 지하 주차장' },
]

function MonitoringDetailPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cameraId = searchParams.get('camera') ?? cameraList[0].id
  const activeCamera = cameraList.find((camera) => camera.id === cameraId) ?? cameraList[0]

  return (
    <section className="monitoring-detail-page" aria-label={`${activeCamera.id} 상세 모니터링`}>
      <header className="monitoring-detail-toolbar">
        <button type="button" onClick={() => navigate('/monitoring')} aria-label="CCTV 모니터링으로 돌아가기">
          <ArrowBackRoundedIcon />
        </button>
        <div>
          <span>{activeCamera.id}</span>
          <strong>{activeCamera.area} · {activeCamera.location}</strong>
        </div>
        <span className="detail-live-status"><i />LIVE</span>
      </header>

      <div className="page-Layout">
        <div className="cctv-main-Layout">
          <section className="subCard cctv-primary-view">
            <div className="primary-view-header">
              <div><VideocamOutlinedIcon /><span>실시간 영상</span></div>
              <small>연결 상태 정상 · 1080p</small>
            </div>
            <div className="primary-video-placeholder">
              <span className="primary-camera-label"><i />{activeCamera.id}</span>
              <div><VideocamOutlinedIcon /><span>실시간 영상 연결됨</span></div>
              <span className="primary-video-time"><AccessTimeRoundedIcon />2026-07-18 14:32:08</span>
            </div>
          </section>

          <section className="subCard camera-thumbnail-panel">
            <div className="detail-section-heading">
              <strong>카메라 전환</strong>
              <span>전체 {cameraList.length}대</span>
            </div>
            <div className="detail-thumbnail-list">
              {cameraList.map((camera) => (
                <button
                  className={camera.id === activeCamera.id ? 'is-active' : ''}
                  type="button"
                  key={camera.id}
                  onClick={() => setSearchParams({ camera: camera.id })}
                >
                  <span><VideocamOutlinedIcon /></span>
                  <div><strong>{camera.area}</strong><small>{camera.id}</small></div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="detection-main-Layout">
          <div className="detection-Section">
            <article className="subCard detection-status-card">
              <span className="detail-status-icon success"><CheckCircleRoundedIcon /></span>
              <div><small>카메라 상태</small><strong>정상 연결</strong><p>신호와 녹화 상태가 정상입니다.</p></div>
            </article>
            <article className="subCard detection-status-card">
              <span className="detail-status-icon warning"><WarningAmberRoundedIcon /></span>
              <div><small>오늘 감지</small><strong>3건</strong><p>확인이 필요한 이벤트 1건</p></div>
            </article>
          </div>

          <section className="subCard detail-event-card">
            <div className="detail-section-heading">
              <strong>최근 감지 이벤트</strong>
              <span>14:28</span>
            </div>
            <div className="detail-event-preview">
              <WarningAmberRoundedIcon />
              <div><span>조치 대기</span><strong>적재물 과다 적재 감지</strong></div>
            </div>
            <dl>
              <div><dt><LocationOnOutlinedIcon />위치</dt><dd>{activeCamera.location}</dd></div>
              <div><dt><AccessTimeRoundedIcon />감지 시간</dt><dd>14:28:32</dd></div>
              <div><dt>위험도</dt><dd className="detail-risk-level">주의</dd></div>
            </dl>
            <button type="button" onClick={() => navigate('/actions')}>조치 이력 확인</button>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default MonitoringDetailPage
