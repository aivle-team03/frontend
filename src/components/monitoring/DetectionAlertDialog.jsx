import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import styles from '../../styles/CCTVMonitoring.module.css'
import { resolveMediaUrl } from '../../utils/mediaUrl.js'

function DetectionAlertDialog({ alert, queueCount, onClose, onAssign }) {
  return (
    <Dialog open={Boolean(alert)} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="detection-dialog-title">
      <DialogTitle id="detection-dialog-title" className={styles.detectionDialogTitle}>
        <span><WarningAmberRoundedIcon />{alert?.categoryName || '위험 감지'}</span>
        <div>
          {queueCount > 0 && <em>대기 중인 감지 알림 {queueCount}건</em>}
          <IconButton aria-label="감지 알림 닫기" onClick={onClose}><CloseRoundedIcon /></IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <div className={styles.detectionDialogBody}>
          <section className={styles.detectionDialogVideo}>
            {alert?.snapshotUrl
              ? <img src={alert.snapshotUrl} alt="AI 감지 스냅샷" />
              : alert?.aiStreamUrl
              ? <img src={alert.aiStreamUrl} alt="AI 분석 스트림" />
              : alert?.streamUrl && <video src={resolveMediaUrl(alert.streamUrl)} autoPlay loop muted playsInline controls onLoadedMetadata={(event) => { if (alert.videoTime > 0) event.currentTarget.currentTime = alert.videoTime }} />}
            <span className={styles.modalLiveBadge}><i />LIVE</span>
          </section>
          <section className={styles.detectionDialogInfo}>
            <dl>
              <div><dt>감지 위치</dt><dd>{alert?.location}</dd></div>
              <div><dt>감지 시간</dt><dd>{alert?.time}</dd></div>
              <div><dt>이벤트 카테고리</dt><dd>{alert?.categoryName}</dd></div>
              <div><dt>위험도</dt><dd>{alert?.riskLevel}{alert?.level ? ` · 강도 ${alert.level}` : ''}</dd></div>
              <div><dt>조치 상태</dt><dd className={styles.pendingStatus}>조치 대기</dd></div>
            </dl>
          </section>
        </div>
      </DialogContent>
      <DialogActions className={styles.detectionDialogActions}>
        <div className="Page-move-wrapper event-drawer-action">
          <button className="Page-move-button" type="button" onClick={onAssign}>담당자배정 페이지로 이동</button>
        </div>
      </DialogActions>
    </Dialog>
  )
}

export default DetectionAlertDialog
