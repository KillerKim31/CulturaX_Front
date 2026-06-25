<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/courses'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const courseStore = useCourseStore()
const router = useRouter()

const progress = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    progress.value = await courseStore.getUserProgress()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Привет, {{ auth.userName }}!</h1>
        <p class="text-muted mb-0">Ваш прогресс обучения</p>
      </div>
      <RouterLink to="/" class="btn btn-primary">
        <i class="bi bi-collection me-2"></i>Каталог курсов
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="progress">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i class="bi bi-book text-primary fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Записан</div>
                <div class="fs-4 fw-bold">{{ progress.totalEnrolled }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i class="bi bi-check-circle text-success fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Завершено</div>
                <div class="fs-4 fw-bold">{{ progress.completedCourses }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i class="bi bi-hourglass-split text-warning fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">В процессе</div>
                <div class="fs-4 fw-bold">{{ progress.inProgressCourses }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i class="bi bi-graph-up text-info fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Общий прогресс</div>
                <div class="fs-4 fw-bold">{{ Math.round(progress.overallProgressPercent) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h5 class="fw-bold mb-3">Текущие курсы</h5>
      <div v-if="progress.courses && progress.courses.length" class="row g-3">
        <div v-for="c in progress.courses" :key="c.courseId" class="col-md-6 col-lg-4">
          <div class="card h-100 p-3">
            <h6 class="fw-bold mb-2">{{ c.courseTitle }}</h6>
            <div class="d-flex justify-content-between text-muted small mb-2">
              <span>Прогресс</span>
              <span>{{ Math.round(c.progressPercent) }}%</span>
            </div>
            <div class="progress mb-2">
              <div class="progress-bar" :style="{ width: c.progressPercent + '%' }"></div>
            </div>
            <div class="d-flex justify-content-between text-muted small">
              <span>{{ formatDate(c.enrolledAt) }}</span>
              <span v-if="c.lastVisitedChapterTitle" class="text-truncate ms-2" style="max-width: 150px;">
                {{ c.lastVisitedChapterTitle }}
              </span>
            </div>
            <RouterLink :to="`/course/${c.courseId}`" class="stretched-link"></RouterLink>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="bi bi-inbox d-block"></i>
        <p>Вы пока не записаны ни на один курс</p>
        <RouterLink to="/" class="btn btn-primary">Перейти в каталог</RouterLink>
      </div>
    </template>
  </div>
</template>
