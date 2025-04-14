import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue.vue')
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('@/views/student/StudentListView.vue'),
      meta: { requiresAuth: true }
    },
  ]
})

// Guarda de navegação para autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') // Ajuste conforme sua lógica de autenticação

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
