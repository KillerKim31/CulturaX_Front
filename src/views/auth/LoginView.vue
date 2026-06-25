<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    const redirect = route.query.redirect || (auth.isAdmin ? '/admin' : '/dashboard')
    router.push(redirect)
  } catch (e) {
    error.value = e.response?.data?.message || 'Неверный email или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card shadow-sm">
      <div class="text-center mb-4">
        <i class="bi bi-book-half text-primary" style="font-size: 2.5rem;"></i>
        <h2 class="mt-2">Вход в аккаунт</h2>
        <p class="text-muted">Введите данные для входа</p>
      </div>

      <div v-if="error" class="alert alert-danger py-2" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Пароль</label>
          <input id="password" v-model="form.password" type="password" class="form-control" placeholder="Введите пароль" required>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <RouterLink to="/forgot-password" class="text-decoration-none small">Забыли пароль?</RouterLink>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Войти
        </button>
      </form>

      <hr class="my-4">
      <p class="text-center text-muted mb-0">
        Нет аккаунта?
        <RouterLink to="/register" class="text-decoration-none fw-semibold">Зарегистрироваться</RouterLink>
      </p>
    </div>
  </div>
</template>
