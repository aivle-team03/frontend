import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../styles/monitoringdetail.css'

function StreamViewer({ streamUrl, cameraId }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [streamUrl]);

  if (!streamUrl || hasError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
        <VideocamOutlinedIcon style={{ fontSize: '48px', marginBottom: '8px' }} />
        <span>{hasError ? "비디오 로드 실패" : "실시간 스트림 연결 중..."}</span>
      </div>
    );
  }

  return (
    <video
      key={streamUrl}
      src={streamUrl}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={(e) => {
        console.error(`CAM #${cameraId} 상세 영상 로드 에러:`, e);
        setHasError(true);
      }}
    />
  );
}

function MonitoringDetailPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [cameraList, setCameraList] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCameraIdFromUrl = searchParams.get('camera');

  useEffect(() => {
    fetchCameraList();
  }, []);

  const fetchCameraList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/api/cctvs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.length > 0) {
        const formattedList = response.data.map((item, index) => ({
          id: item.cctv_id ?? item.camera_id ?? item.id,
          cctv_name: item.cctv_name || item.camera_name || `${index + 1}번 카메라`,
          area: item.area || `${index + 1}구역`,
          location: item.location || '위치 미지정',
          status: item.status || '정상',
          streamUrl: item.stream_url || '',
        }));
        setCameraList(formattedList);
      }
    } catch (error) {
      console.error('CCTV 상세 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCamera = cameraList.find(
    (cam) => String(cam.id) === String(currentCameraIdFromUrl)
  ) || cameraList[0] || { id: 1, area: '1구역', location: '위치 미지정', cctv_name: '카메라', streamUrl: '' };

  if (loading) {
    return <div className="monitoring-detail-page" style={{ padding: '40px', textAlign: 'center' }}>상세 모니터링 정보를 불러오는 중...</div>;
  }

  return (
    <section className="monitoring-detail-page" aria-label={`${activeCamera.id} 상세 모니터링`}>
      <header className="monitoring-detail-toolbar">
        <button type="button" onClick={() => navigate('/monitoring')} aria-label="CCTV 모니터링으로 돌아가기">
          <ArrowBackRoundedIcon />
        </button>
        <div>
          <span>{activeCamera.cctv_name}</span>
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

            <div className="primary-video-placeholder" style={{ position: 'relative', overflow: 'hidden', height: '420px', background: '#0f172a' }}>
              <span className="primary-camera-label" style={{ zIndex: 2 }}>
                <i />CAM #{activeCamera.id}
              </span>

              <StreamViewer streamUrl={activeCamera.streamUrl} cameraId={activeCamera.id} />

              <span className="primary-video-time" style={{ zIndex: 2 }}>
                <AccessTimeRoundedIcon />실시간 스트리밍 중
              </span>
            </div>
          </section>

          <section className="subCard camera-thumbnail-panel">
            <div className="detail-section-heading">
              <strong>카메라 전환</strong>
              <span>전체 {cameraList.length}대</span>
            </div>
            <div className="detail-thumbnail-list">
              {cameraList.map((camera) => {
                const isSelected = String(camera.id) === String(activeCamera.id);

                return (
                  <button
                    className={isSelected ? 'is-active' : ''}
                    type="button"
                    key={camera.id}
                    onClick={() => setSearchParams({ camera: camera.id })}
                  >
                    <div className="detail-thumb-video-box">
                      <StreamViewer streamUrl={camera.streamUrl} cameraId={camera.id} />
                    </div>

                    <div className="detail-thumb-info">
                      <strong>{camera.area}</strong>
                      <small>CAM #{camera.id}</small>
                    </div>
                  </button>
                );
              })}
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