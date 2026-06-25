<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const course = ref(null)
const lessons = ref([])
const loading = ref(true)
const saving = ref(false)
const msg = ref({ type: '', text: '' })

const courseForm = ref({})
const showLessonForm = ref(false)
const lessonForm = ref({ title: '', orderIndex: 1 })
const showChapterForm = ref(null)
const chapterForm = ref({ title: '', content: '', orderIndex: 1 })

onMounted(async () => {
  await loadCourse()
})

async function loadCourse() {
  loading.value = true
  try {
    const { data } = await api.get(`/admin/courses/${route.params.id}`)
    course.value = data
    courseForm.value = {
      title: data.title,
      description: data.description || '',
      language: data.language,
      complexity: data.complexity,
      passageTime: data.passageTime,
      isPublished: data.isPublished,
    }
    lessons.value = data.lessons || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveCourse() {
  saving.value = true
  msg.value = { type: '', text: '' }
  try {
    const { data } = await api.put(`/admin/courses/${route.params.id}`, courseForm.value)
    course.value = { ...course.value, ...data }
    msg.value = { type: 'success', text: 'Курс сохранён' }
  } catch (e) {
    msg.value = { type: 'danger', text: e.response?.data?.message || 'Ошибка' }
  } finally {
    saving.value = false
  }
}

async function createLesson() {
  saving.value = true
  try {
    const { data } = await api.post('/admin/lessons', {
      title: lessonForm.value.title,
      courseId: Number(route.params.id),
      orderIndex: lessonForm.value.orderIndex,
    })
    lessons.value.push({ ...data, chapters: [] })
    showLessonForm.value = false
    lessonForm.value = { title: '', orderIndex: lessons.value.length + 1 }
  } catch (e) {
    alert('Ошибка создания модуля')
  } finally {
    saving.value = false
  }
}

async function deleteLesson(lesson) {
  if (!confirm(`Удалить модуль "${lesson.title}"?`)) return
  try {
    await api.delete(`/admin/lessons/${lesson.id}`)
    lessons.value = lessons.value.filter(l => l.id !== lesson.id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}

async function createChapter(lesson) {
  saving.value = true
  try {
    const { data } = await api.post('/admin/chapter_lessons', {
      title: chapterForm.value.title,
      content: chapterForm.value.content,
      lessonId: lesson.id,
      orderIndex: chapterForm.value.orderIndex,
    })
    if (!lesson.chapters) lesson.chapters = []
    lesson.chapters.push(data)
    showChapterForm.value = null
    chapterForm.value = { title: '', content: '', orderIndex: 1 }
  } catch (e) {
    alert('Ошибка создания главы')
  } finally {
    saving.value = false
  }
}

async function deleteChapter(lesson, chapter) {
  if (!confirm(`Удалить главу "${chapter.title}"?`)) return
  try {
    await api.delete(`/admin/chapter_lessons/${chapter.id}`)
    lesson.chapters = lesson.chapters.filter(c => c.id !== chapter.id)
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
        <h1 class="page-title">Редактирование курса</h1>
        <p class="text-muted mb-0" v-if="course">ID: {{ course.id }} · {{ course.title }}</p>
      </div>
      <RouterLink to="/admin/courses" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-1"></i>Назад к списку
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="course">
      <div v-if="msg.text" :class="`alert alert-${msg.type} py-2`">{{ msg.text }}</div>

      <div class="card p-4 mb-4">
        <h5 class="fw-bold mb-3">Настройки курса</h5>
        <form @submit.prevent="saveCourse">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Название</label>
              <input v-model="courseForm.title" class="form-control" required>
            </div>
            <div class="col-md-3">
              <label class="form-label">Язык</label>
              <select v-model="courseForm.language" class="form-select">
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Сложность</label>
              <select v-model.number="courseForm.complexity" class="form-select">
                <option v-for="i in 5" :key="i" :value="i">{{ i }} - {{ complexityLabel(i) }}</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label">Описание</label>
              <textarea v-model="courseForm.description" class="form-control" rows="3"></textarea>
            </div>
            <div class="col-md-4">
              <label class="form-label">Время прохождения (сек)</label>
              <input v-model.number="courseForm.passageTime" type="number" class="form-control" min="0">
            </div>
            <div class="col-md-4">
              <div class="form-check form-switch mt-4">
                <input v-model="courseForm.isPublished" class="form-check-input" type="checkbox" id="pubCheck">
                <label class="form-check-label" for="pubCheck">Опубликован</label>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary mt-3" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>Сохранить
          </button>
        </form>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0">Модули и главы</h5>
        <button class="btn btn-primary btn-sm" @click="showLessonForm = !showLessonForm">
          <i class="bi bi-plus-circle me-1"></i>Добавить модуль
        </button>
      </div>

      <div v-if="showLessonForm" class="card p-3 mb-3">
        <form @submit.prevent="createLesson" class="row g-2 align-items-end">
          <div class="col-md-6">
            <label class="form-label small">Название модуля</label>
            <input v-model="lessonForm.title" class="form-control form-control-sm" required>
          </div>
          <div class="col-md-2">
            <label class="form-label small">Порядок</label>
            <input v-model.number="lessonForm.orderIndex" type="number" class="form-control form-control-sm" min="1">
          </div>
          <div class="col-md-4">
            <button type="submit" class="btn btn-primary btn-sm me-2" :disabled="saving">Создать</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="showLessonForm = false">Отмена</button>
          </div>
        </form>
      </div>

      <div v-for="lesson in lessons" :key="lesson.id" class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <span class="badge bg-primary bg-opacity-10 text-primary me-2">{{ lesson.orderIndex }}</span>
            <strong>{{ lesson.title }}</strong>
          </div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" @click="showChapterForm = showChapterForm === lesson.id ? null : lesson.id">
              <i class="bi bi-plus"></i> Главу
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteLesson(lesson)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div v-if="showChapterForm === lesson.id" class="card-body border-bottom bg-light">
          <form @submit.prevent="createChapter(lesson)" class="row g-2">
            <div class="col-md-4">
              <input v-model="chapterForm.title" class="form-control form-control-sm" placeholder="Название главы" required>
            </div>
            <div class="col-md-4">
              <input v-model="chapterForm.content" class="form-control form-control-sm" placeholder="HTML содержимое">
            </div>
            <div class="col-md-2">
              <input v-model.number="chapterForm.orderIndex" type="number" class="form-control form-control-sm" placeholder="Порядок" min="1">
            </div>
            <div class="col-md-2">
              <button type="submit" class="btn btn-primary btn-sm w-100" :disabled="saving">Добавить</button>
            </div>
          </form>
        </div>

        <div class="card-body p-0">
          <div v-if="lesson.chapters && lesson.chapters.length">
            <div v-for="ch in lesson.chapters" :key="ch.id"
              class="d-flex justify-content-between align-items-center px-4 py-2 border-bottom">
              <div>
                <span class="text-muted small me-2">{{ ch.orderIndex }}.</span>
                {{ ch.title }}
                <small class="text-muted ms-2">
                  <span v-if="ch.imagesCount"><i class="bi bi-image me-1"></i>{{ ch.imagesCount }}</span>
                  <span v-if="ch.videosCount"><i class="bi bi-camera-video me-1"></i>{{ ch.videosCount }}</span>
                </small>
              </div>
              <button class="btn btn-sm btn-outline-danger" @click="deleteChapter(lesson, ch)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div v-else class="text-muted text-center py-3 small">Нет глав</div>
        </div>
      </div>
    </template>
  </div>
</template>
