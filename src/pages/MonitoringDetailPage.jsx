import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/monitoringdetail.css';

function MonitoringDetailPage() {
    const location = useLocation();
    const selectedCamera = location.state?.selectedCamera;

    const rawUrl = selectedCamera?.stream_url;
    let videoSource = null;

    if (rawUrl) {
        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
            videoSource = rawUrl;
        } else {
            videoSource = `http://127.0.0.1:8000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
        }
    }

    return (
        <>
            <div className="page-Layout">
                <div className="cctv-main-Layout">
                    <div className="subCard">
                        <h4>
                            {selectedCamera ? `🔴 CAM - ${selectedCamera.camera_id} (${selectedCamera.camera_name})` : '선택된 CCTV 없음'}                </h4>
                    </div>
                    <div className="subCard" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
                        {videoSource ? (
                            <video
                                src={videoSource}
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa' }}>
                                <h1>NO SIGNAL</h1>
                            </div>
                        )}
                    </div>
                    <div className="subCard">
                        <h1>Thumbnail</h1>
                    </div>

                </div>

                <div className="detection-main-Layout">
                    <div className="detection-Section">
                        <div className="subCard">
                            <h1>1</h1>
                        </div>
                        <div className="subCard">
                            <h1>2</h1>
                        </div>
                    </div>
                    <div className="subCard">
                        <h1>3</h1>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MonitoringDetailPage