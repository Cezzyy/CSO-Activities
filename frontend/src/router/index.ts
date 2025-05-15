import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        requiresAuth: false,
        title: 'Login'
      }
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Dashboard'
      }
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      return { name: 'login' }
    }
  }

  if (to.name === 'login') {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      return { name: 'home' }
    }
  }

  document.title = `${to.meta.title} | Management System`
})

export default router