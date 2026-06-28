<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId || route.params.id

const tests = ref([])
const lessons = ref([])
const chapters = ref([])
const loading = ref(true)
const saving = ref(false)
const msg = ref({ type: '', text: '' })
const showCreate = ref(false)

const form = ref({
  title: '',
  timeLimitMinutes: null,
  passingScore: 70,
  testType: 'CHAPTER',
  orderIndex: 1,
  lessonChapterId: null,
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [testsRes, lessonsRes] = await Promise.all([
      api.get(`/admin/course/${courseId}/tests`),
      api.get(`/courses/${courseId}/lessons`),
    ])
    tests.value = testsRes.data
    lessons.value = lessonsRes.data

    for (const lesson of lessons.value) {
      try {
        const { data } = await api.get(`/courses/${courseId}/chapters`, {
          params: { lessonId: lesson.id }
        })
        lesson._chapters = data
        chapters.value.push(...data)
      } catch {
        lesson._chapters = []
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function createTest() {
  saving.value = true
  msg.value = { type: '', text: '' }
  try {
    const payload = { ...form.value }
    if (!payload.lessonChapterId) payload.lessonChapterId = null
    const { data } = await api.post(`/admin/course/${courseId}/tests`, payload)
    tests.value.push(data)
    tests.value.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    showCreate.value = false
    form.value = { title: '', timeLimitMinutes: null, passingScore: 70, testType: 'CHAPTER', orderIndex: 1, lessonChapterId: null }
    msg.value = { type: 'success', text: 'Тест создан' }
  } catch (e) {
    msg.value = { type: 'danger', text: e.response?.data?.message || 'Ошибка создания теста' }
  } finally {
    saving.value = false
  }
}

async function deleteTest(test) {
  if (!confirm(`Удалить тест "${test.title}"?`)) return
  try {
    await api.delete(`/admin/course/${courseId}/tests/${test.id}`)
    tests.value = tests.value.filter(t => t.id !== test.id)
    msg.value = { type: 'success', text: 'Тест удалён' }
  } catch (e) {
    msg.value = { type: 'danger', text: 'Ошибка удаления теста' }
  }
}

function testTypeLabel(type) {
  const labels = { CHAPTER: 'Тест раздела', MODULE: 'Тест модуля', COURSE_EXAM: 'Экзамен курса' }
  return labels[type] || type
}

function testTypeBadgeClass(type) {
  const classes = { CHAPTER: 'bg-info', MODULE: 'bg-warning text-dark', COURSE_EXAM: 'bg-danger' }
  return classes[type] || 'bg-secondary'
}

function getChapterTitle(chapterId) {
  const ch = chapters.value.find(c => c.id === chapterId)
  return ch ? ch.title : '—'
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Тесты курса</h1>
        <p class="text-muted mb-0">Создание и управление тестами</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="showCreate = !showCreate">
          <i class="bi bi-plus-circle me-1"></i>Новый тест
        </button>
        <RouterLink to="/admin/courses" class="btn btn-outline-primary">
          <i class="bi bi-arrow-left me-1"></i>Назад к курсам
        </RouterLink>
      </div>
    </div>

    <div v-if="msg.text" :class="`alert alert-${msg.type} py-2`">{{ msg.text }}</div>

    <div v-if="showCreate" class="card p-4 mb-4">
      <h5 class="fw-bold mb-3">Новый тест</h5>
      <form @submit.prevent="createTest">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Название</label>
            <input v-model="form.title" class="form-control" required>
          </div>
          <div class="col-md-3">
            <label class="form-label">Тип теста</label>
            <select v-model="form.testType" class="form-select">
              <option value="CHAPTER">Тест раздела</option>
              <option value="MODULE">Тест модуля</option>
              <option value="COURSE_EXAM">Экзамен курса</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Порядок</label>
            <input v-model.number="form.orderIndex" type="number" class="form-control" min="1">
          </div>
          <div class="col-md-4">
            <label class="form-label">Проходной балл (%)</label>
            <input v-model.number="form.passingScore" type="number" class="form-control" min="0" max="100" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Лимит времени (мин)</label>
            <input v-model.number="form.timeLimitMinutes" type="number" class="form-control" min="0" placeholder="Без ограничений">
          </div>
          <div class="col-md-4" v-if="form.testType !== 'COURSE_EXAM'">
            <label class="form-label">Привязать к разделу</label>
            <select v-model="form.lessonChapterId" class="form-select">
              <option :value="null">Без привязки</option>
              <option v-for="ch in chapters" :key="ch.id" :value="ch.id">{{ ch.title }}</option>
            </select>
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary me-2" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Создать
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="showCreate = false">Отмена</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="tests.length" class="row g-3">
      <div v-for="test in tests" :key="test.id" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge" :class="testTypeBadgeClass(test.testType)">{{ testTypeLabel(test.testType) }}</span>
              <span class="text-muted small">№{{ test.orderIndex }}</span>
            </div>
            <h6 class="fw-bold mb-2">{{ test.title }}</h6>
            <div class="text-muted small mb-3">
              <div><i class="bi bi-percent me-1"></i>Проходной: {{ test.passingScore }}%</div>
              <div v-if="test.timeLimitMinutes"><i class="bi bi-clock me-1"></i>{{ test.timeLimitMinutes }} мин</div>
              <div v-if="test.lessonChapterId"><i class="bi bi-link-45deg me-1"></i>{{ getChapterTitle(test.lessonChapterId) }}</div>
            </div>
            <div class="mt-auto d-flex gap-1">
              <RouterLink :to="`/admin/test/${test.id}/edit`" class="btn btn-sm btn-primary flex-grow-1">
                <i class="bi bi-pencil me-1"></i>Редактировать
              </RouterLink>
              <button class="btn btn-sm btn-outline-danger" @click="deleteTest(test)" title="Удалить">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="bi bi-clipboard-check d-block"></i>
      <p>Тестов пока нет</p>
      <button class="btn btn-primary" @click="showCreate = true">Создать первый тест</button>
    </div>
  </div>
</template>
