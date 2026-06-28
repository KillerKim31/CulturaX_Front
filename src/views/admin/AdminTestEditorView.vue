<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const testId = route.params.id

const test = ref(null)
const questions = ref([])
const loading = ref(true)
const saving = ref(false)
const msg = ref({ type: '', text: '' })

const showQuestionForm = ref(false)
const editingQuestion = ref(null)

const questionForm = ref({
  questionText: '',
  questionType: 'SINGLE_CHOICE',
  points: 10,
  orderIndex: 1,
  correctAnswer: [],
  options: [
    { optionText: '', isCorrect: false, orderIndex: 1 },
    { optionText: '', isCorrect: false, orderIndex: 2 },
  ],
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [testRes, questionsRes] = await Promise.all([
      api.get(`/tests/${testId}`),
      api.get(`/admin/tests/${testId}/questions`),
    ])
    test.value = testRes.data
    questions.value = questionsRes.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function addOption() {
  questionForm.value.options.push({
    optionText: '',
    isCorrect: false,
    orderIndex: questionForm.value.options.length + 1,
  })
}

function removeOption(idx) {
  if (questionForm.value.options.length <= 2) return
  questionForm.value.options.splice(idx, 1)
}

function setCorrectAnswer() {
  if (questionForm.value.questionType === 'SINGLE_CHOICE') {
    questionForm.value.correctAnswer = questionForm.value.options
      .filter(o => o.isCorrect)
      .map((_, i) => {
        const idx = questionForm.value.options.findIndex(o => o.isCorrect)
        return idx >= 0 ? idx : i
      })
  }
}

function onOptionCorrectChange() {
  if (questionForm.value.questionType === 'SINGLE_CHOICE') {
    const first = questionForm.value.options.find(o => o.isCorrect)
    questionForm.value.options.forEach(o => {
      if (o !== first) o.isCorrect = false
    })
  }
}

function resetForm() {
  questionForm.value = {
    questionText: '',
    questionType: 'SINGLE_CHOICE',
    points: 10,
    orderIndex: questions.value.length + 1,
    correctAnswer: [],
    options: [
      { optionText: '', isCorrect: false, orderIndex: 1 },
      { optionText: '', isCorrect: false, orderIndex: 2 },
    ],
  }
}

function startEditQuestion(q) {
  editingQuestion.value = q.id
  questionForm.value = {
    questionText: q.questionText,
    questionType: q.questionType,
    points: q.points,
    orderIndex: q.orderIndex,
    correctAnswer: q.correctAnswer || [],
    options: q.options.map(o => ({
      id: o.id,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
      orderIndex: o.orderIndex,
    })),
  }
  showQuestionForm.value = true
}

async function saveQuestion() {
  saving.value = true
  msg.value = { type: '', text: '' }

  const correctOptionIndices = questionForm.value.options
    .map((o, i) => ({ idx: i, correct: o.isCorrect }))
    .filter(o => o.correct)
    .map(o => o.idx)

  const payload = {
    questionText: questionForm.value.questionText,
    questionType: questionForm.value.questionType,
    points: questionForm.value.points,
    orderIndex: questionForm.value.orderIndex,
    correctAnswer: correctOptionIndices,
    options: questionForm.value.options.map((o, i) => ({
      id: o.id || null,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
      orderIndex: i + 1,
    })),
  }

  try {
    if (editingQuestion.value) {
      const { data } = await api.put(`/admin/questions/${editingQuestion.value}`, payload)
      const idx = questions.value.findIndex(q => q.id === editingQuestion.value)
      if (idx >= 0) questions.value[idx] = data
      msg.value = { type: 'success', text: 'Вопрос обновлён' }
    } else {
      const { data } = await api.post(`/admin/tests/${testId}/questions`, payload)
      questions.value.push(data)
      msg.value = { type: 'success', text: 'Вопрос добавлен' }
    }
    showQuestionForm.value = false
    editingQuestion.value = null
    resetForm()
  } catch (e) {
    msg.value = { type: 'danger', text: e.response?.data?.message || 'Ошибка сохранения вопроса' }
  } finally {
    saving.value = false
  }
}

async function deleteQuestion(q) {
  if (!confirm(`Удалить вопрос "${q.questionText}"?`)) return
  try {
    await api.delete(`/admin/questions/${q.id}`)
    questions.value = questions.value.filter(item => item.id !== q.id)
    msg.value = { type: 'success', text: 'Вопрос удалён' }
  } catch (e) {
    msg.value = { type: 'danger', text: 'Ошибка удаления' }
  }
}

function questionTypeLabel(type) {
  const labels = {
    SINGLE_CHOICE: 'Одиночный выбор',
    MULTIPLE_CHOICE: 'Множественный выбор',
    MATCHING: 'Сопоставление',
  }
  return labels[type] || type
}
</script>

<template>
  <div class="page-container py-4">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="page-title">Редактирование теста</h1>
        <p class="text-muted mb-0" v-if="test">{{ test.title }}</p>
      </div>
      <RouterLink v-if="test?.courseId" :to="`/admin/course/${test.courseId}/tests`" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-1"></i>Назад к тестам
      </RouterLink>
      <RouterLink v-else to="/admin/courses" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left me-1"></i>Назад к курсам
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="test">
      <div v-if="msg.text" :class="`alert alert-${msg.type} py-2`">{{ msg.text }}</div>

      <div class="card p-3 mb-4">
        <div class="d-flex gap-4 text-muted small">
          <span><strong>Тип:</strong> {{ test.testType }}</span>
          <span><strong>Проходной:</strong> {{ test.passingScore }}%</span>
          <span v-if="test.timeLimitMinutes"><strong>Время:</strong> {{ test.timeLimitMinutes }} мин</span>
          <span><strong>Вопросов:</strong> {{ questions.length }}</span>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0">Вопросы</h5>
        <button class="btn btn-primary btn-sm" @click="showQuestionForm = !showQuestionForm; editingQuestion = null; resetForm()">
          <i class="bi bi-plus-circle me-1"></i>Добавить вопрос
        </button>
      </div>

      <div v-if="showQuestionForm" class="card p-4 mb-4">
        <h6 class="fw-bold mb-3">{{ editingQuestion ? 'Редактирование вопроса' : 'Новый вопрос' }}</h6>
        <form @submit.prevent="saveQuestion">
          <div class="mb-3">
            <label class="form-label">Текст вопроса</label>
            <textarea v-model="questionForm.questionText" class="form-control" rows="2" required></textarea>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label">Тип вопроса</label>
              <select v-model="questionForm.questionType" class="form-select">
                <option value="SINGLE_CHOICE">Одиночный выбор</option>
                <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                <option value="MATCHING">Сопоставление</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Баллы</label>
              <input v-model.number="questionForm.points" type="number" class="form-control" min="1" required>
            </div>
            <div class="col-md-4">
              <label class="form-label">Порядок</label>
              <input v-model.number="questionForm.orderIndex" type="number" class="form-control" min="1">
            </div>
          </div>

          <label class="form-label fw-semibold">Варианты ответа</label>
          <small class="text-muted d-block mb-2">
            {{ questionForm.questionType === 'SINGLE_CHOICE' ? 'Отметьте правильный вариант' : 'Отметьте все правильные варианты' }}
          </small>

          <div v-for="(opt, idx) in questionForm.options" :key="idx" class="d-flex align-items-center gap-2 mb-2">
            <input type="checkbox" class="form-check-input" v-model="opt.isCorrect"
              @change="onOptionCorrectChange" :disabled="questionForm.questionType === 'MATCHING'">
            <input v-model="opt.optionText" class="form-control form-control-sm" :placeholder="`Вариант ${idx + 1}`" required>
            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeOption(idx)"
              :disabled="questionForm.options.length <= 2">
              <i class="bi bi-x"></i>
            </button>
          </div>

          <button type="button" class="btn btn-sm btn-outline-primary mt-2" @click="addOption">
            <i class="bi bi-plus me-1"></i>Добавить вариант
          </button>

          <div class="mt-3 d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Сохранить
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="showQuestionForm = false; editingQuestion = null">Отмена</button>
          </div>
        </form>
      </div>

      <div v-if="questions.length" class="d-flex flex-column gap-3">
        <div v-for="(q, idx) in questions" :key="q.id" class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-start">
                <span class="badge bg-primary bg-opacity-10 text-primary me-2">{{ idx + 1 }}</span>
                <div>
                  <p class="fw-semibold mb-1">{{ q.questionText }}</p>
                  <div class="d-flex gap-2 text-muted small">
                    <span class="badge bg-secondary">{{ questionTypeLabel(q.questionType) }}</span>
                    <span>{{ q.points }} баллов</span>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-primary" @click="startEditQuestion(q)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(q)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <div class="ms-4 mt-2">
              <div v-for="(opt, oIdx) in q.options" :key="opt.id"
                class="d-flex align-items-center gap-2 py-1"
                :class="opt.isCorrect ? 'text-success fw-semibold' : 'text-muted'">
                <i :class="opt.isCorrect ? 'bi bi-check-circle-fill' : 'bi bi-circle'" class="small"></i>
                <small>{{ opt.optionText }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="bi bi-clipboard-check d-block"></i>
        <p>Вопросов пока нет</p>
      </div>
    </template>
  </div>
</template>
