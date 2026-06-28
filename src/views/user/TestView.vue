<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const test = ref(null)
const loading = ref(true)
const answers = ref({})
const started = ref(false)
const submitted = ref(false)
const result = ref(null)
const submitting = ref(false)
const error = ref('')
const currentIdx = ref(0)
const showConfirm = ref(false)

const timeRemaining = ref(0)
const timerInterval = ref(null)
const timerExpired = ref(false)

const courseId = computed(() => test.value?.courseId || route.query.courseId || null)
const currentQuestion = computed(() => test.value?.questions?.[currentIdx.value] || null)
const totalQuestions = computed(() => test.value?.questions?.length || 0)
const isLastQuestion = computed(() => currentIdx.value >= totalQuestions.value - 1)
const totalAnswered = computed(() => Object.keys(answers.value).filter(k => answers.value[k]?.length > 0).length)

function questionStatus(idx) {
  const q = test.value?.questions?.[idx]
  if (!q) return 'unanswered'
  return answers.value[q.id]?.length > 0 ? 'answered' : 'unanswered'
}

onMounted(async () => {
  try {
    test.value = await courseStore.getTest(route.params.id)
    timeRemaining.value = (test.value.timeLimitMinutes || 0) * 60
  } catch (e) {
    error.value = 'Не удалось загрузить тест'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (timerInterval.value) clearInterval(timerInterval.value)
})

function startTest() {
  started.value = true
  currentIdx.value = 0
  if (test.value.timeLimitMinutes > 0) {
    timeRemaining.value = test.value.timeLimitMinutes * 60
    timerInterval.value = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value--
      } else {
        timerExpired.value = true
        clearInterval(timerInterval.value)
        handleSubmit()
      }
    }, 1000)
  }
}

const timerDisplay = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const timerUrgent = computed(() => test.value?.timeLimitMinutes && timeRemaining.value <= 60)

function selectOption(questionId, optionId, questionType) {
  if (questionType === 'MULTIPLE_CHOICE') {
    if (!answers.value[questionId]) answers.value[questionId] = []
    const idx = answers.value[questionId].indexOf(optionId)
    if (idx >= 0) answers.value[questionId].splice(idx, 1)
    else answers.value[questionId].push(optionId)
  } else {
    answers.value[questionId] = [optionId]
  }
}

function isSelected(questionId, optionId) {
  return answers.value[questionId]?.includes(optionId) || false
}

function goNext() {
  if (currentIdx.value < totalQuestions.value - 1) currentIdx.value++
}

function goPrev() {
  if (currentIdx.value > 0) currentIdx.value--
}

function goToQuestion(idx) {
  if (idx >= 0 && idx < totalQuestions.value) currentIdx.value = idx
}

function requestSubmit() {
  showConfirm.value = true
}

