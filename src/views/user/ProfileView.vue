<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const profile = ref(null)
const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const form = ref({ name: '', email: '' })
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showPasswordForm = ref(false)
const msg = ref({ type: '', text: '' })

onMounted(async () => {
  try {
    profile.value = await auth.fetchProfile()
    form.value = { name: profile.value.name, email: profile.value.email }
  } finally {
    loading.value = false
  }
})

async function saveProfile() {
  msg.value = { type: '', text: '' }
  saving.value = true
  try {
    profile.value = await auth.updateProfile(form.value)
    editMode.value = false
    msg.value = { type: 'success', text: 'Профиль обновлён' }
  } catch (e) {
    msg.value = { type: 'danger', text: e.response?.data?.message || 'Ошибка' }
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  msg.value = { type: '', text: '' }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    msg.value = { type: 'danger', text: 'Пароли не совпадают' }
    return
  }
  saving.value = true
  try {
    await auth.changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword)
    showPasswordForm.value = false
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    msg.value = { type: 'success', text: 'Пароль изменён' }
  } catch (e) {
    msg.value = { type: 'danger', text: e.response?.data?.message || 'Ошибка смены пароля' }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header">
      <h1 class="page-title">Профиль</h1>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-8">
        <div class="card p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0">Данные профиля</h5>
            <button v-if="!editMode" class="btn btn-sm btn-outline-primary" @click="editMode = true">
              <i class="bi bi-pencil me-1"></i>Редактировать
            </button>
          </div>

          <div v-if="msg.text" :class="`alert alert-${msg.type} py-2`">{{ msg.text }}</div>

          <form @submit.prevent="saveProfile" v-if="editMode">
            <div class="mb-3">
              <label class="form-label">Имя</label>
              <input v-model="form.name" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" required>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Сохранить
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="editMode = false; form.name = profile.name; form.email = profile.email">Отмена</button>
            </div>
          </form>

          <div v-else>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label text-muted small">Имя</label>
                <div class="fw-semibold">{{ profile?.name }}</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label text-muted small">Email</label>
                <div class="fw-semibold">{{ profile?.email }}</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label text-muted small">Роль</label>
                <div><span class="badge" :class="profile?.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'">{{ profile?.role }}</span></div>
              </div>
              <div class="col-sm-6">
                <label class="form-label text-muted small">Email подтверждён</label>
                <div>
                  <span :class="profile?.emailVerified ? 'text-success' : 'text-warning'">
                    <i :class="profile?.emailVerified ? 'bi bi-check-circle' : 'bi bi-clock'"></i>
                    {{ profile?.emailVerified ? 'Да' : 'Нет' }}
                  </span>
                </div>
              </div>
              <div class="col-sm-6">
                <label class="form-label text-muted small">Дата регистрации</label>
                <div>{{ profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ru-RU') : '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card p-4">
          <h6 class="fw-bold mb-3">Безопасность</h6>
          <button v-if="!showPasswordForm" class="btn btn-outline-primary w-100" @click="showPasswordForm = true">
            <i class="bi bi-key me-2"></i>Сменить пароль
          </button>
          <form v-else @submit.prevent="changePassword">
            <div class="mb-2">
              <input v-model="passwordForm.currentPassword" type="password" class="form-control form-control-sm" placeholder="Текущий пароль" required>
            </div>
            <div class="mb-2">
              <input v-model="passwordForm.newPassword" type="password" class="form-control form-control-sm" placeholder="Новый пароль" required minlength="8">
            </div>
            <div class="mb-3">
              <input v-model="passwordForm.confirmPassword" type="password" class="form-control form-control-sm" placeholder="Подтвердите пароль" required>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">Сохранить</button>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="showPasswordForm = false">Отмена</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
