import React, { useState, useRef, useEffect } from 'react';

const ChatbotPage = () => {
    // 1. 추천 질문 리스트 데이터
    const recommendedQuestions = [
        "소방시설 설치 및 관리에 관한 법률 제12조",
        "물류창고 화재안전 성능기준(NFPC 609)"
    ];

    // 2. 가짜 답변용 데이터베이스 (Mock API 대용)
    const botReplies = {
        "소방시설 설치 및 관리에 관한 법률 제12조": "소방시설법 제12조는 소방시설의 설치 및 관리에 관한 국가 및 지방자치단체의 책무를 규정하고 있으며, 특정소방대상물의 규모에 따른 소방시설 설치 기준을 명시하고 있습니다. 자세한 법안 조항은 법제처 국가법령정보센터에서 실시간으로 조회가 가능합니다.",
        "물류창고 화재안전 성능기준(NFPC 609)": "NFPC 609 기준에 따라 물류창고는 초기 소화가 가능하도록 스프링클러 헤드의 배치 간격이 일반 건축물보다 촘촘해야 하며, 대규모 연쇄 화재를 막기 위한 방화구획 벽체 기준이 엄격하게 적용됩니다."
    };

    // 3. 상태 관리
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: '안녕하세요! AI 소방안전관리 비서입니다. 시설물 안전 및 관련 법규에 대해 궁금한 점을 질문해 주세요.',
            time: '오후 2:30'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false); // 봇이 타이핑 중인지 표시하는 상태

    const chatEndRef = useRef(null);

    const getCurrentTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0시는 12시로 표시
        return `${ampm} ${hours}:${minutes}`;
    };

    useEffect(() => {
        setMessages([{
            type: 'bot',
            text: '안녕하세요! AI 소방안전관리 비서입니다. 시설물 안전 및 관련 법규에 대해 궁금한 점을 질문해 주세요.',
            time: getCurrentTime() // 이 부분을 useEffect 안으로 가져왔습니다.
        }]);
    }, []);

    useEffect(() => {
        setMessages([{
            type: 'bot',
            text: '안녕하세요! AI 소방안전관리 비서입니다. 시설물 안전 및 관련 법규에 대해 궁금한 점을 질문해 주세요.',
            time: getCurrentTime() // 이 부분을 useEffect 안으로 가져왔습니다.
        }]);
    }, []);

    // 메시지가 추가될 때마다 스크롤을 가장 아래로 내리는 로직
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 4. 메시지 전송 로직 (사용자 전송 + 봇 응답 모사)
    const sendMessage = (textToSend) => {
        if (!textToSend.trim()) return;

        const timeStamp = getCurrentTime();

        // 사용자가 보낸 말 화면에 추가
        const userMessage = { type: 'user', text: textToSend, time: timeStamp };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // 봇 응답 딜레이 시작 (진짜 챗봇 같은 효과)
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);

            // 더미 데이터 베이스에서 답변 매칭, 없으면 기본 답변 출력
            const replyText = botReplies[textToSend] || `'${textToSend}'에 대한 법규 검색 결과입니다. 해당 구역의 소방시설법에 의거하여 정기 점검 대상에 해당할 수 있으니 수칙을 재확인하시기 바랍니다.`;

            const botMessage = {
                type: 'bot',
                text: replyText,
                time: getCurrentTime()
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1200); // 1.2초 뒤 답변 생성
    };

    // 엔터키 전송 지원
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage(inputValue);
        }
    };

    return (
        <div style={styles.container}>
            {/* [좌측] 추천 질문 사이드바 */}
            <aside style={styles.sidebar}>
                <h3 style={styles.sidebarTitle}>🔎 추천 질문</h3>
                <p style={styles.sidebarSub}>클릭 시 자동으로 질문이 전송됩니다.</p>
                <div style={styles.recommendList}>
                    {recommendedQuestions.map((q, idx) => (
                        <button
                            key={idx}
                            style={styles.recommendBtn}
                            onClick={() => sendMessage(q)} // ⭐ 추천 질문을 누르면 바로 전송됨
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </aside>

            {/* [우측] 챗봇 메인 창 */}
            <main style={styles.chatMain}>
                <h2 style={styles.chatHeader}>🤖 소방안전 법규 Q&A 비서</h2>

                {/* 대화 기록 스크롤 영역 */}
                <div style={styles.chatContent}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={msg.type === 'user' ? styles.userRow : styles.botRow}>
                            {msg.type === 'bot' && (
                                <div style={styles.botIcon}>🚒</div>
                            )}

                            <div style={styles.bubbleContainer}>
                                <div style={msg.type === 'user' ? styles.userBubble : styles.botBubble}>
                                    {msg.text}
                                </div>
                                <span style={msg.type === 'user' ? styles.userTime : styles.botTime}>
                                    {msg.time}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* ⭐ 봇이 타이핑(생각) 중일 때 보여주는 로딩 UI */}
                    {isTyping && (
                        <div style={styles.botRow}>
                            <div style={styles.botIcon}>🚒</div>
                            <div style={styles.botBubble}>
                                <span style={styles.typingDot}>●</span>
                                <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}>●</span>
                                <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}>●</span>
                            </div>
                        </div>
                    )}

                    {/* 스크롤 포커스 지점 */}
                    <div ref={chatEndRef} />
                </div>

                {/* 하단 입력 폼 영역 */}
                <div style={styles.inputArea}>
                    <div style={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="소방 법규 및 안전 수칙 관련 질문을 입력하세요..."
                            style={styles.input}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            style={{
                                ...styles.sendBtn,
                                color: inputValue.trim() ? '#2563eb' : '#94a3b8' // 글자 입력되면 파랗게 활성화
                            }}
                            onClick={() => sendMessage(inputValue)}
                        >
                            ➔
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: 'calc(100vh - 120px)', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: 'sans-serif' },

    // 좌측 레이아웃
    sidebar: { width: '290px', backgroundColor: '#eff6ff', padding: '25px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' },
    sidebarTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 4px 0' },
    sidebarSub: { fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' },
    recommendList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    recommendBtn: { padding: '14px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' },

    // 우측 챗본 메인 레이아웃
    chatMain: { flex: 1, display: 'flex', flexDirection: 'column', padding: '25px', backgroundColor: '#f8fafc' },
    chatHeader: { fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
    chatContent: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '10px', paddingBottom: '80px' },

    // 말풍선 정렬용 컨테이너
    bubbleContainer: { display: 'flex', flexDirection: 'column', maxWidth: '70%', position: 'relative' },

    // 유저 레이아웃 (오른쪽 정렬)
    userRow: { display: 'flex', justifyContent: 'flex-end', width: '100%' },
    userBubble: { padding: '12px 16px', borderRadius: '16px 16px 2px 16px', backgroundColor: '#1e3a8a', color: '#fff', fontSize: '15px', lineHeight: '1.5', alignSelf: 'flex-end', boxShadow: '0 2px 4px rgba(30,58,138,0.1)' },
    userTime: { fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' },

    // 봇 레이아웃 (왼쪽 정렬)
    botRow: { display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', width: '100%' },
    botIcon: { width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    botBubble: { padding: '14px 18px', borderRadius: '16px 16px 16px 2px', backgroundColor: '#fff', color: '#1e293b', fontSize: '15px', lineHeight: '1.6', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    botTime: { fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'left' },

    // 하단 고정형 입력창
    inputArea: { position: 'absolute', bottom: '25px', left: '600px', right: '100px' }, // 사이드바 너비를 배제한 오프셋 고정
    inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '24px', backgroundColor: '#fff', padding: '6px 18px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
    input: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#0f172a', padding: '10px 0' },
    sendBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', marginLeft: '10px', transition: 'color 0.2s' },

    // 로딩 점 애니메이션
    typingDot: { display: 'inline-block', margin: '0 2px', color: '#94a3b8', fontSize: '12px' }
};

export default ChatbotPage;