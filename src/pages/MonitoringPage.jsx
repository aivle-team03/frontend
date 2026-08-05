import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded'
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import RecentEventsTable from '../components/monitoring/RecentEventsTableMonitoring.jsx'
import styles from '../styles/CCTVMonitoring.module.css'
import {
  getYouTubeEmbedUrl,
  resolveMediaUrl,
} from '../utils/mediaUrl.js'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000'

const TEST_VIDEO_URL =
  `${API_BASE_URL}/ai-videos/test2.mp4`

function StreamViewer({
  streamUrl,
  cameraId,
}) {
  const [hasError, setHasError] =
    useState(false)

  const youTubeEmbedUrl =
    getYouTubeEmbedUrl(streamUrl, {
      autoplay: true,
    })

  useEffect(() => {
    setHasError(false)
  }, [streamUrl])

  if (!streamUrl || hasError) {
    return (
      <span className={styles.cameraPlaceholder}>
        <VideocamOutlinedIcon />

        <small>
          {hasError
            ? '비디오 에러'
            : '연결 중...'}
        </small>
      </span>
    )
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
    )
  }

  const resolvedUrl =
    resolveMediaUrl(streamUrl)

  return (
    <video
      key={resolvedUrl}
      src={resolvedUrl}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      onError={(event) => {
        console.error(
          `CAM #${cameraId} 비디오 로드 에러:`,
          {
            streamUrl,
            resolvedUrl,
            event,
          }
        )

        setHasError(true)
      }}
    />
  )
}

function MonitoringLoadingSkeleton() {
  return (
    <section
      className={`${styles.dashboardFrame} ${styles.monitoringSkeleton}`}
      aria-busy="true"
      aria-label="CCTV 모니터링 데이터를 불러오는 중입니다"
    >
      <div className={styles.monitoringOverview}>
        <div className={styles.skeletonOverviewCopy}>
          <span
            className={`${styles.skeletonBlock} ${styles.skeletonOverviewIcon}`}
          />

          <div>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineMedium}`}
            />

            <span
              className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineLong}`}
            />
          </div>
        </div>

        <div className={styles.skeletonOverviewStats}>
          {[1, 2, 3].map((item) => (
            <span
              className={styles.skeletonBlock}
              key={item}
            />
          ))}
        </div>
      </div>

      <div className={styles.cctvemptyarea}>
        <div className={styles.cctvSection}>
          <section
            className={
              styles.cctvmonitoringSection
            }
          >
            <SkeletonSectionHeading action />

            <div className={styles.videodashBoard}>
              {[1, 2, 3, 4].map((item) => (
                <div
                  className={`${styles.skeletonBlock} ${styles.skeletonVideo}`}
                  key={item}
                />
              ))}
            </div>
          </section>

          <section className={styles.videoChange}>
            <SkeletonSectionHeading />

            <div
              className={
                styles.videochangedashBoard
              }
            >
              {[1, 2, 3, 4].map((item) => (
                <div
                  className={`${styles.skeletonBlock} ${styles.skeletonVideoChange}`}
                  key={item}
                />
              ))}
            </div>
          </section>
        </div>

        <div className={styles.EventSection}>
          <section className={styles.liveEvent}>
            <SkeletonSectionHeading badge />

            <div
              className={
                styles.skeletonEventTable
              }
            >
              <span
                className={`${styles.skeletonBlock} ${styles.skeletonTableHeader}`}
              />

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <span
                    className={`${styles.skeletonBlock} ${styles.skeletonTableRow}`}
                    key={item}
                  />
                )
              )}
            </div>
          </section>

          <section className={styles.emptyBox}>
            <SkeletonSectionHeading />

            <div
              className={
                styles.skeletonEventDetail
              }
            >
              <span
                className={`${styles.skeletonBlock} ${styles.skeletonDetailHeadline}`}
              />

              {[1, 2, 3].map((item) => (
                <span
                  className={`${styles.skeletonBlock} ${styles.skeletonDetailRow}`}
                  key={item}
                />
              ))}

              <span
                className={`${styles.skeletonBlock} ${styles.skeletonDetailButton}`}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

