<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ name: '', email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.value.name, form.value.email, form.value.password)
    router.push({ name: 'login', query: { registered: '1' } })
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка регистрации. Проверьте введённые данные.'
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
        <h2 class="mt-2">Регистрация</h2>
        <p class="text-muted">Создайте новый аккаунт</p>
      </div>

      <div v-if="error" class="alert alert-danger py-2" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="mb-3">
          <label for="name" class="form-label">Имя</label>
          <input id="name" v-model="form.name" type="text" class="form-control" placeholder="Ваше имя" required minlength="3">
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="form.email" type="email" class="form-control" placeholder="you@example.com" required>
        </div>
        <div class="mb-4">
          <label for="password" class="form-label">Пароль</label>
          <input id="password" v-model="form.password" type="password" class="form-control" placeholder="Минимум 8 символов" required minlength="8">
        </div>
        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          Зарегистрироваться
        </button>
      </form>

      <hr class="my-4">
      <p class="text-center text-muted mb-0">
        Уже есть аккаунт?
        <RouterLink to="/login" class="text-decoration-none fw-semibold">Войти</RouterLink>
      </p>
    </div>
  </div>
</template>
