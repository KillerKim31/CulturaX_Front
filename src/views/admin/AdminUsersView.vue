<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const users = ref([])
const loading = ref(true)
const error = ref('')
const editingUser = ref(null)

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users')
    users.value = data
  } catch (e) {
    error.value = 'Не удалось загрузить пользователей'
  } finally {
    loading.value = false
  }
}

async function changeRole(user, newRole) {
  try {
    await api.put(`/admin/users/${user.id}`, { role: newRole })
    user.role = newRole
    editingUser.value = null
  } catch (e) {
    alert('Ошибка смены роли')
  }
}

async function deleteUser(user) {
  if (!confirm(`Удалить пользователя ${user.name}?`)) return
  try {
    await api.delete(`/admin/users/${user.id}`)
    users.value = users.value.filter(u => u.id !== user.id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Пользователи</h1>
        <p class="text-muted mb-0">Управление пользователями платформы</p>
      </div>
      <RouterLink to="/admin" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-1"></i>Назад
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Email подтв.</th>
              <th>Дата рег.</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td class="fw-semibold">{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span class="badge" :class="u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'">{{ u.role }}</span>
              </td>
              <td>
                <i :class="u.emailVerified ? 'bi bi-check-circle text-success' : 'bi bi-clock text-warning'"></i>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary" @click="editingUser = editingUser?.id === u.id ? null : u" title="Сменить роль">
                    <i class="bi bi-shield-check"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteUser(u)" title="Удалить">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="editingUser" class="card p-3 mt-3">
      <h6 class="fw-bold">Смена роли для {{ editingUser.name }}</h6>
      <div class="d-flex gap-2">
        <button class="btn btn-sm" :class="editingUser.role === 'USER' ? 'btn-primary' : 'btn-outline-primary'" @click="changeRole(editingUser, 'USER')">USER</button>
        <button class="btn btn-sm" :class="editingUser.role === 'ADMIN' ? 'btn-danger' : 'btn-outline-danger'" @click="changeRole(editingUser, 'ADMIN')">ADMIN</button>
      </div>
    </div>
  </div>
</template>
