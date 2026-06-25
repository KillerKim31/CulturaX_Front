import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/CourseCatalogView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/user/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/my-courses',
    name: 'my-courses',
    component: () => import('@/views/user/MyCoursesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/course/:id',
    name: 'course-detail',
    component: () => import('@/views/user/CourseDetailView.vue'),
  },
  {
    path: '/course/:courseId/lesson/:lessonId',
    name: 'lesson',
    component: () => import('@/views/user/LessonView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/test/:id',
    name: 'test',
    component: () => import('@/views/user/TestView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/certificates',
    name: 'certificates',
    component: () => import('@/views/user/CertificatesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/AdminUsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/courses',
    name: 'admin-courses',
    component: () => import('@/views/admin/AdminCoursesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/course/:id/edit',
    name: 'admin-course-edit',
    component: () => import('@/views/admin/AdminCourseEditorView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: 'dashboard' })
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: 'catalog' })
  } else {
    next()
  }
})

export default router
