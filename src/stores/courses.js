import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCourseStore = defineStore('courses', () => {
  const courses = ref([])
  const currentCourse = ref(null)
  const lessons = ref([])
  const loading = ref(false)

  async function fetchCourses() {
    loading.value = true
    try {
      const { data } = await api.get('/courses')
      courses.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchCourseDetail(courseId) {
    loading.value = true
    try {
      const { data } = await api.get(`/courses/${courseId}`)
      currentCourse.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchLessons(courseId) {
    const { data } = await api.get(`/courses/${courseId}/lessons`)
    lessons.value = data
    return data
  }

  async function enrollCourse(courseId) {
    await api.post(`/user/enroll/${courseId}`)
  }

  async function unenrollCourse(courseId) {
    await api.delete(`/user/enroll/${courseId}`)
  }

  async function updateProgress(courseId, progress) {
    await api.put(`/user/progress/course/${courseId}`, { progress })
  }

  async function getEnrolledCourses() {
    const { data } = await api.get('/user/enrolled-courses')
    return data
  }

  async function getUserProgress() {
    const { data } = await api.get('/user/progress')
    return data
  }

  async function getCertificates() {
    const { data } = await api.get('/user/certificates')
    return data
  }

  async function getTest(testId) {
    const { data } = await api.get(`/tests/${testId}`)
    return data
  }

  async function submitTest(testId, answers) {
    const { data } = await api.post(`/tests/${testId}/submit`, { answers })
    return data
  }

  return {
    courses, currentCourse, lessons, loading,
    fetchCourses, fetchCourseDetail, fetchLessons,
    enrollCourse, unenrollCourse, updateProgress,
    getEnrolledCourses, getUserProgress, getCertificates,
    getTest, submitTest,
  }
})
