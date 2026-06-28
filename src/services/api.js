import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const pathname = window.location.pathname

    if (status === 401) {
      const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password'

      if (!isAuthPage) {
        const currentToken = localStorage.getItem('accessToken')

        if (!currentToken) {
          if (pathname !== '/login') {
            router.push({ name: 'login', query: { redirect: pathname } })
          }
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')

          if (pathname !== '/login') {
            router.push({ name: 'login', query: { redirect: pathname } })
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
