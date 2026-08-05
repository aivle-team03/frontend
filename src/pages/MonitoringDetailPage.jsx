import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import axios from 'axios';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import '../styles/monitoringdetail.css';
import {
  getYouTubeEmbedUrl,
  resolveMediaUrl,
} from '../utils/mediaUrl.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const TEST_VIDEO_URL =
  `${API_BASE_URL}/ai-videos/test2.mp4`;

function StreamViewer({
  streamUrl,
  cameraId,
  onVideoError,
}) {
  const [hasError, setHasError] = useState(false);

  const youTubeEmbedUrl =
    getYouTubeEmbedUrl(streamUrl, {
      autoplay: true,
    });

  useEffect(() => {
    setHasError(false);
  }, [streamUrl]);

  if (!streamUrl || hasError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#94a3b8',
        }}
      >
        <VideocamOutlinedIcon
          style={{
            fontSize: '48px',
            marginBottom: '8px',
          }}
        />

        <span>
          {hasError
            ? '비디오 로드 실패'
            : '영상 연결 중...'}
        </span>
      </div>
    );
  }

  if (youTubeEmbedUrl) {
    return (
      <iframe
        key={youTubeEmbedUrl}
        src={youTubeEmbedUrl}
        title={`CAM #${cameraId} YouTube 영상`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
      />
    );
  }

  const resolvedVideoUrl =
    streamUrl.startsWith('http')
      ? streamUrl
      : resolveMediaUrl(streamUrl);

  return (
    <video
      key={resolvedVideoUrl}
      src={resolvedVideoUrl}
      autoPlay
      loop
      muted
      playsInline
      controls={false}
      preload="auto"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={(event) => {
        console.error(
          `CAM #${cameraId} 상세 영상 로드 에러:`,
          {
            streamUrl,
            resolvedVideoUrl,
            currentSrc:
              event.currentTarget?.currentSrc,
            mediaError:
              event.currentTarget?.error,
          }
        );

        setHasError(true);

        if (onVideoError) {
          onVideoError(event);
        }
      }}
    />
  );
}

