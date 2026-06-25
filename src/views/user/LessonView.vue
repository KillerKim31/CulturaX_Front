<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const course = ref(null)
const lessons = ref([])
const currentLesson = ref(null)
const loading = ref(true)
const chaptersLoading = ref(false)
const currentChapterIdx = ref(0)
const chapterMedia = ref(null)

onMounted(async () => {
  try {
    const { courseId, lessonId } = route.params
    course.value = await courseStore.fetchCourseDetail(courseId)
    lessons.value = await courseStore.fetchLessons(courseId)
    currentLesson.value = lessons.value.find(l => l.id === Number(lessonId))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const currentChapter = computed(() => {
  return currentLesson.value?.chapters?.[currentChapterIdx.value] || null
})

async function loadChaptersForLesson(lessonId) {
  router.push(`/course/${route.params.courseId}/lesson/${lessonId}`)
  location.reload()
}

async function loadChapterMedia(chapterId) {
  chaptersLoading.value = true
  try {
    chapterMedia.value = await courseStore.fetchChapterMedia(route.params.courseId, chapterId)
  } catch (e) {
    console.error(e)
  } finally {
    chaptersLoading.value = false
  }
}
</script>

<template>
  <div class="page-container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <div class="row g-0">
        <nav class="col-md-3 border-end p-3" style="min-height: calc(100vh - 56px);">
          <h6 class="fw-bold text-muted text-uppercase small mb-3 px-2">
            <i class="bi bi-list-ul me-1"></i>Содержание
          </h6>
          <div v-for="(lesson, lIdx) in lessons" :key="lesson.id" class="mb-2">
            <div class="px-2 py-1 text-muted small fw-bold">
              {{ lIdx + 1 }}. {{ lesson.title }}
            </div>
            <RouterLink
              v-for="chapter in lesson.chapters || []"
              :key="chapter.id"
              :to="`/course/${route.params.courseId}/lesson/${lesson.id}`"
              class="sidebar-link"
            >
              <i class="bi bi-file-text"></i>
              <small>{{ chapter.title }}</small>
            </RouterLink>
          </div>
        </nav>

        <div class="col-md-9 p-4">
          <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb small">
              <li class="breadcrumb-item"><RouterLink to="/">Каталог</RouterLink></li>
              <li class="breadcrumb-item"><RouterLink :to="`/course/${route.params.courseId}`">{{ course?.title }}</RouterLink></li>
              <li class="breadcrumb-item active">{{ currentLesson?.title }}</li>
            </ol>
          </nav>

          <h4 class="fw-bold mb-4">{{ currentLesson?.title }}</h4>

          <div class="alert alert-info small">
            <i class="bi bi-info-circle me-2"></i>
            Содержимое глав загружается из API. Используйте боковую навигацию для перехода между модулями.
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button class="chapter-nav-btn" @click="$router.back()">
              <i class="bi bi-arrow-left"></i> Назад
            </button>
            <RouterLink to="/my-courses" class="chapter-nav-btn">
              Мои курсы <i class="bi bi-arrow-right"></i>
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
