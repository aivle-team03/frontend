import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

function SignupPage() {
    const [userId, setUserId] = useState('');
    const [pw, setPw] = useState('');
    const [name, setName] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [role, setRole] = useState('field_worker');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

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
                    <input
                        type="text"
                        placeholder="사용할 ID를 입력해주세요"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="input"
                        disabled={isLoading}
                    />
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