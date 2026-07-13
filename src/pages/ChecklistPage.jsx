import React, { useState, useRef } from 'react';

const ChecklistPage = () => {
    // 1. 기본 업무 리스트 상태 [cite: 9]
    const [tasks] = useState([
        { id: 1, text: '해야할 일 1' },
        { id: 2, text: '해야할 일 2' },
        { id: 3, text: '해야할 일 3' },
    ]);

    const [beforeImg, setBeforeImg] = useState(null); // 'beforeImg' 변수가 여기서 선언되어야 합니다.
    const [afterImg, setAfterImg] = useState(null);
    const beforeInputRef = useRef(null);
    const afterInputRef = useRef(null);

    const [selectedImg, setSelectedImg] = useState(null);

    // 2. 파일 선택 시 실행되는 함수
    const handleFileChange = (e, setImg) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImg(reader.result); // 파일을 읽어 미리보기 URL로 저장
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.mainContent}>

                {/* 왼쪽 섹션: 업무 리스트 [cite: 16] */}
                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>오늘의 업무</h2>
                    <div style={styles.taskList}>
                        {tasks.map(task => (
                            <div key={task.id} style={styles.taskItem}>◯ {task.text}</div>
                        ))}
                    </div>
                </section>

                {/* 오른쪽 섹션: 조치 진행 (사진 업로드 포함) [cite: 16] */}
                <section style={styles.card}>
                    <h2 style={styles.cardTitle}>조치 진행</h2>

                    {/* 현장 사진 업로드 [cite: 16] */}
                    <div style={styles.uploadBox}>
                        <label style={styles.label}>현장 사진</label>
                        <div style={styles.photoRow}>
                            <div
                                style={styles.photoPreview}
                                onClick={() => beforeImg && setSelectedImg(beforeImg)}
                            >
                                {beforeImg ? (
                                    <>
                                        <img src={beforeImg} style={styles.img} alt="조치 전" />
                                        {/* ⭐ 삭제 버튼 추가 (이벤트 전파 방지 필수) */}
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 크게 보기 모달이 뜨지 않도록 방지
                                                setBeforeImg(null);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : "사진 없음"}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={beforeInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, setBeforeImg)}
                            />
                            <button onClick={() => beforeInputRef.current.click()} style={styles.btn}>사진 촬영</button>
                        </div>
                    </div>

                    {/* 조치 완료 사진 업로드 [cite: 16] */}
                    <div style={styles.uploadBox}>
                        <label style={styles.label}>조치 완료 사진</label>
                        <div style={styles.photoRow}>
                            <div
                                style={styles.photoPreview}
                                onClick={() => afterImg && setSelectedImg(afterImg)}
                            >
                                {afterImg ? (
                                    <>
                                        <img src={afterImg} style={styles.img} alt="조치 후" />
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAfterImg(null);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </>
                                ) : "사진 없음"}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={afterInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e, setAfterImg)}
                            />
                            <button onClick={() => afterInputRef.current.click()} style={styles.btn}>사진 업로드</button>
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
                        <p style={{ color: '#fff', marginTop: '10px' }}>클릭하면 닫힙니다</p>
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
    dropdownContainer: { textAlign: 'center', marginBottom: '30px' },
    select: { padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '150px' },
    progressContainer: { marginBottom: '40px' },
    progressText: { fontSize: '20px', marginBottom: '10px', textAlign: 'left' },
    progressBarBg: { height: '12px', backgroundColor: '#eee', borderRadius: '6px', overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#cbdffa', transition: 'width 0.3s' },
    taskList: { listStyle: 'none', padding: 0, margin: 0 },
    taskItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer'
    },
    checkbox: {
        width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #ddd',
        marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    taskText: { fontSize: '18px' },



    // 오른쪽 스타일
    uploadSection: { marginBottom: '25px' },
    label: { display: 'block', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '10px' },
    photoContainer: { display: 'flex', gap: '15px', alignItems: 'center' },
    photoPlaceholder: { width: '150px', height: '100px', backgroundColor: '#e0e0e0', borderRadius: '4px' },
    photoBtn: {
        padding: '10px 15px', backgroundColor: '#cbdffa', border: 'none',
        borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
    },
    statusInput: { width: '100%', padding: '15px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px' },
    submitBtn: {
        marginTop: '10px', padding: '15px', backgroundColor: '#cbdffa',
        border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
    },
    photoPreview: {
        width: '100px',
        height: '80px',
        backgroundColor: '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontSize: '12px',
        color: '#999',
        borderRadius: '4px',
        border: '1px solid #ddd',
        cursor: 'pointer',
        position: 'relative', // ⭐ 중요: 삭제 버튼의 기준점이 됨
    },

    deleteBtn: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        border: 'none',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
    },

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