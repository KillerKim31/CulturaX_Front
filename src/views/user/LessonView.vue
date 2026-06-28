<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const course = ref(null)
const lessons = ref([])
const currentLesson = ref(null)
const activeChapter = ref(null)
const loading = ref(true)
const chaptersLoading = ref(false)
const expandedLessons = ref(new Set())

const courseId = computed(() => route.params.courseId)
const lessonId = computed(() => route.params.lessonId)

async function loadData() {
  loading.value = true
  try {
    course.value = await courseStore.fetchCourseDetail(courseId.value)
    lessons.value = await courseStore.fetchLessons(courseId.value)
    currentLesson.value = lessons.value.find(l => l.id === Number(lessonId.value))

    for (const lesson of lessons.value) {
      try {
        const { data } = await api.get(`/courses/${courseId.value}/chapters`, {
          params: { lessonId: lesson.id }
        })
        lesson.chapters = data
      } catch {
        lesson.chapters = []
      }
    }

    if (currentLesson.value) {
      expandedLessons.value.add(currentLesson.value.id)
      if (currentLesson.value.chapters?.length > 0) {
        selectChapter(currentLesson.value.chapters[0])
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function selectChapter(chapter) {
  activeChapter.value = chapter
  if (!currentLesson.value || currentLesson.value.id !== chapter.lessonId) {
    currentLesson.value = lessons.value.find(l => l.id === chapter.lessonId)
    if (currentLesson.value) expandedLessons.value.add(currentLesson.value.id)
  }
}

function goToLesson(lesson) {
  router.push(`/course/${courseId.value}/lesson/${lesson.id}`)
}

function toggleLesson(lesson) {
  if (expandedLessons.value.has(lesson.id)) {
    expandedLessons.value.delete(lesson.id)
  } else {
    expandedLessons.value.add(lesson.id)
  }
}

function goNextChapter() {
  if (!activeChapter.value) return
  const allChapters = lessons.value.flatMap(l => l.chapters || [])
  const idx = allChapters.findIndex(c => c.id === activeChapter.value.id)
  if (idx < allChapters.length - 1) {
    selectChapter(allChapters[idx + 1])
  }
}

function goPrevChapter() {
  if (!activeChapter.value) return
  const allChapters = lessons.value.flatMap(l => l.chapters || [])
  const idx = allChapters.findIndex(c => c.id === activeChapter.value.id)
  if (idx > 0) {
    selectChapter(allChapters[idx - 1])
  }
}

const currentFlatIndex = computed(() => {
  if (!activeChapter.value) return -1
  const allChapters = lessons.value.flatMap(l => l.chapters || [])
  return allChapters.findIndex(c => c.id === activeChapter.value.id)
})

const totalChapters = computed(() => lessons.value.reduce((sum, l) => sum + (l.chapters?.length || 0), 0))

const hasNext = computed(() => currentFlatIndex.value < totalChapters.value - 1)
const hasPrev = computed(() => currentFlatIndex.value > 0)

onMounted(loadData)
watch(lessonId, loadData)
</script>

<template>
  <div class="lesson-layout">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <aside class="lesson-sidebar">
        <div class="sidebar-top">
          <RouterLink :to="`/course/${courseId}`" class="d-flex align-items-center text-decoration-none mb-3 px-2">
            <i class="bi bi-arrow-left me-2 text-primary"></i>
            <small class="text-primary fw-semibold">К курсу</small>
          </RouterLink>
          <h6 class="fw-bold px-2 mb-3">{{ course?.title }}</h6>

          <div v-for="(lesson, lIdx) in lessons" :key="lesson.id" class="lesson-group mb-1">
            <button
              class="lesson-toggle w-100 text-start px-2 py-2 border-0 bg-transparent d-flex align-items-center"
              :class="{ active: currentLesson?.id === lesson.id }"
              @click="toggleLesson(lesson)"
            >
              <i class="bi me-2 small"
                :class="expandedLessons.has(lesson.id) ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
              <span class="badge bg-primary bg-opacity-10 text-primary me-2 small">{{ lIdx + 1 }}</span>
              <span class="fw-semibold small flex-grow-1 text-truncate">{{ lesson.title }}</span>
            </button>

            <Transition name="expand">
              <div v-if="expandedLessons.has(lesson.id)" class="chapter-list ms-3">
                <button
                  v-for="(ch, cIdx) in lesson.chapters || []"
                  :key="ch.id"
                  class="chapter-link w-100 text-start px-2 py-1 border-0 bg-transparent d-flex align-items-center"
                  :class="{ active: activeChapter?.id === ch.id }"
                  @click="selectChapter(ch)"
                >
                  <i class="bi bi-file-text me-2 small text-muted"></i>
                  <small class="text-truncate">{{ ch.title }}</small>
                </button>
                <div v-if="!lesson.chapters?.length" class="px-2 py-1">
                  <small class="text-muted fst-italic">Нет глав</small>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </aside>

      <main class="lesson-content">
        <div class="content-inner">
          <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb small">
              <li class="breadcrumb-item"><RouterLink to="/">Каталог</RouterLink></li>
              <li class="breadcrumb-item"><RouterLink :to="`/course/${courseId}`">{{ course?.title }}</RouterLink></li>
              <li class="breadcrumb-item active">{{ currentLesson?.title }}</li>
            </ol>
          </nav>

          <div v-if="chaptersLoading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else-if="!activeChapter" class="text-center py-5 text-muted">
            <i class="bi bi-inbox d-block mb-2" style="font-size: 2rem;"></i>
            <p>Выберите главу в содержании</p>
          </div>

          <template v-else>
            <h4 class="fw-bold mb-4">{{ activeChapter.title }}</h4>

            <div v-if="activeChapter.content" class="chapter-text mb-4" v-html="activeChapter.content"></div>

            <hr class="my-4">

            <div class="d-flex justify-content-between">
              <button class="btn btn-outline-secondary" @click="goPrevChapter" :disabled="!hasPrev">
                <i class="bi bi-arrow-left me-1"></i> Назад
              </button>
              <button class="btn btn-primary" @click="goNextChapter" :disabled="!hasNext">
                Далее <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </template>
        </div>
      </main>
    </template>
  </div>
</template>

<style scoped>
.lesson-layout {
  display: flex;
  min-height: calc(100vh - 60px);
}

.lesson-sidebar {
  width: 300px;
  min-width: 300px;
  border-right: 1px solid var(--border-light);
  background: #fff;
  overflow-y: auto;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.sidebar-top {
  padding: 1rem;
  flex: 1;
}

.lesson-toggle {
  border-radius: 10px;
  transition: var(--transition);
}

.lesson-toggle:hover {
  background-color: var(--primary-50);
}

.lesson-toggle.active {
  background-color: var(--primary-light);
  color: var(--primary);
}

.chapter-list {
  padding: 0.25rem 0;
}

.chapter-link {
  border-radius: 8px;
  transition: var(--transition);
  color: var(--text-secondary);
}

.chapter-link:hover {
  background-color: var(--primary-50);
  color: var(--text-primary);
}

.chapter-link.active {
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.chapter-link.active small {
  color: var(--primary);
}

.lesson-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.content-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.chapter-text {
  line-height: 1.75;
  color: var(--text-primary);
}

.chapter-text :deep(h1),
.chapter-text :deep(h2),
.chapter-text :deep(h3),
.chapter-text :deep(h4) {
  color: var(--text-primary);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.chapter-text :deep(p) { margin-bottom: 1rem; }
.chapter-text :deep(ul),
.chapter-text :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }

.chapter-text :deep(blockquote) {
  border-left: 4px solid var(--primary);
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  background: var(--primary-50);
  border-radius: 0 10px 10px 0;
  color: var(--text-secondary);
}

.chapter-text :deep(pre) {
  background: var(--text-primary);
  color: #e8e9f0;
  padding: 1rem;
  border-radius: 10px;
  overflow-x: auto;
}

.chapter-text :deep(code) {
  background: var(--primary-50);
  color: var(--primary);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

.chapter-text :deep(pre code) { background: none; color: inherit; padding: 0; }
.chapter-text :deep(img) { max-width: 100%; height: auto; border-radius: 10px; margin: 1rem 0; }
.chapter-text :deep(a) { color: var(--primary); text-decoration: underline; }
.chapter-text :deep(hr) { border: none; border-top: 1px solid var(--border-light); margin: 1.5rem 0; }

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

@media (max-width: 768px) {
  .lesson-sidebar {
    width: 100%;
    min-width: 100%;
    height: auto;
    position: relative;
    top: 0;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    max-height: 40vh;
  }
}
</style>