function SkeletonSectionHeading({
  action = false,
  badge = false,
}) {
  return (
    <header className={styles.sectionHeader}>
      <div
        className={
          styles.skeletonSectionTitle
        }
      >
        <span
          className={`${styles.skeletonBlock} ${styles.skeletonSectionIcon}`}
        />

        <div>
          <span
            className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineMedium}`}
          />

          <span
            className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineLong}`}
          />
        </div>
      </div>

      {(action || badge) && (
        <span
          className={`${styles.skeletonBlock} ${
            action
              ? styles.skeletonAction
              : styles.skeletonBadge
          }`}
        />
      )}
    </header>
  )
}

function MonitoringPage() {
  const navigate = useNavigate()

  const [cameras, setCameras] =
    useState([])

  const [
    activeCameraId,
    setActiveCameraId,
  ] = useState(null)

  const [events, setEvents] =
    useState([])

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    fetchCCTVsAndEvents()
  }, [])

  const fetchCCTVsAndEvents =
    async () => {
      try {
        setLoading(true)

        const token =
          localStorage.getItem('token')

        const headers = token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}

        const cctvResponse =
          await axios.get(
            `${API_BASE_URL}/api/cctvs`,
            {
              headers,
            }
          )

        const dbCctvs =
          Array.isArray(cctvResponse.data)
            ? cctvResponse.data
            : cctvResponse.data?.items || []

        if (dbCctvs.length > 0) {
          const formattedCameras =
            dbCctvs.map(
              (item, index) => {
                const cameraId =
                  item.cctv_id ??
                  item.camera_id ??
                  item.id

                return {
                  id: cameraId,

                  name:
                    item.cctv_name ||
                    item.camera_name ||
                    `CCTV #${index + 1}`,

                  area:
                    item.area ||
                    `${index + 1}구역`,

                  location:
                    item.location ||
                    '위치 미지정',

                  status:
                    item.status ||
                    '정상',

                  // 테스트용 영상 고정
                  streamUrl:
                    TEST_VIDEO_URL,
                }
              }
            )

          setCameras(formattedCameras)

          setActiveCameraId(
            formattedCameras[0].id
          )
        } else {
          // CCTV DB 데이터가 없어도
          // 테스트 영상은 화면에 표시
          const fallbackCameras = [
            {
              id: 1,
              name: 'CCTV #1',
              area: '1구역',
              location: '물류창고',
              status: '정상',
              streamUrl:
                TEST_VIDEO_URL,
            },
          ]

          setCameras(fallbackCameras)
          setActiveCameraId(1)
        }

        try {
          const eventResponse =
            await axios.get(
              `${API_BASE_URL}/api/monitoring/events`,
              {
                headers,
              }
            )

          const monitoringEvents =
            Array.isArray(
              eventResponse.data
            )
              ? eventResponse.data
              : eventResponse.data
                  ?.items || []

          if (
            monitoringEvents.length > 0
          ) {
            const formattedEvents =
              monitoringEvents.map(
                (event) => {
                  const rawTime =
                    event.date ||
                    event.detected_at ||
                    event.created_at ||
                    event.time

                  const formattedTime =
                    rawTime
                      ? String(rawTime)
                          .replace(
                            'T',
                            ' '
                          )
                          .substring(
                            0,
                            16
                          )
                      : '-'

                  const statusValue =
                    String(
                      event.current_status ??
                        event.status ??
                        ''
                    ).toLowerCase()

                  const isCompleted = [
                    'completed',
                    'resolved',
                    'approved',
                    '조치 완료',
                  ].includes(
                    statusValue
                  )

                  return {
                    id:
                      event.event_id ??
                      event.id,

                    eventId:
                      event.event_id ??
                      event.id,

                    cctvId:
                      event.cctv_id,

                    time:
                      formattedTime,

                    location:
                      event.cctv
                        ?.location ||
                      event.location ||
                      (event.cctv_id
                        ? `CCTV #${event.cctv_id}`
                        : '위치 미지정'),

                    type:
                      event.category
                        ?.category_name ||
                      event.event_type ||
                      event.hazard_type ||
                      event.content ||
                      '위험 요인 감지',

                    status:
                      isCompleted
                        ? '조치 완료'
                        : '조치 필요',

                    rawStatus:
                      event.current_status ??
                      event.status,

                    manager:
                      event.manager_name ||
                      (event.manager_id
                        ? `담당자 ${event.manager_id}`
                        : '미지정'),

                    imageUrl:
                      event.image_url ||
                      event.snapshot_url ||
                      '',
                  }
                }
              )

            setEvents(
              formattedEvents
            )

            setSelectedEvent(
              formattedEvents[0]
            )
          }
        } catch (eventError) {
          console.warn(
            '모니터링 이벤트 목록 조회 실패:',
            eventError
          )
        }
      } catch (error) {
        console.error(
          'CCTV 목록 로드 실패:',
          error
        )

        // CCTV API가 실패해도 테스트 영상 출력
        const fallbackCameras = [
          {
            id: 1,
            name: 'CCTV #1',
            area: '1구역',
            location: '물류창고',
            status: '정상',
            streamUrl:
              TEST_VIDEO_URL,
          },
        ]

        setCameras(fallbackCameras)
        setActiveCameraId(1)
      } finally {
        setLoading(false)
      }
    }

  const activeCamera =
    cameras.find(
      (camera) =>
        String(camera.id) ===
        String(activeCameraId)
    )

  const handleMoveToMonitoringDetail =
    () => {
      if (activeCameraId) {
        navigate(
          `/monitoringdetail?camera=${activeCameraId}`
        )
      }
    }

  if (loading) {
    return (
      <MonitoringLoadingSkeleton />
    )
  }

  return (
    <section
      className={styles.dashboardFrame}
      aria-label="BOSS CCTV 모니터링 작업 공간"
    >
      <div
        className={
          styles.monitoringOverview
        }
      >
        <div>
          <span
            className={
              styles.overviewIcon
            }
          >
            <SensorsRoundedIcon />
          </span>

          <div>
            <strong>
              전체 카메라 정상 연결
            </strong>

            <p>
              현장 카메라{' '}
              {cameras.length}대가
              연결되어 있습니다.
            </p>
          </div>
        </div>

        <div
          className={
            styles.overviewStats
          }
        >
          <span>
            <i />
            온라인{' '}
            <strong>
              {
                cameras.filter(
                  (camera) =>
                    camera.status ===
                      '정상' ||
                    camera.status ===
                      'running'
                ).length
              }
            </strong>
          </span>

          <span>
            점검 필요{' '}
            <strong>
              {
                cameras.filter(
                  (camera) =>
                    camera.status !==
                      '정상' &&
                    camera.status !==
                      'running'
                ).length
              }
            </strong>
          </span>

          <small>
            방금 전 업데이트
          </small>
        </div>
      </div>

      <div
        className={
          styles.cctvemptyarea
        }
      >
        <div
          className={
            styles.cctvSection
          }
        >
          <section
            className={
              styles.cctvmonitoringSection
            }
          >
            <header
              className={
                styles.sectionHeader
              }
            >
              <div
                className={
                  styles.sectionTitleGroup
                }
              >
                <span
                  className={
                    styles.sectionIcon
                  }
                >
                  <GridViewRoundedIcon />
                </span>

                <div>
                  <h2
                    className={
                      styles.title
                    }
                  >
                    실시간 CCTV
                  </h2>

                  <p>
                    카메라를 선택해
                    현재 화면을
                    확인하세요.
                  </p>
                </div>
              </div>

              <button
                className={
                  styles.panelAction
                }
                type="button"
                onClick={
                  handleMoveToMonitoringDetail
                }
              >
                <OpenInFullRoundedIcon />
                선택 화면 크게 보기
              </button>
            </header>

            <div
              className={
                styles.videodashBoard
              }
            >
              {cameras.map(
                (camera) => {
                  const isActive =
                    String(
                      camera.id
                    ) ===
                    String(
                      activeCameraId
                    )

                  return (
                    <button
                      className={`${styles.video}${
                        isActive
                          ? ` ${styles.videoActive}`
                          : ''
                      }`}
                      onClick={() =>
                        navigate(
                          `/monitoringdetail?camera=${camera.id}`
                        )
                      }
                      key={camera.id}
                      type="button"
                      aria-label={`${camera.area} ${camera.location} 영상 열기`}
                    >
                      <span
                        className={
                          styles.cameraTopbar
                        }
                      >
                        <span
                          className={
                            styles.cameraLive
                          }
                        >
                          <i />
                          LIVE
                        </span>

                        <span>
                          {camera.id}
                        </span>
                      </span>

                      <StreamViewer
                        streamUrl={
                          camera.streamUrl
                        }
                        cameraId={
                          camera.id
                        }
                      />

                      <span
                        className={
                          styles.cameraFooter
                        }
                      >
                        <span>
                          <strong>
                            {camera.area}
                          </strong>

                          {
                            camera.location
                          }
                        </span>

                        {isActive && (
                          <em>
                            선택됨
                          </em>
                        )}
                      </span>
                    </button>
                  )
                }
              )}
            </div>
          </section>

          <section
            className={
              styles.videoChange
            }
          >
            <header
              className={
                styles.sectionHeader
              }
            >
              <div
                className={
                  styles.sectionTitleGroup
                }
              >
                <div>
                  <h2
                    className={
                      styles.title
                    }
                  >
                    빠른 전환
                  </h2>

                  <p>
                    썸네일을 눌러
                    활성 카메라를
                    변경합니다.
                  </p>
                </div>
              </div>

              <span
                className={
                  styles.currentCamera
                }
              >
                현재 CAM #
                {activeCamera?.id ||
                  '-'}
              </span>
            </header>

            <div
              className={
                styles.videochangedashBoard
              }
            >
              {cameras.map(
                (camera) => {
                  const isSelected =
                    String(
                      camera.id
                    ) ===
                    String(
                      activeCameraId
                    )

                  return (
                    <button
                      className={`${styles.videoChangeFrame}${
                        isSelected
                          ? ` ${styles.videoChangeFrameActive}`
                          : ''
                      }`}
                      key={camera.id}
                      type="button"
                      onClick={() =>
                        setActiveCameraId(
                          camera.id
                        )
                      }
                      aria-pressed={
                        isSelected
                      }
                    >
                      <div
                        className={
                          styles.miniVideoWrapper
                        }
                      >
                        <StreamViewer
                          streamUrl={
                            camera.streamUrl
                          }
                          cameraId={
                            camera.id
                          }
                        />
                      </div>

                      <div
                        className={
                          styles.videoChangeInfo
                        }
                      >
                        <strong>
                          {camera.area}
                        </strong>

                        <small>
                          CAM #{camera.id}
                        </small>
                      </div>
                    </button>
                  )
                }
              )}
            </div>
          </section>
        </div>

        <div
          className={
            styles.EventSection
          }
        >
          <section
            className={
              styles.liveEvent
            }
          >
            <header
              className={
                styles.sectionHeader
              }
            >
              <div
                className={
                  styles.sectionTitleGroup
                }
              >
                <span
                  className={`${styles.sectionIcon} ${styles.alertIcon}`}
                >
                  <WarningAmberRoundedIcon />
                </span>

                <div>
                  <h2
                    className={
                      styles.title
                    }
                  >
                    실시간 알람
                  </h2>

                  <p>
                    최근 감지된 이상
                    이벤트입니다.
                  </p>
                </div>
              </div>

              <span
                className={
                  styles.alertCount
                }
              >
                {events.length}건
              </span>
            </header>

            <RecentEventsTable
              events={events}
              selectedEvent={
                selectedEvent
              }
              onSelectEvent={
                setSelectedEvent
              }
            />
          </section>

          <section
            className={
              styles.emptyBox
            }
          >
            <header
              className={
                styles.sectionHeader
              }
            >
              <div
                className={
                  styles.sectionTitleGroup
                }
              >
                <div>
                  <h2
                    className={
                      styles.title
                    }
                  >
                    이벤트 상세
                  </h2>

                  <p>
                    선택한 알람의
                    세부 정보입니다.
                  </p>
                </div>
              </div>
            </header>

            {selectedEvent ? (
              <div
                className={
                  styles.eventDetail
                }
              >
                <div
                  className={
                    styles.eventDetailHeadline
                  }
                >
                  <span
                    className={
                      styles.eventWarningIcon
                    }
                  >
                    <WarningAmberRoundedIcon />
                  </span>

                  <div>
                    <span>
                      {
                        selectedEvent.status
                      }
                    </span>

                    <strong>
                      {
                        selectedEvent.type
                      }
                    </strong>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>
                      <LocationOnOutlinedIcon />
                      감지 위치
                    </dt>

                    <dd>
                      {
                        selectedEvent.location
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      <AccessTimeRoundedIcon />
                      감지 시간
                    </dt>

                    <dd>
                      {
                        selectedEvent.time
                      }
                    </dd>
                  </div>

                  <div>
                    <dt>
                      담당자
                    </dt>

                    <dd>
                      {
                        selectedEvent.manager
                      }
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
                  <ArrowForwardRoundedIcon />
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#888',
                }}
              >
                선택된 이벤트가
                없습니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default MonitoringPage