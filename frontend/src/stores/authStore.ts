import { defineStore } from 'pinia';
import { User, UserCredentials } from '../types/User';
import router from '../router';
import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    async login(credentials: UserCredentials) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const userStore = useUserStore();
        const foundUser = userStore.getUserByEmail(credentials.email);
        
        if (!foundUser) {
          throw new Error('User not found');
        }
        
        this.user = foundUser;
        this.token = 'token-' + Math.random().toString(36).substring(2);
        localStorage.setItem('token', this.token);
        
        router.push('/home');
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Invalid email or password';
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      router.push('/');
    },
    
    async checkAuth() {
      if (!this.token) return;
      
      this.isLoading = true;
      
      try {
        if (this.token && !this.user) {
          const userStore = useUserStore();
          if (userStore.users.length === 0) {
            throw new Error('No users found');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        this.error = 'Session expired';
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
      } finally {
        this.isLoading = false;
      }
    }
  }
}); 