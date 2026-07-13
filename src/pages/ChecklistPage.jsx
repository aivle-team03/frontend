import React, { useState, useRef } from 'react';
import { CHECKLIST_MOCK_DATA } from '../mocks/mockData.js';

const ChecklistPage = () => {
    // 1. 기본 업무 리스트 상태 [cite: 9]
    const [dataByLocation, setDataByLocation] = useState(CHECKLIST_MOCK_DATA);


    const [selectedLocation, setSelectedLocation] = useState("1층 현관");
    const [beforeImgs, setBeforeImgs] = useState([]);
    const [afterImgs, setAfterImgs] = useState([]);
    const beforeInputRef = useRef(null);
    const afterInputRef = useRef(null);
    const [selectedImg, setSelectedImg] = useState(null);



    const currentTasks = dataByLocation[selectedLocation];
    const completedCount = currentTasks.filter(t => t.completed).length;
    const totalCount = currentTasks.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const toggleTask = (taskId) => {
        const updatedTasks = currentTasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setDataByLocation({
            ...dataByLocation,
            [selectedLocation]: updatedTasks
        });
    };


    // 2. 파일 선택 시 실행되는 함수
    const handleFileChange = (e, setImgs) => {
        const files = Array.from(e.target.files); // 선택한 파일들을 배열로 변환

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgs(prev => [...prev, reader.result]); // 기존 배열 뒤에 새 사진 추가 (누적)
            };
            reader.readAsDataURL(file);
        });

        // 동일한 파일명을 다시 올릴 때도 이벤트가 발생하도록 input 초기화
        e.target.value = '';
    };

    const deleteImg = (index, setImgs) => {
        setImgs(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainContent}>

                {/* 왼쪽 섹션: 업무 리스트 [cite: 16] */}
                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>오늘의 업무</h2>

                    {/* 위치 선택 드롭다운 */}
                    <div style={styles.dropdownArea}>
                        <select
                            style={styles.select}
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            {Object.keys(dataByLocation).map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {/* 진행률 표시 영역 */}
                    <div style={styles.progressArea}>
                        <div style={styles.progressText}>
                            진행률 {completedCount}/{totalCount} ({progressPercent}%)
                        </div>
                        <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* 업무 리스트 */}
                    <div style={styles.taskList}>
                        {currentTasks.map(task => (
                            <div
                                key={task.id}
                                style={styles.taskItem}
                                onClick={() => toggleTask(task.id)}
                            >
                                <div style={{
                                    ...styles.checkCircle,
                                    backgroundColor: task.completed ? '#cbdffa' : '#fff',
                                    borderColor: task.completed ? '#cbdffa' : '#ddd'
                                }}>
                                    {task.completed && <span style={styles.checkMark}>✓</span>}
                                </div>
                                <span style={{
                                    ...styles.taskText,
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? '#aaa' : '#333'
                                }}>
                                    {task.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 오른쪽 섹션: 조치 진행 (사진 업로드 포함) [cite: 16] */}
                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>조치 진행</h2>

                    {/* 현장 사진 업로드 [cite: 16] */}
                    <div style={styles.uploadBox}>
                        <label style={styles.label}>현장 사진 ({beforeImgs.length})</label>
                        <div style={styles.photoGrid}>
                            {beforeImgs.map((img, idx) => (
                                <div key={idx} style={styles.photoPreview} onClick={() => setSelectedImg(img)}>
                                    <img src={img} style={styles.img} alt={`현장-${idx}`} />
                                    <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteImg(idx, setBeforeImgs); }}>✕</button>
                                </div>
                            ))}
                            <input type="file" multiple accept="image/*" ref={beforeInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setBeforeImgs)} />
                            <button onClick={() => beforeInputRef.current.click()} style={styles.addBtn}>+</button>
                        </div>
                    </div>

                    {/* 조치 완료 사진 업로드 [cite: 16] */}
                    <div style={styles.uploadBox}>
                        <label style={styles.label}>조치 완료 사진 ({afterImgs.length})</label>
                        <div style={styles.photoGrid}>
                            {afterImgs.map((img, idx) => (
                                <div key={idx} style={styles.photoPreview} onClick={() => setSelectedImg(img)}>
                                    <img src={img} style={styles.img} alt={`조치-${idx}`} />
                                    <button style={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); deleteImg(idx, setAfterImgs); }}>✕</button>
                                </div>
                            ))}
                            <input type="file" multiple accept="image/*" ref={afterInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, setAfterImgs)} />
                            <button onClick={() => afterInputRef.current.click()} style={styles.addBtn}>+</button>
                        </div>
                    </div>

                    <button style={styles.submitBtn}>완료 보고</button>
                </section>
            </div>

            {/* ⭐ 사진 크게 보기 모달 (selectedImg가 있을 때만 나타남) */}
            {selectedImg && (
                <div style={styles.modalOverlay} onClick={() => setSelectedImg(null)}>
                    <div style={styles.modalContent}>
                        <img src={selectedImg} style={styles.modalImg} alt="확대" />
                    </div>
                </div>
            )}
        </div>
    );
};

// 스타일 정의 (이미지 레이아웃 기반)
const styles = {
    container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100%' },
    mainContent: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
    },
    cardTitle: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px', color: '#333' },

    // 왼쪽 스타일
    dropdownArea: { marginBottom: '30px', textAlign: 'center' },
    dropdownContainer: { textAlign: 'center', marginBottom: '30px' },
    select: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' },
    progressArea: { marginBottom: '30px' },
    progressText: { fontSize: '18px', marginBottom: '10px', fontWeight: '500' },
    progressBarBg: { width: '100%', height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#cbdffa', transition: 'width 0.3s ease' },


    taskList: { display: 'flex', flexDirection: 'column' },
    taskItem: { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
    checkCircle: { width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #ddd', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    checkMark: { color: '#fff', fontSize: '14px', fontWeight: 'bold' },
    taskText: { fontSize: '18px' },



    // 오른쪽 스타일
    uploadBox: { marginBottom: '25px' },
    label: { fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '18px' },
    photoGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' },
    photoPreview: { width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '6px', position: 'relative', overflow: 'hidden', cursor: 'pointer', border: '1px solid #ddd' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    deleteBtn: { position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: '80px', height: '80px', borderRadius: '6px', border: '2px dashed #cbdffa', backgroundColor: '#f9fcff', color: '#2563eb', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' },
    submitBtn: { width: '100%', padding: '15px', backgroundColor: '#cbdffa', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: 'auto', fontSize: '18px' },

    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'zoom-out',
    },

    modalImg: {
        maxWidth: '90vw',
        maxHeight: '80vh',
        borderRadius: '8px',
    },

    photoRow: { display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center' },

    img: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000'   // 사진 여백을 검은색으로 처리해서 더 작아 보이게 효과
    },

    // 버튼 크기도 사진 크기에 맞춰 살짝 조절하고 싶다면
    btn: {
        padding: '6px 10px',      // 패딩 축소
        backgroundColor: '#cbdffa',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '12px'          // 글자 크기 축소
    },

    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 1000, cursor: 'zoom-out'
    },
    modalContent: { textAlign: 'center', position: 'relative' },
    modalImg: { maxWidth: '90vw', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }
};

export default ChecklistPage;
