<script setup>
import { ref, onMounted } from 'vue'

const links = [
  { icon: 'bi-collection', title: 'Каталог курсов', to: '/', desc: 'Найти новый курс' },
  { icon: 'bi-speedometer2', title: 'Дашборд', to: '/dashboard', desc: 'Мой прогресс' },
  { icon: 'bi-award', title: 'Сертификаты', to: '/certificates', desc: 'Достижения' },
  { icon: 'bi-person', title: 'Профиль', to: '/profile', desc: 'Настройки аккаунта' },
]

const floatingDots = ref([])

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    floatingDots.value.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
      opacity: Math.random() * 0.3 + 0.05,
    })
  }
})
</script>

<template>
  <div class="not-found-page">
    <div class="floating-bg">
      <div v-for="dot in floatingDots" :key="dot.id" class="floating-dot"
        :style="{
          left: dot.x + '%',
          top: dot.y + '%',
          width: dot.size + 'px',
          height: dot.size + 'px',
          animationDelay: dot.delay + 's',
          animationDuration: dot.duration + 's',
          opacity: dot.opacity,
        }">
      </div>
    </div>

    <div class="content-wrapper">
      <div class="illustration mb-4">
        <div class="glow"></div>
        <div class="error-code">
          <span class="digit">4</span>
          <div class="ghost">
            <div class="ghost-body">
              <div class="ghost-eyes">
                <div class="eye"></div>
                <div class="eye"></div>
              </div>
              <div class="ghost-mouth"></div>
            </div>
            <div class="ghost-tail">
              <span></span><span></span><span></span>
            </div>
          </div>
          <span class="digit">4</span>
        </div>
      </div>

      <h1 class="title">Страница потерялась</h1>
      <p class="subtitle">Похоже, эта страница ушла на прогулку и забыла вернуться.
        Мы уже отправили её на поиски, а пока — вот что вы можете сделать:</p>

      <div class="action-grid">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="action-card">
          <div class="action-icon">
            <i :class="`bi ${link.icon}`"></i>
          </div>
          <div class="action-text">
            <div class="action-title">{{ link.title }}</div>
            <div class="action-desc">{{ link.desc }}</div>
          </div>
          <i class="bi bi-arrow-right action-arrow"></i>
        </RouterLink>
      </div>

      <div class="search-box mt-4">
        <RouterLink to="/" class="btn btn-primary btn-lg px-5">
          <i class="bi bi-house-door me-2"></i>Вернуться домой
        </RouterLink>
      </div>

      <div class="fun-fact mt-5">
        <div class="fact-card">
          <i class="bi bi-lightbulb text-warning me-2"></i>
          <span>Знаете? Ошибка 404 названа в честь комнаты 404 в CERN, где хранились данные.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.floating-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--primary);
  animation: float linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.2); }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 580px;
}

.illustration {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glow {
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
}

.error-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.digit {
  font-size: 7rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  text-shadow: none;
}

.ghost {
  position: relative;
  width: 100px;
  height: 120px;
  animation: ghostFloat 3s ease-in-out infinite;
}

@keyframes ghostFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.ghost-body {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 90px;
  background: linear-gradient(135deg, #e0d4ff 0%, #c7b8ff 100%);
  border-radius: 40px 40px 0 0;
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.2);
}

.ghost-eyes {
  display: flex;
  gap: 14px;
  justify-content: center;
  padding-top: 30px;
}

.eye {
  width: 12px;
  height: 14px;
  background: var(--primary);
  border-radius: 50%;
  animation: blink 4s ease-in-out infinite;
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

.ghost-mouth {
  width: 14px;
  height: 8px;
  border: 2px solid var(--primary);
  border-top: none;
  border-radius: 0 0 10px 10px;
  margin: 8px auto 0;
}

.ghost-tail {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0;
}

.ghost-tail span {
  width: 27px;
  height: 30px;
  background: linear-gradient(135deg, #e0d4ff 0%, #c7b8ff 100%);
  border-radius: 0 0 50% 50%;
  display: block;
}

.ghost-tail span:nth-child(2) {
  margin: 0 -4px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.action-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.1);
  transform: translateX(4px);
}

.action-card:hover .action-icon {
  background: linear-gradient(135deg, var(--primary), #8b7dff);
  color: white;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

.action-card:hover .action-arrow {
  color: var(--primary);
  transform: translateX(4px);
}

.action-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.action-text {
  flex: 1;
  text-align: left;
}

.action-title {
  font-weight: 700;
  font-size: 0.95rem;
}

.action-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.action-arrow {
  color: var(--text-muted);
  transition: all 0.25s ease;
}

.search-box {
  margin-top: 1.5rem;
}

.fact-card {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 1.25rem;
  background: var(--warning-light);
  border-radius: 50px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 576px) {
  .digit { font-size: 4.5rem; }
  .ghost { width: 70px; height: 90px; }
  .ghost-body { width: 56px; height: 64px; border-radius: 28px 28px 0 0; }
  .ghost-eyes { padding-top: 18px; gap: 10px; }
  .eye { width: 9px; height: 10px; }
  .ghost-tail span { width: 19px; height: 22px; }
  .title { font-size: 1.5rem; }
  .subtitle { font-size: 0.95rem; }
}
</style>
