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
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container">
      <RouterLink class="navbar-brand fw-bold" to="/">
        <i class="bi bi-book-half me-2"></i>CulturaX
      </RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav" ref="navbarCollapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">
              <i class="bi bi-collection me-1"></i>Каталог курсов
            </RouterLink>
          </li>
          <template v-if="auth.isAuthenticated">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/dashboard">
                <i class="bi bi-speedometer2 me-1"></i>Дашборд
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/my-courses">
                <i class="bi bi-book me-1"></i>Мои курсы
              </RouterLink>
            </li>
            <li class="nav-item" v-if="auth.isAdmin">
              <RouterLink class="nav-link" to="/admin">
                <i class="bi bi-shield-lock me-1"></i>Админ
              </RouterLink>
            </li>
          </template>
        </ul>

        <ul class="navbar-nav">
          <template v-if="auth.isAuthenticated">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-2"></i>{{ auth.userName }}
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
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Выйти
                  </a>
                </li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/login">Войти</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="btn btn-outline-light btn-sm ms-2 mt-1" to="/register">Регистрация</RouterLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
