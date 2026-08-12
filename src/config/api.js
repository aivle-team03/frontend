function normalizeBaseUrl(value, fallback) {
  return (value || fallback).replace(/\/$/, '')
}

export const BACKEND_API_URL = normalizeBaseUrl(
  import.meta.env.VITE_BACKEND_API_URL,
  'http://127.0.0.1:8000',
)

export const CHATBOT_API_URL = normalizeBaseUrl(
  import.meta.env.VITE_CHATBOT_API_URL,
  'http://127.0.0.1:8001',
)

export const VISION_API_URL = normalizeBaseUrl(
  import.meta.env.VITE_VISION_API_URL,
  'http://127.0.0.1:8002',
)
