import axios from 'axios'
import { AI_API_URL, BACKEND_API_URL } from '../config/api.js'

const REFRESH_ENDPOINT = `${BACKEND_API_URL}/api/auth/refresh`

let refreshPromise = null
let interceptorsInstalled = false

export function clearAuthSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('user')
}

function isAuthenticatedRequest(url = '') {
  return url.startsWith(BACKEND_API_URL) || url.startsWith(AI_API_URL) || url.startsWith('/api/')
}

function isRefreshRequest(url = '') {
  return url === REFRESH_ENDPOINT || url.endsWith('/api/auth/refresh')
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') window.location.replace('/login')
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new Error('Refresh token is missing')

  const response = await axios.post(REFRESH_ENDPOINT, { refresh_token: refreshToken }, { skipAuthRefresh: true })
  const { access_token: accessToken, refresh_token: nextRefreshToken } = response.data
  if (!accessToken) throw new Error('Refresh response does not include an access token')

  localStorage.setItem('token', accessToken)
  if (nextRefreshToken) localStorage.setItem('refresh_token', nextRefreshToken)
  return accessToken
}

export function installAuthInterceptors() {
  if (interceptorsInstalled) return
  interceptorsInstalled = true

  axios.interceptors.request.use((config) => {
    const url = config.url ?? ''
    const token = localStorage.getItem('token')

    if (token && isAuthenticatedRequest(url) && !isRefreshRequest(url)) {
      config.headers ??= {}
      if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      const status = error.response?.status
      const url = originalRequest?.url ?? ''

      if (status !== 401 || !originalRequest || originalRequest._retry || originalRequest.skipAuthRefresh || !isAuthenticatedRequest(url) || isRefreshRequest(url)) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const accessToken = await refreshPromise
        originalRequest.headers ??= {}
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        clearAuthSession()
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    },
  )
}
