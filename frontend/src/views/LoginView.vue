<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import type { UserCredentials, RegisterData } from '../types/User';

// Store references
const authStore = useAuthStore();
const userStore = useUserStore();

// UI state
const isLogin = ref(true);
const showPassword = ref(false);

// Form data
const loginForm = reactive<UserCredentials>({
  email: '',
  password: ''
});

const registerForm = reactive<RegisterData>({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: ''
});

// Error interfaces
interface LoginErrors {
  email: string;
  password: string;
  form: string;
}

interface RegisterErrors {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  form: string;
}

// Form validation
const loginErrors = reactive<LoginErrors>({
  email: '',
  password: '',
  form: ''
});

const registerErrors = reactive<RegisterErrors>({
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  form: ''
});

// Computed properties
const isLoginFormValid = computed(() => {
  return !!loginForm.email && !!loginForm.password && !loginErrors.email && !loginErrors.password;
});

const isRegisterFormValid = computed(() => {
  return (
    !!registerForm.email && 
    !!registerForm.username && 
    !!registerForm.password && 
    !registerErrors.email && 
    !registerErrors.username && 
    !registerErrors.password
  );
});

const isAuthLoading = computed(() => authStore.isLoading);
const isUserLoading = computed(() => userStore.isLoading);
const isLoading = computed(() => isAuthLoading.value || isUserLoading.value);

// Methods
const toggleForm = () => {
  isLogin.value = !isLogin.value;
  // Reset errors when switching forms
  resetErrors();
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const resetErrors = () => {
  // Reset login errors
  loginErrors.email = '';
  loginErrors.password = '';
  loginErrors.form = '';
  
  // Reset register errors
  registerErrors.email = '';
  registerErrors.username = '';
  registerErrors.password = '';
  registerErrors.firstName = '';
  registerErrors.lastName = '';
  registerErrors.form = '';
};

// HTML sanitization function
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/<[^>]*>?/gm, '');
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6;
};

// Real-time validation for login email
const validateLoginEmail = () => {
  loginErrors.email = '';
  
  const sanitizedEmail = sanitizeInput(loginForm.email);
  loginForm.email = sanitizedEmail;
  
  if (!sanitizedEmail) {
    loginErrors.email = 'Email is required';
  } else if (!isValidEmail(sanitizedEmail)) {
    loginErrors.email = 'Please enter a valid email address';
  }
};

// Real-time validation for login password
const validateLoginPassword = () => {
  loginErrors.password = '';
  
  const sanitizedPassword = sanitizeInput(loginForm.password);
  loginForm.password = sanitizedPassword;
  
  if (!sanitizedPassword) {
    loginErrors.password = 'Password is required';
  }
};

// Real-time validation for register email
const validateRegisterEmail = () => {
  registerErrors.email = '';
  
  const sanitizedEmail = sanitizeInput(registerForm.email);
  registerForm.email = sanitizedEmail;
  
  if (!sanitizedEmail) {
    registerErrors.email = 'Email is required';
  } else if (!isValidEmail(sanitizedEmail)) {
    registerErrors.email = 'Please enter a valid email address';
  }
};

// Real-time validation for register username
const validateRegisterUsername = () => {
  registerErrors.username = '';
  
  const sanitizedUsername = sanitizeInput(registerForm.username);
  registerForm.username = sanitizedUsername;
  
  if (!sanitizedUsername) {
    registerErrors.username = 'Username is required';
  } else if (sanitizedUsername.length < 3) {
    registerErrors.username = 'Username must be at least 3 characters';
  } else if (sanitizedUsername.length > 20) {
    registerErrors.username = 'Username must be less than 20 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
    registerErrors.username = 'Username can only contain letters, numbers, and underscores';
  }
};

// Real-time validation for register password
const validateRegisterPassword = () => {
  registerErrors.password = '';
  
  const sanitizedPassword = sanitizeInput(registerForm.password);
  registerForm.password = sanitizedPassword;
  
  if (!sanitizedPassword) {
    registerErrors.password = 'Password is required';
  } else if (!isStrongPassword(sanitizedPassword)) {
    registerErrors.password = 'Password must be at least 6 characters';
  }
};

