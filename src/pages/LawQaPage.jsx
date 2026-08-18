import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined'
import SendIcon from '@mui/icons-material/Send'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { CHATBOT_API_URL } from '../config/api.js'
import '../styles/law-qa.css'
import { useUiLanguage } from '../utils/uiLanguage.js'

const RECOMMENDED_QUESTIONS = [
  { ko: '현재 조치 대기와 조치 완료 건수를 알려줘', en: 'Tell me the current counts of pending and completed actions.' },
  { ko: '이번 달 점검 이력을 상태별로 알려줘', en: 'Show this month’s inspection history by status.' },
  { ko: '우리 회사 전체 교육 현황과 이수율을 알려줘', en: 'Show our company-wide training status and completion rate.' },
  { ko: '미이수 교육 현황을 과정별로 알려줘', en: 'Show incomplete training status by course.' },
]

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12

  return `${displayHour}:${minutes} ${meridiem}`
}

function createInitialMessage() {
  return {
    type: 'bot',
    text: '안녕하세요. BOSS AI 비서입니다. 무엇을 확인해 드릴까요?',
    time: getCurrentTime(),
  }
}

function createConversationId() {
  return crypto.randomUUID()
}

function LawQaPage() {
  const { t, language } = useUiLanguage()
  const [messages, setMessages] = useState(() => [createInitialMessage()])
  const [conversationId, setConversationId] = useState(createConversationId)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (textToSend) => {
    const trimmedText = textToSend.trim()
    if (!trimmedText || isTyping) return

    setMessages((currentMessages) => [
      ...currentMessages,
      { type: 'user', text: trimmedText, time: getCurrentTime() },
    ])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await axios.post(`${CHATBOT_API_URL}/api/agent/query`, {
        conversation_id: conversationId,
        user_message: trimmedText,
      })
      const answer = response.data?.final_answer?.trim()
      if (!answer) throw new Error('AI response does not include final_answer')
      if (response.data?.conversation_id) {
        setConversationId(response.data.conversation_id)
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { type: 'bot', text: answer, time: getCurrentTime() },
      ])
    } catch (error) {
      console.error('AI 비서 질의 실패:', error)
      const status = error.response?.status
      const errorMessage = status === 403
        ? '안전관리자 권한이 필요한 기능입니다.'
        : status === 401
          ? '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.'
          : 'AI 서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'

      setMessages((currentMessages) => [
        ...currentMessages,
        { type: 'bot', text: errorMessage, time: getCurrentTime() },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage(inputValue)
    }
  }

  const startNewConversation = () => {
    if (isTyping) return
    setConversationId(createConversationId())
    setMessages([createInitialMessage()])
    setInputValue('')
  }

  return (
    <section className="law-qa-page">
      <aside className="law-qa-sidebar">
        <h2>{t('추천 질문')}</h2>
        <p>{t('자주 확인하는 안전관리 현황입니다.')}</p>
        <div className="recommend-question-list">
          {RECOMMENDED_QUESTIONS.map((question) => (
            <button key={question.ko} type="button" onClick={() => sendMessage(language === 'en' ? question.en : question.ko)}>
              {language === 'en' ? question.en : question.ko}
            </button>
          ))}
        </div>
      </aside>

      <main className="law-qa-chat">
        <div className="chat-panel-header">
          <div className="chat-title-icon">
            <SmartToyOutlinedIcon fontSize="small" />
          </div>
          <div className="chat-panel-copy">
            <h2>{t('BOSS AI 비서')}</h2>
            <p>{t('점검·조치 및 교육 현황을 확인하세요.')}</p>
          </div>
          <button
            type="button"
            className="new-conversation-button"
            aria-label={t('새 대화')}
            title={t('새 대화')}
            disabled={isTyping}
            onClick={startNewConversation}
          >
            <AddCommentOutlinedIcon fontSize="small" />
          </button>
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
                <div className="chat-bubble">{t(message.text)}</div>
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
            placeholder={t('확인할 안전관리 현황을 입력하세요.')}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
          />
          <button type="button" aria-label={t('질문 전송')} disabled={isTyping || !inputValue.trim()} onClick={() => sendMessage(inputValue)}>
            <SendIcon fontSize="small" />
          </button>
        </div>
      </main>
    </section>
  )
}

export default LawQaPage
