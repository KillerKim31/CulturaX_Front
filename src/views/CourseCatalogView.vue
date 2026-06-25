<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCourseStore } from '@/stores/courses'

const courseStore = useCourseStore()
const search = ref('')
const complexityFilter = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    await courseStore.fetchCourses()
  } finally {
    loading.value = false
  }
})

const filteredCourses = computed(() => {
  return courseStore.courses.filter(c => {
    const matchSearch = !search.value || c.title.toLowerCase().includes(search.value.toLowerCase()) || c.description?.toLowerCase().includes(search.value.toLowerCase())
    const matchComplexity = !complexityFilter.value || c.complexity === complexityFilter.value
    return matchSearch && matchComplexity
  })
})

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
    <div class="page-header">
      <h1 class="page-title">Каталог курсов</h1>
      <p class="text-muted">Найдите подходящий курс для обучения</p>
    </div>

    <div class="card p-3 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-6">
          <label class="form-label small text-muted">Поиск</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
            <input v-model="search" type="text" class="form-control" placeholder="Поиск по названию или описанию...">
          </div>
        </div>
        <div class="col-md-3">
          <label class="form-label small text-muted">Уровень</label>
          <select v-model="complexityFilter" class="form-select">
            <option :value="0">Все уровни</option>
            <option :value="1">Начальный</option>
            <option :value="2">Средний</option>
            <option :value="3">Продвинутый</option>
            <option :value="4">Экспертный</option>
            <option :value="5">Мастер</option>
          </select>
        </div>
        <div class="col-md-3 text-muted small">
          Найдено: {{ filteredCourses.length }} курсов
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="filteredCourses.length" class="row g-4">
      <div v-for="course in filteredCourses" :key="course.id" class="col-md-6 col-lg-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary bg-opacity-10 text-primary">{{ course.language?.toUpperCase() }}</span>
              <div class="complexity-badge" :title="complexityLabel(course.complexity)">
                <span v-for="(active, i) in complexityDots(course.complexity)" :key="i"
                  class="complexity-dot" :class="{ active }"></span>
              </div>
            </div>
            <h5 class="card-title fw-bold">{{ course.title }}</h5>
            <p class="card-text text-muted small flex-grow-1">{{ course.description || 'Описание отсутствует' }}</p>
            <div class="d-flex justify-content-between align-items-center text-muted small mb-3">
              <span><i class="bi bi-person me-1"></i>{{ course.authorName }}</span>
              <span><i class="bi bi-clock me-1"></i>{{ formatTime(course.passageTime) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small mb-3">
              <span><i class="bi bi-book me-1"></i>{{ course.lessonsCount }} модулей</span>
              <span><i class="bi bi-file-text me-1"></i>{{ course.chaptersCount }} глав</span>
            </div>
            <RouterLink :to="`/course/${course.id}`" class="btn btn-primary w-100">
              Подробнее
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="bi bi-inbox d-block"></i>
      <p>Курсы не найдены</p>
    </div>
  </div>
</template>