async function handleSubmit() {
  showConfirm.value = false
  if (submitting.value || submitted.value) return
  submitting.value = true
  error.value = ''
  if (timerInterval.value) clearInterval(timerInterval.value)
  try {
    const answerList = Object.entries(answers.value).map(([questionId, selectedOptionIds]) => ({
      questionId: Number(questionId),
      selectedOptionIds,
    }))
    result.value = await courseStore.submitTest(test.value.id, answerList)
    submitted.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка при отправке'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page-container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error && !test" class="alert alert-danger">{{ error }}</div>

    <!-- Start screen -->
    <template v-else-if="test && !started && !submitted">
      <div class="card p-5 text-center" style="max-width: 600px; margin: 2rem auto;">
        <i class="bi bi-clipboard-check display-1 text-primary mb-3"></i>
        <h3 class="fw-bold mb-2">{{ test.title }}</h3>
        <span class="badge bg-primary mb-3">{{ test.testType === 'COURSE_EXAM' ? 'Экзамен' : 'Тест' }}</span>
        <div class="row g-3 my-3 text-start">
          <div class="col-sm-6">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-list-check text-primary"></i>
              <span><strong>{{ totalQuestions }}</strong> вопросов</span>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-percent text-primary"></i>
              <span>Проходной балл: <strong>{{ test.passingScore }}%</strong></span>
            </div>
          </div>
          <div class="col-sm-6" v-if="test.timeLimitMinutes">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-clock text-primary"></i>
              <span>Время: <strong>{{ test.timeLimitMinutes }} мин</strong></span>
            </div>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
        <div class="d-flex gap-2 justify-content-center mt-3">
          <button class="btn btn-primary btn-lg px-4" @click="startTest">
            <i class="bi bi-play-fill me-1"></i>Начать тест
          </button>
          <button class="btn btn-outline-secondary btn-lg" @click="router.back()">Отмена</button>
        </div>
      </div>
    </template>

    <!-- Results -->
    <template v-else-if="result">
      <div class="card p-5 text-center" style="max-width: 600px; margin: 2rem auto;">
        <i class="display-1 mb-3" :class="result.passed ? 'text-success bi bi-check-circle-fill' : 'text-danger bi bi-x-circle-fill'"></i>
        <h3 class="fw-bold" :class="result.passed ? 'text-success' : 'text-danger'">
          {{ result.passed ? 'Тест пройден!' : 'Тест не пройден' }}
        </h3>
        <p class="text-muted mb-4">{{ result.testTitle }}</p>
        <div class="row g-3 justify-content-center mb-4">
          <div class="col-md-3">
            <div class="p-3 rounded bg-light">
              <div class="fs-3 fw-bold">{{ result.scorePercent.toFixed(1) }}%</div>
              <small class="text-muted">Набрано</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded bg-light">
              <div class="fs-3 fw-bold">{{ result.correctAnswers }}/{{ result.totalQuestions }}</div>
              <small class="text-muted">Правильных ответов</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="p-3 rounded bg-light">
              <div class="fs-3 fw-bold">{{ result.earnedPoints }}/{{ result.totalPoints }}</div>
              <small class="text-muted">Баллов</small>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-center">
          <RouterLink v-if="courseId" :to="`/course/${courseId}`" class="btn btn-primary">К курсу</RouterLink>
          <RouterLink to="/dashboard" class="btn btn-outline-primary">К дашборду</RouterLink>
        </div>
      </div>
    </template>

    <!-- Taking the test -->
    <template v-else-if="test && started && !submitted">
      <div class="test-layout">
        <div class="test-main">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <RouterLink v-if="courseId" :to="`/course/${courseId}`" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i>К курсу
            </RouterLink>
            <div v-else></div>
            <div v-if="test.timeLimitMinutes"
              class="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              :class="timerUrgent ? 'bg-danger text-white' : 'bg-light'">
              <i class="bi bi-clock"></i>
              <span class="fw-bold fs-5" style="font-variant-numeric: tabular-nums;">{{ timerDisplay }}</span>
            </div>
          </div>

          <div v-if="timerExpired" class="alert alert-warning text-center">
            <i class="bi bi-exclamation-triangle me-1"></i>Время вышло! Тест отправляется автоматически...
          </div>

          <div v-if="currentQuestion" class="card p-4 mb-3">
            <div class="d-flex align-items-start mb-3">
              <span class="badge bg-primary bg-opacity-10 text-primary me-3 fs-6">{{ currentIdx + 1 }}</span>
              <div class="flex-grow-1">
                <p class="fw-semibold mb-1 fs-5">{{ currentQuestion.questionText }}</p>
                <small class="text-muted">
                  {{ currentQuestion.questionType === 'MULTIPLE_CHOICE' ? 'Выберите один или несколько вариантов' : 'Выберите один вариант' }}
                  &middot; {{ currentQuestion.points }} {{ currentQuestion.points === 1 ? 'балл' : currentQuestion.points < 5 ? 'балла' : 'баллов' }}
                </small>
              </div>
            </div>
            <div class="d-flex flex-column gap-2 ms-5">
              <label v-for="opt in currentQuestion.options" :key="opt.id"
                class="d-flex align-items-center p-2 rounded border"
                :class="{ 'border-primary bg-primary bg-opacity-10': isSelected(currentQuestion.id, opt.id) }"
                style="cursor: pointer;">
                <input type="radio" v-if="currentQuestion.questionType === 'SINGLE_CHOICE'"
                  :name="`q-${currentQuestion.id}`" :value="opt.id"
                  :checked="isSelected(currentQuestion.id, opt.id)"
                  @change="selectOption(currentQuestion.id, opt.id, currentQuestion.questionType)"
                  class="form-check-input me-3">
                <input type="checkbox" v-else
                  :checked="isSelected(currentQuestion.id, opt.id)"
                  @change="selectOption(currentQuestion.id, opt.id, currentQuestion.questionType)"
                  class="form-check-input me-3">
                <span>{{ opt.optionText }}</span>
              </label>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-outline-secondary" @click="goPrev" :disabled="currentIdx === 0">
              <i class="bi bi-arrow-left me-1"></i>Назад
            </button>
            <button v-if="!isLastQuestion" class="btn btn-primary" @click="goNext">
              Далее <i class="bi bi-arrow-right ms-1"></i>
            </button>
            <button v-else class="btn btn-success" @click="requestSubmit" :disabled="totalAnswered === 0">
              <i class="bi bi-check-circle me-1"></i>Отправить тест
            </button>
          </div>
        </div>

        <aside class="test-sidebar">
          <div class="card p-3 sticky-sidebar">
            <h6 class="fw-bold mb-3 text-center">Прогресс</h6>
            <div class="progress mb-3" style="height: 6px;">
              <div class="progress-bar bg-primary" :style="{ width: (totalAnswered / totalQuestions * 100) + '%' }"></div>
            </div>
            <p class="text-center text-muted small mb-3">Отвечено: {{ totalAnswered }} / {{ totalQuestions }}</p>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <button v-for="(q, idx) in test.questions" :key="q.id"
                class="btn btn-sm question-dot"
                :class="{
                  'btn-primary': idx === currentIdx,
                  'btn-success': idx !== currentIdx && questionStatus(idx) === 'answered',
                  'btn-outline-secondary': idx !== currentIdx && questionStatus(idx) === 'unanswered'
                }"
                @click="goToQuestion(idx)">
                {{ idx + 1 }}
              </button>
            </div>
            <hr class="my-3">
            <div v-if="test.timeLimitMinutes" class="d-flex align-items-center justify-content-center gap-2 mb-3"
              :class="timerUrgent ? 'text-danger' : 'text-muted'">
              <i class="bi bi-clock"></i>
              <span class="fw-bold" style="font-variant-numeric: tabular-nums;">{{ timerDisplay }}</span>
            </div>
            <button v-if="isLastQuestion" class="btn btn-success w-100" @click="requestSubmit" :disabled="totalAnswered === 0">
              <i class="bi bi-check-circle me-1"></i>Отправить тест
            </button>
          </div>
        </aside>
      </div>
    </template>

    <!-- Confirm modal -->
    <div v-if="showConfirm" class="modal-backdrop-custom" @click.self="showConfirm = false">
      <div class="modal-custom card p-4 text-center">
        <i class="bi bi-question-circle display-4 text-primary mb-3"></i>
        <h5 class="fw-bold mb-2">Отправить тест?</h5>
        <p class="text-muted mb-1">Вы ответили на {{ totalAnswered }} из {{ totalQuestions }} вопросов.</p>
        <p v-if="totalAnswered < totalQuestions" class="text-warning small mb-3">
          <i class="bi bi-exclamation-triangle me-1"></i>Не на все вопросы даны ответы
        </p>
        <div class="d-flex gap-2 justify-content-center mt-3">
          <button class="btn btn-success px-4" @click="handleSubmit" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
            Да, отправить
          </button>
          <button class="btn btn-outline-secondary" @click="showConfirm = false">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-layout {
  display: flex;
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
}
.test-main {
  flex: 1;
  min-width: 0;
}
.test-sidebar {
  width: 220px;
  min-width: 220px;
}
.sticky-sidebar {
  position: sticky;
  top: 80px;
}
.question-dot {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-custom {
  width: 420px;
  max-width: 90vw;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
@media (max-width: 768px) {
  .test-layout { flex-direction: column; }
  .test-sidebar { width: 100%; min-width: 100%; }
  .sticky-sidebar { position: static; }
}
</style>