function MonitoringDetailLoadingSkeleton() {
  return (
    <section
      className="monitoring-detail-page monitoring-detail-skeleton"
      aria-busy="true"
      aria-label="상세 모니터링 정보를 불러오는 중입니다"
    >
      <header className="monitoring-detail-toolbar">
        <span className="detail-skeleton-block detail-skeleton-back" />

        <div>
          <span className="detail-skeleton-block detail-skeleton-line short" />
          <span className="detail-skeleton-block detail-skeleton-line medium" />
        </div>

        <span className="detail-skeleton-block detail-skeleton-live" />
      </header>

      <div className="page-Layout">
        <div className="cctv-main-Layout">
          <section className="subCard cctv-primary-view">
            <div className="primary-view-header">
              <span className="detail-skeleton-block detail-skeleton-line medium" />
              <span className="detail-skeleton-block detail-skeleton-line short" />
            </div>

            <div className="detail-skeleton-block detail-skeleton-video" />
          </section>

          <section className="subCard camera-thumbnail-panel">
            <div className="detail-section-heading">
              <span className="detail-skeleton-block detail-skeleton-line medium" />
              <span className="detail-skeleton-block detail-skeleton-line short" />
            </div>

            <div className="detail-thumbnail-list">
              {[1, 2, 3, 4].map((item) => (
                <span
                  className="detail-skeleton-block detail-skeleton-thumbnail"
                  key={item}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="detection-main-Layout">
          <div className="detection-Section">
            {[1, 2].map((item) => (
              <article
                className="subCard detection-status-card"
                key={item}
              >
                <span className="detail-skeleton-block detail-skeleton-status-icon" />

                <div>
                  <span className="detail-skeleton-block detail-skeleton-line short" />
                  <span className="detail-skeleton-block detail-skeleton-line medium" />
                  <span className="detail-skeleton-block detail-skeleton-line long" />
                </div>
              </article>
            ))}
          </div>

          <section className="subCard detail-event-card">
            <div className="detail-section-heading">
              <span className="detail-skeleton-block detail-skeleton-line medium" />
              <span className="detail-skeleton-block detail-skeleton-line short" />
            </div>

            <span className="detail-skeleton-block detail-skeleton-event" />

            {[1, 2, 3].map((item) => (
              <span
                className="detail-skeleton-block detail-skeleton-row"
                key={item}
              />
            ))}

            <span className="detail-skeleton-block detail-skeleton-button" />
          </section>
        </aside>
      </div>
    </section>
  );
}

function MonitoringDetailPage() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const currentCameraIdFromUrl =
    searchParams.get('camera');

  const [cameraList, setCameraList] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    analysisStatus,
    setAnalysisStatus,
  ] = useState('idle');

  const [
    analysisResult,
    setAnalysisResult,
  ] = useState(null);

  const [
    analysisError,
    setAnalysisError,
  ] = useState('');

  const requestedAnalysisRef =
    useRef(new Set());

  useEffect(() => {
    fetchCameraList();
  }, []);

  const fetchCameraList = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem('token');

      const response = await axios.get(
        `${API_BASE_URL}/api/cctvs`,
        {
          headers: token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {},
        }
      );

      const responseData =
        Array.isArray(response.data)
          ? response.data
          : response.data?.items || [];

      if (responseData.length > 0) {
        const formattedList =
          responseData.map(
            (item, index) => ({
              id:
                item.cctv_id ??
                item.camera_id ??
                item.id,

              cctv_name:
                item.cctv_name ||
                item.camera_name ||
                `${index + 1}번 카메라`,

              area:
                item.area ||
                `${index + 1}구역`,

              location:
                item.location ||
                '위치 미지정',

              status:
                item.status ||
                '정상',

              streamUrl:
                TEST_VIDEO_URL,
            })
          );

        setCameraList(formattedList);
      } else {
        setCameraList([
          {
            id: 1,
            cctv_name:
              '지게차 안전 카메라',
            area: '1구역',
            location: '물류창고',
            status: '정상',
            streamUrl:
              TEST_VIDEO_URL,
          },
        ]);
      }
    } catch (error) {
      console.error(
        'CCTV 상세 목록 조회 실패:',
        error
      );

      setCameraList([
        {
          id: 1,
          cctv_name:
            '지게차 안전 카메라',
          area: '1구역',
          location: '물류창고',
          status: '정상',
          streamUrl:
            TEST_VIDEO_URL,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeCamera =
    cameraList.find(
      (camera) =>
        String(camera.id) ===
        String(currentCameraIdFromUrl)
    ) ||
    cameraList[0] || {
      id: 1,
      area: '1구역',
      location: '물류창고',
      cctv_name:
        '지게차 안전 카메라',
      streamUrl:
        TEST_VIDEO_URL,
      status: '정상',
    };

  const requestVideoAnalysis = async (
    camera,
    force = false
  ) => {
    if (!camera?.id) {
      return;
    }

    const videoUrl =
      camera.streamUrl ||
      TEST_VIDEO_URL;

    const requestKey =
      `${camera.id}:${videoUrl}`;

    if (
      !force &&
      requestedAnalysisRef.current.has(
        requestKey
      )
    ) {
      return;
    }

    requestedAnalysisRef.current.add(
      requestKey
    );

    try {
      setAnalysisStatus('analyzing');
      setAnalysisResult(null);
      setAnalysisError('');

      const token =
        localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}/api/ai/forklift/analyze`,
        {
          camera_id: Number(camera.id),
          video_url: videoUrl,
        },
        {
          headers: {
            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

            'Content-Type':
              'application/json',
          },

          timeout: 0,
        }
      );

      console.log('AI 분석 응답:', response.data)

      setAnalysisResult(response.data);
      setAnalysisStatus('completed');
    } catch (error) {
      console.error(
        '지게차-사람 거리 분석 실패:',
        error
      );

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '영상 분석 중 오류가 발생했습니다.';

      setAnalysisError(message);
      setAnalysisStatus('error');

      requestedAnalysisRef.current.delete(
        requestKey
      );
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!activeCamera?.id) {
      return;
    }

    setAnalysisResult(null);
    setAnalysisError('');
    setAnalysisStatus('idle');

    requestVideoAnalysis(activeCamera);
  }, [
    loading,
    activeCamera.id,
    activeCamera.streamUrl,
  ]);

  const handleRetryAnalysis = () => {
    const videoUrl =
      activeCamera.streamUrl ||
      TEST_VIDEO_URL;

    const requestKey =
      `${activeCamera.id}:${videoUrl}`;

    requestedAnalysisRef.current.delete(
      requestKey
    );

    requestVideoAnalysis(
      activeCamera,
      true
    );
  };

  const displayedVideoUrl =
    analysisStatus === 'completed' &&
    analysisResult?.output_video_url
      ? analysisResult.output_video_url.startsWith(
          'http'
        )
        ? analysisResult.output_video_url
        : `${API_BASE_URL}${analysisResult.output_video_url}`
      : TEST_VIDEO_URL;

console.log("===== VIDEO DEBUG =====");
console.log("analysisStatus:", analysisStatus);
console.log("analysisResult:", analysisResult);
console.log("displayedVideoUrl:", displayedVideoUrl);
console.log("=======================");

  const dangerDetected =
    Boolean(
      analysisResult?.danger_detected
    );

  const dangerFrames =
    Number(
      analysisResult?.danger_frames || 0
    );

  const warningFrames =
    Number(
      analysisResult?.warning_frames || 0
    );

  const minimumDistance =
    analysisResult?.minimum_distance_px ??
    null;

  const totalFrames =
    Number(
      analysisResult?.total_frames || 0
    );

  const analysisRiskLevel =
    dangerDetected
      ? '위험'
      : warningFrames > 0
        ? '주의'
        : '안전';

  const analysisStatusText = {
    idle: '분석 대기',
    analyzing: '분석 중',
    completed: '분석 완료',
    error: '분석 실패',
  }[analysisStatus];

  if (loading) {
    return (
      <MonitoringDetailLoadingSkeleton />
    );
  }

  return (
    <section
      className="monitoring-detail-page"
      aria-label={`${activeCamera.id} 상세 모니터링`}
    >
      <header className="monitoring-detail-toolbar">
        <button
          type="button"
          onClick={() =>
            navigate('/monitoring')
          }
          aria-label="CCTV 모니터링으로 돌아가기"
        >
          <ArrowBackRoundedIcon />
        </button>

        <div>
          <span>
            {activeCamera.cctv_name}
          </span>

          <strong>
            {activeCamera.area}
            {' · '}
            {activeCamera.location}
          </strong>
        </div>

        <span className="detail-live-status">
          <i />
          LIVE
        </span>
      </header>

      <div className="page-Layout">
        <div className="cctv-main-Layout">
          <section className="subCard cctv-primary-view">
            <div className="primary-view-header">
              <div>
                <VideocamOutlinedIcon />
                <span>
                  AI 안전 모니터링
                </span>
              </div>

              <small>
                AI 상태 ·{' '}
                {analysisStatusText}
              </small>
            </div>

            <div
              className="primary-video-placeholder"
              style={{
                position: 'relative',
                overflow: 'hidden',
                height: '420px',
                background: '#0f172a',
              }}
            >
              <span
                className="primary-camera-label"
                style={{
                  zIndex: 2,
                }}
              >
                <i />
                CAM #{activeCamera.id}
              </span>

             <StreamViewer
                key={displayedVideoUrl}
                streamUrl={displayedVideoUrl}
                cameraId={activeCamera.id}
              />

              {analysisStatus ===
                'analyzing' && (
                <div className="ai-analysis-overlay">
                  <div className="ai-analysis-spinner" />

                  <strong>
                    AI 영상 분석 중
                  </strong>

                  <span>
                    지게차와 작업자의
                    거리를 계산하고
                    있습니다.
                  </span>
                </div>
              )}

              {analysisStatus ===
                'error' && (
                <div className="ai-analysis-overlay error">
                  <WarningAmberRoundedIcon />

                  <strong>
                    AI 분석 실패
                  </strong>

                  <span>
                    {analysisError}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleRetryAnalysis
                    }
                  >
                    다시 분석
                  </button>
                </div>
              )}

              <span
                className="primary-video-time"
                style={{
                  zIndex: 4,
                }}
              >
                <AccessTimeRoundedIcon />

                {analysisStatus ===
                'completed'
                  ? 'AI 분석 결과 재생 중'
                  : '원본 영상 재생 중'}
              </span>
            </div>
          </section>

          <section className="subCard camera-thumbnail-panel">
            <div className="detail-section-heading">
              <strong>
                카메라 전환
              </strong>

              <span>
                전체 {cameraList.length}대
              </span>
            </div>

            <div className="detail-thumbnail-list">
              {cameraList.map(
                (camera) => {
                  const isSelected =
                    String(camera.id) ===
                    String(
                      activeCamera.id
                    );

                  return (
                    <button
                      className={
                        isSelected
                          ? 'is-active'
                          : ''
                      }
                      type="button"
                      key={camera.id}
                      onClick={() =>
                        setSearchParams({
                          camera:
                            String(
                              camera.id
                            ),
                        })
                      }
                    >
                      <div className="detail-thumb-video-box">
                        <StreamViewer
                          streamUrl={
                            camera.streamUrl ||
                            TEST_VIDEO_URL
                          }
                          cameraId={
                            camera.id
                          }
                        />
                      </div>

                      <div className="detail-thumb-info">
                        <strong>
                          {camera.area}
                        </strong>

                        <small>
                          CAM #{camera.id}
                        </small>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </div>

        <aside className="detection-main-Layout">
          <div className="detection-Section">
            <article className="subCard detection-status-card">
              <span className="detail-status-icon success">
                <CheckCircleRoundedIcon />
              </span>

              <div>
                <small>
                  카메라 상태
                </small>

                <strong>
                  {activeCamera.status}
                </strong>

                <p>
                  영상 연결 상태를
                  확인했습니다.
                </p>
              </div>
            </article>

            <article className="subCard detection-status-card">
              <span
                className={
                  dangerDetected
                    ? 'detail-status-icon warning'
                    : 'detail-status-icon success'
                }
              >
                {dangerDetected ? (
                  <WarningAmberRoundedIcon />
                ) : (
                  <CheckCircleRoundedIcon />
                )}
              </span>

              <div>
                <small>
                  AI 거리 분석
                </small>

                <strong>
                  {analysisStatus ===
                  'analyzing'
                    ? '분석 중'
                    : analysisStatus ===
                        'error'
                      ? '분석 실패'
                      : analysisRiskLevel}
                </strong>

                <p>
                  위험 {dangerFrames}프레임
                  {' · '}
                  주의 {warningFrames}프레임
                </p>
              </div>
            </article>
          </div>

          <section className="subCard detail-event-card">
            <div className="detail-section-heading">
              <strong>
                AI 감지 결과
              </strong>

              <span>
                {analysisStatusText}
              </span>
            </div>

            <div className="detail-event-preview">
              {dangerDetected ? (
                <WarningAmberRoundedIcon />
              ) : (
                <CheckCircleRoundedIcon />
              )}

              <div>
                <span>
                  {dangerDetected
                    ? '확인 필요'
                    : analysisStatus ===
                        'completed'
                      ? '분석 완료'
                      : analysisStatusText}
                </span>

                <strong>
                  {dangerDetected
                    ? '지게차 접근 위험 감지'
                    : warningFrames > 0
                      ? '지게차 접근 주의 감지'
                      : '현재 감지된 위험 없음'}
                </strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>
                  <LocationOnOutlinedIcon />
                  위치
                </dt>

                <dd>
                  {activeCamera.location}
                </dd>
              </div>

              <div>
                <dt>
                  <AccessTimeRoundedIcon />
                  분석 프레임
                </dt>

                <dd>
                  {totalFrames
                    ? `${totalFrames}프레임`
                    : '-'}
                </dd>
              </div>

              <div>
                <dt>
                  최소 거리
                </dt>

                <dd>
                  {minimumDistance !== null
                    ? `${minimumDistance}px`
                    : '-'}
                </dd>
              </div>

              <div>
                <dt>
                  위험도
                </dt>

                <dd
                  className={
                    dangerDetected
                      ? 'detail-risk-level'
                      : ''
                  }
                >
                  {analysisRiskLevel}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/checklists/management'
                )
              }
            >
              체크리스트 확인
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

export default MonitoringDetailPage;