<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const stats = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/analytics')
    stats.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Админ-панель</h1>
          <p class="text-muted mb-0">Управление платформой CulturaX</p>
        </div>
        <div class="d-flex gap-2">
          <RouterLink to="/admin/users" class="btn btn-outline-primary">
            <i class="bi bi-people me-1"></i>Пользователи
          </RouterLink>
          <RouterLink to="/admin/courses" class="btn btn-primary">
            <i class="bi bi-book me-1"></i>Курсы
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="stats">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i class="bi bi-people text-primary fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Пользователей</div>
                <div class="fs-4 fw-bold">{{ stats.totalUsers }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i class="bi bi-book text-success fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Курсов</div>
                <div class="fs-4 fw-bold">{{ stats.totalCourses }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i class="bi bi-person-check text-info fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Записей</div>
                <div class="fs-4 fw-bold">{{ stats.totalEnrollments }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                <i class="bi bi-check-circle text-warning fs-4"></i>
              </div>
              <div>
                <div class="text-muted small">Завершено</div>
                <div class="fs-4 fw-bold">{{ stats.completedEnrollments }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-3">
          <div class="card p-3">
            <div class="text-muted small">Модулей</div>
            <div class="fs-5 fw-bold">{{ stats.totalLessons }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="text-muted small">Глав</div>
            <div class="fs-5 fw-bold">{{ stats.totalChapters }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="text-muted small">Тестов</div>
            <div class="fs-5 fw-bold">{{ stats.totalTests }}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card p-3">
            <div class="text-muted small">Активных</div>
            <div class="fs-5 fw-bold">{{ stats.activeUsers }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
