<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from '@/stores/courses'

const route = useRoute()
const courseStore = useCourseStore()

const test = ref(null)
const loading = ref(true)
const answers = ref({})
const submitted = ref(false)
const result = ref(null)
const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    test.value = await courseStore.getTest(route.params.id)
  } catch (e) {
    error.value = 'Не удалось загрузить тест'
  } finally {
    loading.value = false
  }
})

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

async function handleSubmit() {
  submitting.value = true
  error.value = ''
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

const totalAnswered = computed(() => Object.keys(answers.value).filter(k => answers.value[k]?.length > 0).length)
</script>

<template>
  <div class="page-container py-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error && !test" class="alert alert-danger">{{ error }}</div>

    <template v-else-if="test && !submitted">
      <div class="card p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4 class="fw-bold mb-1">{{ test.title }}</h4>
            <div class="d-flex gap-3 text-muted small">
              <span><i class="bi bi-list-check me-1"></i>{{ test.questions.length }} вопросов</span>
              <span v-if="test.timeLimitMinutes"><i class="bi bi-clock me-1"></i>{{ test.timeLimitMinutes }} мин</span>
              <span>Проходной: {{ test.passingScore }}%</span>
            </div>
          </div>
          <span class="badge bg-primary">{{ test.testType }}</span>
        </div>
      </div>

      <div v-for="(q, idx) in test.questions" :key="q.id" class="card p-4 mb-3">
        <div class="d-flex align-items-start mb-3">
          <span class="badge bg-primary bg-opacity-10 text-primary me-3">{{ idx + 1 }}</span>
          <div>
            <p class="fw-semibold mb-1">{{ q.questionText }}</p>
            <small class="text-muted">
              {{ q.questionType === 'MULTIPLE_CHOICE' ? 'Выберите один или несколько вариантов' : 'Выберите один вариант' }}
              · {{ q.points }} баллов
            </small>
          </div>
        </div>
        <div class="d-flex flex-column gap-2 ms-5">
          <label v-for="opt in q.options" :key="opt.id"
            class="d-flex align-items-center p-2 rounded border cursor-pointer"
            :class="{ 'border-primary bg-primary bg-opacity-10': isSelected(q.id, opt.id) }"
            style="cursor: pointer;">
            <input type="radio" v-if="q.questionType === 'SINGLE_CHOICE'"
              :name="`q-${q.id}`" :value="opt.id"
              :checked="isSelected(q.id, opt.id)"
              @change="selectOption(q.id, opt.id, q.questionType)"
              class="form-check-input me-3">
            <input type="checkbox" v-else
              :checked="isSelected(q.id, opt.id)"
              @change="selectOption(q.id, opt.id, q.questionType)"
              class="form-check-input me-3">
            <span>{{ opt.optionText }}</span>
          </label>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4 p-3 card">
        <span class="text-muted">Отвечено: {{ totalAnswered }}/{{ test.questions.length }}</span>
        <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting || totalAnswered === 0">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          Отправить тест
        </button>
      </div>
    </template>

    <template v-else-if="result">
      <div class="card p-4 text-center">
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

        <RouterLink to="/my-courses" class="btn btn-primary">К моим курсам</RouterLink>
      </div>
    </template>
  </div>
</template>
