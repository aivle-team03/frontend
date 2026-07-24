import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

function SignupPage() {
    const [userId, setUserId] = useState('');
    const [pw, setPw] = useState('');
    const [name, setName] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [role, setRole] = useState('field_worker');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [idCheckMessage, setIdCheckMessage] = useState('');

    const navigate = useNavigate();

    const handleUserIdChange = (e) => {
        setUserId(e.target.value);
        setIsIdChecked(false);
        setIdCheckMessage('');
    };

    // 🚀 아이디 중복 확인 API 호출
    const handleCheckId = async () => {
        if (!userId.trim()) {
            setIdCheckMessage('아이디를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/auth/checkid?user_id=${userId}`);
            const data = await response.json();

            if (data.message === 'duplicated') {
                setIsIdChecked(false);
                setIdCheckMessage('이미 존재하는 아이디입니다.');
            } else {
                setIsIdChecked(true);
                setIdCheckMessage('사용 가능한 아이디입니다.');
            }
        } catch (error) {
            console.error('중복확인 통신 에러:', error);
            setIdCheckMessage('중복확인 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!userId.trim() || !pw.trim() || !name.trim() || !companyCode.trim()) {
            setIsError(true);
            setMessage('모든 필드를 입력해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    password: pw,
                    name: name,
                    role: role,
                    company_code: companyCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsError(false);
                setMessage(data.message || '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');

                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setIsError(true);
                setMessage(data.detail || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            setIsError(true);
            setMessage('서버와 통신할 수 없습니다. FastAPI 서버 상태를 확인하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="logo-area">
                <h2 className="sub-title">AI 소방안전관리 비서</h2>
                <p className="desc">Intelligent Fire Safety Management Assistant</p>
            </div>

            <div className="signup-box">
                <h3 className="main-title">시스템 회원가입</h3>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="text"
                        placeholder="이름을 입력해주세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        disabled={isLoading}
                    />
                    <div className="input-with-button" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="사용할 ID를 입력해주세요"
                            value={userId}
                            onChange={handleUserIdChange}
                            className="input"
                            style={{ flex: 1 }}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={handleCheckId}
                            className="button"
                            style={{ width: '100px', margin: 0, padding: '0 10px', fontSize: '13px', whiteSpace: 'nowrap' }}
                            disabled={isLoading}
                        >
                            중복확인
                        </button>
                    </div>
                    {idCheckMessage && (
                        <p style={{
                            fontSize: '12px',
                            marginTop: '-8px',
                            marginBottom: '4px',
                            color: isIdChecked ? '#2e7d32' : '#d32f2f'
                        }}>
                            {idCheckMessage}
                        </p>
                    )}
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="input"
                        disabled={isLoading}
                    />

                    <input
                        type="text"
                        placeholder="회사 코드를 입력해주세요"
                        value={companyCode}
                        onChange={(e) => setCompanyCode(e.target.value)}
                        className="input"
                        disabled={isLoading}
                    />

                    <div className="select-wrapper">
                        <label className="label">권한 설정</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="select"
                            disabled={isLoading}
                        >
                            <option value="field_worker">현장 작업자 (Field Worker)</option>
                            <option value="admin">시스템 관리자 (Admin)</option>
                        </select>
                    </div>

                    {message && (
                        <p
                            className="message"
                            style={{ color: isError ? 'red' : 'green' }}
                        >
                            {message}
                        </p>
                    )}

                    <button type="submit" className="button" disabled={isLoading}>
                        {isLoading ? '처리 중...' : '회원가입 완료'}
                    </button>
                </form>

                <div className="links" onClick={() => navigate('/login')}>
                    이미 계정이 있으신가요? <span>로그인하기</span>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;