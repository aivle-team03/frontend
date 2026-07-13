import React, { useState } from 'react';

function LoginPage({ setIsLoggedIn }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. FastAPI의 실제 로그인 엔드포인트 주소로 변경 (/api/login)
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 백엔드 UserLogin 모델 스키마가 user_id와 password를 요구하므로 키값을 맞춥니다.
        body: JSON.stringify({
          user_id: id,
          password: pw
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. 로그인 성공 시 백엔드가 주는 'user_info' 구조에 맞춰 세션 저장
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', data.user_info.name);
        localStorage.setItem('userRole', data.user_info.role);
        localStorage.setItem('userUid', data.user_info.uid); // DB 고유 PK 값

        setIsLoggedIn(true);
      } else {
        // 3. 백엔드에서 raise HTTPException 한 에러 메시지 처리 (예: "비밀번호가 틀렸습니다.")
        setErrorMessage(data.detail || 'ID 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setErrorMessage('서버와 통신할 수 없습니다. FastAPI 서버가 켜져 있는지 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoArea}>
        <h2 style={styles.subTitle}>AI 소방안전관리 비서</h2>
        <p style={styles.desc}>Intelligent Fire Safety Management Assistant</p>
      </div>

      <div style={styles.loginBox}>
        <h3 style={styles.mainTitle}>시설안전 관리 자동화 AI 시스템</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="ID를 입력해주세요"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={styles.input}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="PW를 입력해주세요"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={styles.input}
            disabled={isLoading}
          />

          {errorMessage && <p style={styles.error}>{errorMessage}</p>}

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={styles.links}>
          <span>회원가입</span> | <span>비밀번호 찾기</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
  logoArea: { textAlign: 'center', marginBottom: '20px' },
  subTitle: { color: '#003366', margin: 0, fontSize: '24px', fontWeight: 'bold' },
  desc: { color: '#666', margin: '5px 0 0 0', fontSize: '12px' },
  loginBox: { backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '360px', textAlign: 'center' },
  mainTitle: { fontSize: '18px', marginBottom: '30px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  error: { color: 'red', fontSize: '12px', margin: 0, textAlign: 'left' },
  button: { padding: '12px', backgroundColor: '#cbdffa', border: 'none', borderRadius: '4px', color: '#333', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  links: { marginTop: '20px', fontSize: '12px', color: '#666', cursor: 'pointer' }
};

export default LoginPage;