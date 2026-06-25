<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '@/stores/courses'

const courseStore = useCourseStore()
const courses = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    courses.value = await courseStore.getEnrolledCourses()
  } finally {
    loading.value = false
  }
})

function formatTime(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} ч ${m} мин`
  return `${m} мин`
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header">
      <h1 class="page-title">Мои курсы</h1>
      <p class="text-muted">Курсы, на которые вы записаны</p>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="courses.length" class="row g-4">
      <div v-for="c in courses" :key="c.courseId" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <span class="badge w-fit mb-2" :class="c.completed ? 'bg-success' : 'bg-primary bg-opacity-10 text-primary'">
              {{ c.completed ? 'Завершён' : 'В процессе' }}
            </span>
            <h5 class="card-title fw-bold">{{ c.title }}</h5>
            <p class="card-text text-muted small flex-grow-1">{{ c.description || 'Нет описания' }}</p>

            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span class="text-muted">Прогресс</span>
                <span class="fw-semibold">{{ Math.round(c.progressPercent) }}%</span>
              </div>
              <div class="progress">
                <div class="progress-bar" :style="{ width: c.progressPercent + '%' }"></div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="bi bi-clock me-1"></i>{{ formatTime(c.progressPercent) }}
              </small>
              <RouterLink :to="`/course/${c.courseId}`" class="btn btn-sm btn-primary">
                {{ c.completed ? 'Повторить' : 'Продолжить' }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="bi bi-inbox d-block"></i>
      <p>Вы пока не записаны ни на один курс</p>
      <RouterLink to="/" class="btn btn-primary">Перейти в каталог</RouterLink>
    </div>
  </div>
</template>