// Real-time validation for register first name
const validateRegisterFirstName = () => {
  registerErrors.firstName = '';
  
  const sanitizedFirstName = sanitizeInput(registerForm.firstName || '');
  registerForm.firstName = sanitizedFirstName;
  
  if (sanitizedFirstName && sanitizedFirstName.length > 50) {
    registerErrors.firstName = 'First name must be less than 50 characters';
  }
};

// Real-time validation for register last name
const validateRegisterLastName = () => {
  registerErrors.lastName = '';
  
  const sanitizedLastName = sanitizeInput(registerForm.lastName || '');
  registerForm.lastName = sanitizedLastName;
  
  if (sanitizedLastName && sanitizedLastName.length > 50) {
    registerErrors.lastName = 'Last name must be less than 50 characters';
  }
};

const validateLoginForm = (): boolean => {
  resetErrors();
  
  // Validate all fields
  validateLoginEmail();
  validateLoginPassword();
  
  // Check if there are any errors
  return !loginErrors.email && !loginErrors.password;
};

const validateRegisterForm = (): boolean => {
  resetErrors();
  
  // Validate all fields
  validateRegisterEmail();
  validateRegisterUsername();
  validateRegisterPassword();
  validateRegisterFirstName();
  validateRegisterLastName();
  
  // Check if there are any errors
  return !registerErrors.email && !registerErrors.username && !registerErrors.password 
    && !registerErrors.firstName && !registerErrors.lastName;
};

const handleLogin = async () => {
  if (!validateLoginForm()) return;
  
  try {
    await authStore.login(loginForm);
  } catch (error) {
    loginErrors.form = authStore.error || 'Login failed';
  }
};

