import { defineStore } from 'pinia';
import { User, RegisterData } from '../types/User';
import { useAuthStore } from './authStore';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    isLoading: false,
    error: null as string | null
  }),
  
  actions: {
    // Helper to save users to localStorage
    saveToLocalStorage() {
      localStorage.setItem('users', JSON.stringify(this.users));
    },
    
    // Initialize users from localStorage if available
    initializeUsers() {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          this.users = parsed.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }));
        } catch (err) {
          console.error('Failed to parse stored users:', err);
          this.users = [];
        }
      }
    },
    
    async registerUser(userData: RegisterData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Check if email already exists
        const emailExists = this.users.some(user => user.email === userData.email);
        if (emailExists) {
          throw new Error('Email already registered');
        }
        
        // Check if username already exists
        const usernameExists = this.users.some(user => user.username === userData.username);
        if (usernameExists) {
          throw new Error('Username already taken');
        }
        
        // Create new user
        const newUser: User = {
          id: (this.users.length + 1).toString(),
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add user to users array
        this.users.push(newUser);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Log in the newly registered user
        const authStore = useAuthStore();
        await authStore.login({
          email: userData.email,
          password: userData.password
        });
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Registration failed';
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    getUserByEmail(email: string): User | undefined {
      return this.users.find(user => user.email === email);
    },
    
    getUserById(id: string): User | undefined {
      return this.users.find(user => user.id === id);
    }
  }
}); 