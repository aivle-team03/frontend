import SendIcon from '@mui/icons-material/Send'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import { useEffect, useRef, useState } from 'react'
import '../styles/law-qa.css'

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const meridiem = hours >= 12 ? '오후' : '오전'
  const displayHour = hours % 12 || 12

  return `${meridiem} ${displayHour}:${minutes}`
}

function createInitialMessage() {
  return {
    type: 'bot',
    text: '안녕하세요. AI 소방안전관리 비서입니다. 시설물 안전 및 관련 법규에 대해 궁금한 점을 질문해 주세요.',
    time: getCurrentTime(),
  }
}

function LawQaPage() {
  const [messages, setMessages] = useState(() => [createInitialMessage()])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const [recommendedQuestions, setRecommendedQuestions] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/chatbot/recommendations');
        if (response.ok) {
          const data = await response.json();
          setRecommendedQuestions(data.questions);
        }
      } catch (error) {
        console.error('추천 질문 로딩 실패:', error);
      }
    };
    fetchRecommendations();
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (textToSend) => {
    const trimmedText = textToSend.trim()
    if (!trimmedText) return

    setMessages((currentMessages) => [
      ...currentMessages,
      { type: 'user', text: trimmedText, time: getCurrentTime() },
    ])
    setInputValue('')
    setIsTyping(true)

    const historyPayload = messages
      .filter((_, index) => index > 0) // 첫 인사말 제외
      .map((msg) => `${msg.type === 'user' ? '사용자' : '챗봇'}: ${msg.text}`)

    try {
      // API 호출
      const response = await fetch('http://127.0.0.1:8000/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 필요 시 토큰 추가: 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question_text: trimmedText,
          history: historyPayload
        })
      });

      if (response.ok) {
        const data = await response.json();

        // 🚀 백엔드에서 온 진짜(목업) 답변을 화면에 추가
        setMessages((currentMessages) => [
          ...currentMessages,
          { type: 'bot', text: data.answer, time: getCurrentTime() },
        ]);
      } else {
        throw new Error('API 응답 에러');
      }
    } catch (error) {
      console.error('챗봇 질의 실패:', error);
      // 에러 발생 시 안내 메시지
      setMessages((currentMessages) => [
        ...currentMessages,
        { type: 'bot', text: '서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.', time: getCurrentTime() },
      ]);
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage(inputValue)
    }
  }

  return (
    <section className="law-qa-page">
      <aside className="law-qa-sidebar">
        <h2>추천 질문</h2>
        <p>자주 확인하는 법규와 안전관리 기준입니다.</p>
        <div className="recommend-question-list">
          {recommendedQuestions.map((question) => (
            <button key={question} type="button" onClick={() => sendMessage(question)}>
              {question}
            </button>
          ))}
        </div>
      </aside>

      <main className="law-qa-chat">
        <div className="chat-panel-header">
          <div className="chat-title-icon">
            <SmartToyOutlinedIcon fontSize="small" />
          </div>
          <div>
            <h2>소방안전 법규 Q&A 비서</h2>
            <p>법규 검색 API 연동이 완료된 화면입니다.</p>
          </div>
        </div>

        <div className="chat-message-list">
          {messages.map((message, index) => (
            <div className={`chat-row ${message.type}`} key={`${message.type}-${index}`}>
              {message.type === 'bot' && (
                <span className="bot-avatar">
                  <SmartToyOutlinedIcon fontSize="small" />
                </span>
              )}
              <div className="bubble-wrap">
                <div className="chat-bubble">{message.text}</div>
                <span className="chat-time">{message.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-row bot">
              <span className="bot-avatar">
                <SmartToyOutlinedIcon fontSize="small" />
              </span>
              <div className="typing-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="소방 법규 및 안전 수칙 관련 질문을 입력하세요."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" aria-label="질문 전송" onClick={() => sendMessage(inputValue)}>
            <SendIcon fontSize="small" />
          </button>
        </div>
      </main>
    </section>
  )
}

export default LawQaPage