const handleRegister = async () => {
  if (!validateRegisterForm()) return;
  
  try {
    await userStore.registerUser(registerForm);
  } catch (error) {
    registerErrors.form = userStore.error || 'Registration failed';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
      <!-- Logo and Title -->
      <div class="text-center">
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-black">
          <font-awesome-icon icon="user" class="h-6 w-6 text-white" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          {{ isLogin ? 'Sign in to your account' : 'Create a new account' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ isLogin ? 'Enter your credentials to access your account' : 'Fill in your details to register' }}
        </p>
      </div>

      <!-- Login Form -->
      <form v-if="isLogin" class="mt-8 space-y-6" @submit.prevent="handleLogin" novalidate>
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email field -->
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1">
              <input 
                id="login-email" 
                type="email" 
                v-model="loginForm.email" 
                @input="validateLoginEmail"
                @blur="validateLoginEmail"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                placeholder="you@example.com"
                :class="{ 'border-red-500': loginErrors.email }"
                autocomplete="email"
              />
              <p v-if="loginErrors.email" class="mt-1 text-sm text-red-600">{{ loginErrors.email }}</p>
            </div>
          </div>
          
          <!-- Password field -->
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1 relative">
              <input 
                id="login-password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="loginForm.password" 
                @input="validateLoginPassword"
                @blur="validateLoginPassword"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                placeholder="••••••••"
                :class="{ 'border-red-500': loginErrors.password }"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center" 
                @click="togglePasswordVisibility"
              >
                <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" class="h-4 w-4 text-gray-500" />
              </button>
              <p v-if="loginErrors.password" class="mt-1 text-sm text-red-600">{{ loginErrors.password }}</p>
            </div>
          </div>
        </div>

        <div>
          <p v-if="loginErrors.form" class="mb-2 text-sm text-red-600 text-center">{{ loginErrors.form }}</p>
          <button 
            type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            :disabled="isLoading || !isLoginFormValid"
            :class="{ 'opacity-70 cursor-not-allowed': isLoading || !isLoginFormValid }"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="circle-notch" class="h-5 w-5 text-white animate-spin" />
            </span>
            Sign in
          </button>
        </div>
      </form>

      <!-- Registration Form -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister" novalidate>
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email field -->
          <div>
            <label for="register-email" class="block text-sm font-medium text-gray-700">Email</label>
            <div class="mt-1">
              <input 
                id="register-email" 
                type="email" 
                v-model="registerForm.email" 
                @input="validateRegisterEmail"
                @blur="validateRegisterEmail"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                placeholder="you@example.com"
                :class="{ 'border-red-500': registerErrors.email }"
                autocomplete="email"
              />
              <p v-if="registerErrors.email" class="mt-1 text-sm text-red-600">{{ registerErrors.email }}</p>
            </div>
          </div>
          
          <!-- Username field -->
          <div>
            <label for="register-username" class="block text-sm font-medium text-gray-700">Username</label>
            <div class="mt-1">
              <input 
                id="register-username" 
                type="text" 
                v-model="registerForm.username" 
                @input="validateRegisterUsername"
                @blur="validateRegisterUsername"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                placeholder="johndoe"
                :class="{ 'border-red-500': registerErrors.username }"
                autocomplete="username"
              />
              <p v-if="registerErrors.username" class="mt-1 text-sm text-red-600">{{ registerErrors.username }}</p>
            </div>
          </div>
          
          <!-- Name fields -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="register-firstName" class="block text-sm font-medium text-gray-700">First name</label>
              <div class="mt-1">
                <input 
                  id="register-firstName" 
                  type="text" 
                  v-model="registerForm.firstName" 
                  @input="validateRegisterFirstName"
                  @blur="validateRegisterFirstName"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                  placeholder="John"
                  :class="{ 'border-red-500': registerErrors.firstName }"
                  autocomplete="given-name"
                />
                <p v-if="registerErrors.firstName" class="mt-1 text-sm text-red-600">{{ registerErrors.firstName }}</p>
              </div>
            </div>
            <div>
              <label for="register-lastName" class="block text-sm font-medium text-gray-700">Last name</label>
              <div class="mt-1">
                <input 
                  id="register-lastName" 
                  type="text" 
                  v-model="registerForm.lastName" 
                  @input="validateRegisterLastName"
                  @blur="validateRegisterLastName"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                  placeholder="Doe"
                  :class="{ 'border-red-500': registerErrors.lastName }"
                  autocomplete="family-name"
                />
                <p v-if="registerErrors.lastName" class="mt-1 text-sm text-red-600">{{ registerErrors.lastName }}</p>
              </div>
            </div>
          </div>
          
          <!-- Password field -->
          <div>
            <label for="register-password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1 relative">
              <input 
                id="register-password" 
                :type="showPassword ? 'text' : 'password'" 
                v-model="registerForm.password" 
                @input="validateRegisterPassword"
                @blur="validateRegisterPassword"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm" 
                placeholder="••••••••"
                :class="{ 'border-red-500': registerErrors.password }"
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center" 
                @click="togglePasswordVisibility"
              >
                <font-awesome-icon :icon="showPassword ? 'eye-slash' : 'eye'" class="h-4 w-4 text-gray-500" />
              </button>
              <p v-if="registerErrors.password" class="mt-1 text-sm text-red-600">{{ registerErrors.password }}</p>
            </div>
          </div>
        </div>

        <div>
          <p v-if="registerErrors.form" class="mb-2 text-sm text-red-600 text-center">{{ registerErrors.form }}</p>
          <button 
            type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            :disabled="isLoading || !isRegisterFormValid"
            :class="{ 'opacity-70 cursor-not-allowed': isLoading || !isRegisterFormValid }"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon icon="circle-notch" class="h-5 w-5 text-white animate-spin" />
            </span>
            Create account
          </button>
        </div>
      </form>

      <!-- Form toggle -->
      <div class="text-center mt-4">
        <p class="text-sm text-gray-600">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <button 
            type="button" 
            class="font-medium text-black hover:text-gray-800"
            @click="toggleForm"
          >
            {{ isLogin ? "Sign up" : "Sign in" }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
</style>
