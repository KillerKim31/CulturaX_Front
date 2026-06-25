<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const email = ref('')
const sent = ref(false)
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.forgotPassword(email.value)
    sent.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card shadow-sm">
      <div class="text-center mb-4">
        <i class="bi bi-key text-primary" style="font-size: 2.5rem;"></i>
        <h2 class="mt-2">Сброс пароля</h2>
        <p class="text-muted">Укажите email для восстановления</p>
      </div>

      <div v-if="sent" class="alert alert-success py-2">
        <i class="bi bi-check-circle me-2"></i>Письмо с инструкциями отправлено.
      </div>

      <div v-if="error" class="alert alert-danger py-2" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
      </div>

      <form @submit.prevent="handleSubmit" v-if="!sent">
        <div class="mb-4">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="email" type="email" class="form-control" placeholder="you@example.com" required>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Отправить
        </button>
      </form>

      <hr class="my-4">
      <p class="text-center text-muted mb-0">
        <RouterLink to="/login" class="text-decoration-none fw-semibold">
          <i class="bi bi-arrow-left me-1"></i>Вернуться к входу
        </RouterLink>
      </p>
    </div>
  </div>
</template>
