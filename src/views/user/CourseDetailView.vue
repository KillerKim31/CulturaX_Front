<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const auth = useAuthStore()

const course = ref(null)
const lessons = ref([])
const loading = ref(true)
const enrolling = ref(false)
const enrolled = ref(false)
const progress = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    course.value = await courseStore.fetchCourseDetail(id)
    lessons.value = await courseStore.fetchLessons(id)

    if (auth.isAuthenticated) {
      try {
        const enrolledList = await courseStore.getEnrolledCourses()
        const match = enrolledList.find(e => e.courseId === Number(id))
        if (match) {
          enrolled.value = true
          progress.value = match.progressPercent
        }
      } catch (e) { /* not enrolled */ }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function handleEnroll() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  enrolling.value = true
  try {
    await courseStore.enrollCourse(course.value.id)
    enrolled.value = true
    progress.value = 0
  } catch (e) {
    console.error(e)
  } finally {
    enrolling.value = false
  }
}

function complexityLabel(level) {
  const labels = ['', 'Начальный', 'Средний', 'Продвинутый', 'Экспертный', 'Мастер']
  return labels[level] || `Уровень ${level}`
}

function formatTime(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} ч ${m} мин`
  return `${m} мин`
}

function complexityDots(level) {
  return Array.from({ length: 5 }, (_, i) => i < level)
}
</script>

<template>
  <div class="page-container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="course">
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><RouterLink to="/">Каталог</RouterLink></li>
          <li class="breadcrumb-item active">{{ course.title }}</li>
        </ol>
      </nav>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span class="badge bg-primary bg-opacity-10 text-primary me-2">{{ course.language?.toUpperCase() }}</span>
                <span class="badge" :class="course.isPublished ? 'bg-success' : 'bg-secondary'">
                  {{ course.isPublished ? 'Опубликован' : 'Черновик' }}
                </span>
              </div>
              <div class="complexity-badge" :title="complexityLabel(course.complexity)">
                <span v-for="(active, i) in complexityDots(course.complexity)" :key="i"
                  class="complexity-dot" :class="{ active }"></span>
                <small class="text-muted ms-1">{{ complexityLabel(course.complexity) }}</small>
              </div>
            </div>
            <h2 class="fw-bold">{{ course.title }}</h2>
            <p class="text-muted">{{ course.description || 'Описание отсутствует' }}</p>
            <div class="d-flex gap-4 text-muted small mt-3">
              <span><i class="bi bi-person me-1"></i>{{ course.authorName }}</span>
              <span><i class="bi bi-clock me-1"></i>{{ formatTime(course.passageTime) }}</span>
              <span><i class="bi bi-calendar me-1"></i>{{ new Date(course.createdAt).toLocaleDateString('ru-RU') }}</span>
            </div>
          </div>

          <h5 class="fw-bold mb-3">Программа курса</h5>
          <div v-if="lessons.length" class="accordion mb-4" id="lessonsAccordion">
            <div v-for="(lesson, idx) in lessons" :key="lesson.id" class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" :class="{ collapsed: idx !== 0 }" type="button"
                  data-bs-toggle="collapse" :data-bs-target="'#lesson-' + lesson.id">
                  <span class="badge bg-primary bg-opacity-10 text-primary me-2">{{ idx + 1 }}</span>
                  {{ lesson.title }}
                  <span class="text-muted small ms-auto me-2">{{ lesson.chaptersCount }} глав</span>
                </button>
              </h2>
              <div :id="'lesson-' + lesson.id" class="accordion-collapse collapse" :class="{ show: idx === 0 }"
                data-bs-parent="#lessonsAccordion">
                <div class="accordion-body p-0">
                  <RouterLink v-if="enrolled" :to="`/course/${course.id}/lesson/${lesson.id}`"
                    class="d-block px-4 py-3 border-bottom text-decoration-none hover-bg-light">
                    <i class="bi bi-play-circle me-2 text-primary"></i>Начать модуль
                  </RouterLink>
                  <div v-else class="px-4 py-3 text-muted small">
                    <i class="bi bi-lock me-2"></i>Запишитесь на курс, чтобы открыть содержимое
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-muted text-center py-4">
            Модули пока не добавлены
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card p-4 sticky-top" style="top: 80px;">
            <div v-if="enrolled" class="mb-3">
              <label class="form-label small text-muted">Прогресс</label>
              <div class="progress mb-1">
                <div class="progress-bar" :style="{ width: (progress || 0) + '%' }"></div>
              </div>
              <small class="text-muted">{{ Math.round(progress || 0) }}% пройдено</small>
            </div>

            <button v-if="!enrolled" class="btn btn-primary w-100 py-2 mb-3" @click="handleEnroll" :disabled="enrolling">
              <span v-if="enrolling" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-plus-circle me-2"></i>
              Записаться на курс
            </button>

            <RouterLink v-else :to="`/course/${course.id}/lesson/${lessons[0]?.id || 0}`" class="btn btn-primary w-100 py-2 mb-3">
              <i class="bi bi-play-fill me-2"></i>Продолжить обучение
            </RouterLink>

            <div class="d-flex flex-column gap-2 text-muted small">
              <div class="d-flex justify-content-between">
                <span>Модулей</span>
                <span class="fw-semibold text-dark">{{ course.lessonsCount }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Глав</span>
                <span class="fw-semibold text-dark">{{ course.chaptersCount }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Язык</span>
                <span class="fw-semibold text-dark">{{ course.language?.toUpperCase() }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span>Сложность</span>
                <span class="fw-semibold text-dark">{{ complexityLabel(course.complexity) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
