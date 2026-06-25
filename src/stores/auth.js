import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')

  function setAuth(data) {
    user.value = { userId: data.userId, name: data.name, email: data.email, role: data.role }
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(data)
    return data
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    return data
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (e) { /* ignore */ }
    clearAuth()
  }

  async function fetchProfile() {
    const { data } = await api.get('/user/profile')
    user.value = { userId: data.id, name: data.name, email: data.email, role: data.role }
    localStorage.setItem('user', JSON.stringify(user.value))
    return data
  }

  async function updateProfile(payload) {
    const { data } = await api.put('/user/profile', payload)
    user.value = { userId: data.id, name: data.name, email: data.email, role: data.role }
    localStorage.setItem('user', JSON.stringify(user.value))
    return data
  }

  async function changePassword(currentPassword, newPassword) {
    await api.put('/auth/change-password', { currentPassword, newPassword })
  }

  async function forgotPassword(email) {
    await api.post('/auth/forgot-password', { email })
  }

  return {
    user, accessToken, refreshToken,
    isAuthenticated, isAdmin, userName, userEmail,
    login, register, logout, fetchProfile, updateProfile,
    changePassword, forgotPassword, clearAuth,
  }
})
