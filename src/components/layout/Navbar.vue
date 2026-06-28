<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const navbarCollapse = ref(null)

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top" style="background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border-light);">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold d-flex align-items-center" to="/" style="color: var(--primary);">
        <div class="rounded-lg d-flex align-items-center justify-content-center me-2"
          style="width: 34px; height: 34px; background: linear-gradient(135deg, #6c63ff, #a78bfa); border-radius: 10px;">
          <i class="bi bi-book-half text-white"></i>
        </div>
        CulturaX
      </RouterLink>

      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav" ref="navbarCollapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" style="color: var(--text-secondary);">
              <i class="bi bi-collection me-1"></i>Каталог курсов
            </RouterLink>
          </li>
          <template v-if="auth.isAuthenticated">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/dashboard" style="color: var(--text-secondary);">
                <i class="bi bi-speedometer2 me-1"></i>Дашборд
              </RouterLink>
            </li>

            <li class="nav-item" v-if="auth.isAdmin">
              <RouterLink class="nav-link" to="/admin" style="color: var(--text-secondary);">
                <i class="bi bi-shield-lock me-1"></i>Админ
              </RouterLink>
            </li>
          </template>
        </ul>

        <ul class="navbar-nav">
          <template v-if="auth.isAuthenticated">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                data-bs-toggle="dropdown" style="color: var(--text-primary);">
                <div class="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style="width: 32px; height: 32px; background: var(--primary-light); color: var(--primary); font-size: 0.85rem;">
                  <i class="bi bi-person-fill"></i>
                </div>
                <span class="fw-semibold">{{ auth.userName }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <RouterLink class="dropdown-item" to="/profile">
                    <i class="bi bi-person me-2"></i>Профиль
                  </RouterLink>
                </li>
                <li>
                  <RouterLink class="dropdown-item" to="/certificates">
                    <i class="bi bi-award me-2"></i>Сертификаты
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" style="margin: 0.35rem 0;"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Выйти
                  </a>
                </li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item d-flex align-items-center">
              <RouterLink class="nav-link fw-semibold" to="/login" style="color: var(--text-secondary);">Войти</RouterLink>
            </li>
            <li class="nav-item d-flex align-items-center">
              <RouterLink class="btn btn-primary btn-sm ms-2" to="/register">Регистрация</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
