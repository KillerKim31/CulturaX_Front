<script setup>
import { ref, onMounted } from 'vue'
import { useCourseStore } from '@/stores/courses'

const courseStore = useCourseStore()
const certificates = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    certificates.value = await courseStore.getCertificates()
  } finally {
    loading.value = false
  }
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header">
      <h1 class="page-title">Сертификаты</h1>
      <p class="text-muted">Ваши сертификаты об окончании курсов</p>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="certificates.length" class="row g-4">
      <div v-for="cert in certificates" :key="cert.id" class="col-md-6">
        <div class="card p-4">
          <div class="d-flex align-items-start">
            <div class="rounded bg-warning bg-opacity-10 p-3 me-3">
              <i class="bi bi-award text-warning fs-3"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="fw-bold mb-1">{{ cert.courseTitle }}</h6>
              <div class="text-muted small mb-2">
                <div><strong>№:</strong> {{ cert.certificateNumber }}</div>
                <div><strong>Дата:</strong> {{ formatDate(cert.createdAt) }}</div>
              </div>
              <a v-if="cert.certificateUrl" :href="cert.certificateUrl" class="btn btn-sm btn-outline-primary" target="_blank">
                <i class="bi bi-download me-1"></i>Скачать
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="bi bi-award d-block"></i>
      <p>У вас пока нет сертификатов</p>
      <RouterLink to="/" class="btn btn-primary">Пройти курс</RouterLink>
    </div>
  </div>
</template>
