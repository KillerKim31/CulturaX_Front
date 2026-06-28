<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const courses = ref([])
const loading = ref(true)
const showCreate = ref(false)
const form = ref({ title: '', description: '', language: 'ru', complexity: 1, passageTime: 0, isPublished: false, authorId: 1 })
const saving = ref(false)

onMounted(async () => {
  await loadCourses()
})

async function loadCourses() {
  loading.value = true
  try {
    const { data } = await api.get('/courses')
    courses.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function createCourse() {
  saving.value = true
  try {
    const { data } = await api.post('/admin/courses', form.value)
    courses.value.push(data)
    showCreate.value = false
    form.value = { title: '', description: '', language: 'ru', complexity: 1, passageTime: 0, isPublished: false, authorId: 1 }
    router.push(`/admin/course/${data.id}/edit`)
  } catch (e) {
    alert('Ошибка создания курса: ' + (e.response?.data?.message || ''))
  } finally {
    saving.value = false
  }
}

async function deleteCourse(course) {
  if (!confirm(`Удалить курс "${course.title}"?`)) return
  try {
    await api.delete(`/admin/courses/${course.id}`)
    courses.value = courses.value.filter(c => c.id !== course.id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}

function complexityLabel(level) {
  const labels = ['', 'Начальный', 'Средний', 'Продвинутый', 'Экспертный', 'Мастер']
  return labels[level] || `Ур. ${level}`
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Управление курсами</h1>
        <p class="text-muted mb-0">Создание, редактирование и удаление курсов</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="showCreate = !showCreate">
          <i class="bi bi-plus-circle me-1"></i>Новый курс
        </button>
        <RouterLink to="/admin" class="btn btn-outline-primary">
          <i class="bi bi-arrow-left me-1"></i>Назад
        </RouterLink>
      </div>
    </div>

    <div v-if="showCreate" class="card p-4 mb-4">
      <h5 class="fw-bold mb-3">Новый курс</h5>
      <form @submit.prevent="createCourse">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Название</label>
            <input v-model="form.title" class="form-control" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">Автор (ID)</label>
            <input v-model.number="form.authorId" type="number" class="form-control" min="1">
          </div>
          <div class="col-12">
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" class="form-control" rows="3"></textarea>
          </div>
          <div class="col-md-4">
            <label class="form-label">Язык</label>
            <select v-model="form.language" class="form-select">
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Сложность</label>
            <select v-model.number="form.complexity" class="form-select">
              <option v-for="i in 5" :key="i" :value="i">{{ i }} - {{ complexityLabel(i) }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Время прохождения (сек)</label>
            <input v-model.number="form.passageTime" type="number" class="form-control" min="0">
          </div>
          <div class="col-md-4">
            <div class="form-check form-switch mt-4">
              <input v-model="form.isPublished" class="form-check-input" type="checkbox" id="publishCheck">
              <label class="form-check-label" for="publishCheck">Опубликован</label>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Создать
          </button>
          <button type="button" class="btn btn-outline-secondary" @click="showCreate = false">Отмена</button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Язык</th>
              <th>Сложность</th>
              <th>Статус</th>
              <th>Автор</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in courses" :key="c.id">
              <td>{{ c.id }}</td>
              <td class="fw-semibold">{{ c.title }}</td>
              <td>{{ c.language?.toUpperCase() }}</td>
              <td><span class="badge bg-secondary">{{ complexityLabel(c.complexity) }}</span></td>
              <td>
                <span class="badge" :class="c.isPublished ? 'bg-success' : 'bg-secondary'">
                  {{ c.isPublished ? 'Опубл.' : 'Черновик' }}
                </span>
              </td>
              <td>{{ c.authorName }}</td>
              <td>
                <div class="d-flex gap-1">
                  <RouterLink :to="`/admin/course/${c.id}/tests`" class="btn btn-sm btn-outline-success" title="Тесты">
                    <i class="bi bi-clipboard-check"></i>
                  </RouterLink>
                  <RouterLink :to="`/admin/course/${c.id}/edit`" class="btn btn-sm btn-outline-primary" title="Редактировать">
                    <i class="bi bi-pencil"></i>
                  </RouterLink>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteCourse(c)" title="Удалить">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
