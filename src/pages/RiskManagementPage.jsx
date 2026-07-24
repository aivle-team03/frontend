import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/risk.css'
import EventCategoryTable from '../components/riskmanagement/EventCategoryTable.jsx'
import { Typography, Paper } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'

function Riskicon({ name }) {
    const commonProps = {
        className: 'riskicon',
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': 'true',
    }

    if (name === 'warning') {
        return (
            <svg {...commonProps}>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                />
            </svg>
        )
    }
    return null
}

function RiskManagementPage() {
    const [riskFactors, setRiskFactors] = useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState(null)
    const [loading, setLoading] = useState(true)

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newCategoryData, setNewCategoryData] = useState({
        category: '',
        category_name: '',
        level: 1,
    })

    useEffect(() => {
        fetchRiskData()
    }, [])

    const fetchRiskData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            const response = await axios.get('http://127.0.0.1:8000/api/risk/list', { headers })
            const data = response.data

            if (data && Array.isArray(data)) {
                setRiskFactors(data)
            } else {
                setRiskFactors([])
            }
        } catch (error) {
            console.error('위험 요인 목록 로드 실패:', error)
            alert('위험 요인 목록을 불러오지 못했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleLevelChange = async (categoryId, newLevel) => {
        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            await axios.patch(
                `http://127.0.0.1:8000/api/risk/category/${categoryId}/level`,
                { level: Number(newLevel) },
                { headers }
            )

            fetchRiskData()
        } catch (error) {
            console.error('강도 변경 실패:', error)
            alert('강도 변경 실패: ' + (error.response?.data?.detail || error.message))
        }
    }

    const handleAddCategorySubmit = async () => {
        const { category, category_name, level } = newCategoryData

        if (!category.trim() || !category_name.trim()) {
            alert('유형과 항목명을 모두 입력해주세요.')
            return
        }

        const levelNum = Number(level)
        if (isNaN(levelNum) || levelNum < 1 || levelNum > 10) {
            alert('강도는 1에서 10 사이의 수치여야 합니다.')
            return
        }

        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            await axios.post(
                'http://127.0.0.1:8000/api/risk/category',
                {
                    category: category.trim(),
                    category_name: category_name.trim(),
                    level: levelNum,
                },
                { headers }
            )

            alert('새로운 위험 요인 항목이 추가되었습니다.')
            setIsAddModalOpen(false)
            setNewCategoryData({ category: '', category_name: '', level: 1 })
            fetchRiskData()
        } catch (error) {
            console.error('항목 추가 실패:', error)
            alert('항목 추가 실패: ' + (error.response?.data?.detail || error.message))
        }
    }

    const handleDeleteCategory = async () => {
        if (!selectedCategoryId) {
            alert('제거할 위험 요인 항목을 목록에서 선택해주세요.')
            return
        }

        if (!window.confirm('선택한 항목을 정말 삭제하시겠습니까?')) return

        try {
            const token = localStorage.getItem('token')
            const headers = { Authorization: `Bearer ${token}` }

            await axios.delete(`http://127.0.0.1:8000/api/risk/category/${selectedCategoryId}`, { headers })

            alert('항목이 성공적으로 제거되었습니다.')
            setSelectedCategoryId(null)
            fetchRiskData()
        } catch (error) {
            console.error('항목 제거 실패:', error)
            alert('항목 제거 실패: ' + (error.response?.data?.detail || error.message))
        }
    }

    const safeRiskFactors = Array.isArray(riskFactors) ? riskFactors : []
    const totalCount = safeRiskFactors.length

    const typeGroupMap = safeRiskFactors.reduce((acc, item) => {
        if (item.category) {
            acc[item.category] = (acc[item.category] || 0) + 1
        }
        return acc
    }, {})

    if (loading) {
        return (
            <div className="risk-page-layout" style={{ padding: '40px', textAlign: 'center' }}>
                위험 요인 데이터 연결 중...
            </div>
        )
    }

    return (
        <section className="risk-page-layout" aria-label="위험도 관리">
            <div className="risk-top-layout">
                {/* 전체 위험 요인 갯수 카드 */}
                <div className="count-card">
                    <div className="risk-count-layout">
                        <Typography variant="h6">위험 요인</Typography>
                        <div className="count-icon-text">
                            <div className="count-icon-box">
                                <Riskicon name="warning" />
                            </div>

                            <div className="count-text-box">
                                <Typography variant="h6">
                                    전체 위험
                                    <br /> 요인 갯수
                                </Typography>
                                <Typography variant="h6">{totalCount}건</Typography>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 유형별 요약 카드 목록 */}
                <div className="count-graph">
                    <div className="risk-graph-layout">
                        <Typography variant="h6" style={{ marginBottom: '16px' }}>
                            위험 요인 유형 현황
                        </Typography>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {Object.keys(typeGroupMap).length > 0 ? (
                                Object.entries(typeGroupMap).map(([type, count]) => (
                                    <Paper
                                        key={type}
                                        elevation={1}
                                        style={{
                                            padding: '12px 20px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '90px',
                                            backgroundColor: '#f8f9fa',
                                        }}
                                    >
                                        <Typography variant="body2" color="textSecondary">
                                            {type}
                                        </Typography>
                                        <Typography variant="h6" color="primary" style={{ fontWeight: 'bold' }}>
                                            {count}건
                                        </Typography>
                                    </Paper>
                                ))
                            ) : (
                                <Typography variant="body2" color="textSecondary">
                                    등록된 현황 데이터가 없습니다.
                                </Typography>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 및 추가/제거 버튼 */}
            <div className="risk-bottom-layout">
                <div className="risk-list">
                    <Typography variant="h6">위험 요인 리스트</Typography>
                    <EventCategoryTable
                        events={safeRiskFactors}
                        onLevelChange={handleLevelChange}
                        selectedCategoryId={selectedCategoryId}
                        onSelectCategory={(id) => setSelectedCategoryId(id)}
                    />
                </div>

                <div className="risk-list-button">
                    <div className="risk-button-layout">
                        <button
                            className="risk-add-button"
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            항목 추가
                        </button>

                        <button
                            className="risk-add-button"
                            type="button"
                            onClick={handleDeleteCategory}
                        >
                            항목 제거
                        </button>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <div
                    className="approval-modal-backdrop"
                    role="presentation"
                    onMouseDown={() => setIsAddModalOpen(false)}
                >
                    <section
                        className="approval-review-modal-v2"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-category-title"
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ maxWidth: '540px' }} // 입력 폼 형태에 맞게 적절한 너비 설정
                    >
                        <div className="modal-v2-header">
                            <h2 id="add-category-title">위험 요인 항목 추가</h2>
                            <button
                                type="button"
                                className="modal-v2-close"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                <CloseRoundedIcon />
                            </button>
                        </div>

                        <div className="modal-v2-body">
                            <div className="modal-v2-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>유형</label>
                                    <input
                                        type="text"
                                        placeholder="예: 소방, 시설, 안전"
                                        value={newCategoryData.category}
                                        onChange={(e) =>
                                            setNewCategoryData({ ...newCategoryData, category: e.target.value })
                                        }
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>항목명</label>
                                    <input
                                        type="text"
                                        placeholder="예: 화재, 미끄러짐, 충돌, 안전모"
                                        value={newCategoryData.category_name}
                                        onChange={(e) =>
                                            setNewCategoryData({ ...newCategoryData, category_name: e.target.value })
                                        }
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>초기 강도 (1 ~ 10)</label>
                                    <select
                                        value={newCategoryData.level}
                                        onChange={(e) =>
                                            setNewCategoryData({ ...newCategoryData, level: Number(e.target.value) })
                                        }
                                        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-v2-footer">
                            <button
                                type="button"
                                className="btn-v2-list"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                취소
                            </button>
                            <div className="footer-right-actions">
                                <button
                                    type="button"
                                    className="btn-v2-approve"
                                    onClick={handleAddCategorySubmit}
                                >
                                    등록
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </section>
    )
}

export default RiskManagementPage