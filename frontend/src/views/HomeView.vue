<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { useAuthStore } from '../stores/authStore';

// Get auth store
const authStore = useAuthStore();

// Lazy load the components
const DashboardComponent = defineAsyncComponent(() => import('../components/dashboardSection.vue'));
const CustomerComponent = defineAsyncComponent(() => import('../components/customerList.vue'));

const sidebarExpanded = ref(false);
const activeTab = ref('Dashboard');

const navLinks = [
  { name: 'Dashboard', icon: 'home' },
  { name: 'Customers', icon: 'user' },
];

function toggleSidebar() {
  sidebarExpanded.value = !sidebarExpanded.value;
}

function selectTab(tab: string) {
  activeTab.value = tab;
}

// Logout function
function handleLogout() {
  authStore.logout();
}

// Map tab names to their respective components
const activeTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'Dashboard':
      return DashboardComponent;
    case 'Customers':
      return CustomerComponent;
    default:
      return DashboardComponent;
  }
});
</script>

<template>
  <div class="min-h-screen flex bg-white">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed z-30 inset-y-0 left-0 flex flex-col bg-black text-white transition-all duration-300 ease-in-out',
        sidebarExpanded ? 'w-56' : 'w-16'
      ]"
    >
      <div class="flex items-center justify-between h-16 px-3 border-b border-white/10">
        <span v-if="sidebarExpanded" class="font-bold text-lg tracking-wide">Management</span>
        <button 
          class="p-2 hover:bg-white/10 rounded transition"
          @click="toggleSidebar"
        >
          <font-awesome-icon :icon="sidebarExpanded ? 'chevron-left' : 'bars'" class="w-5 h-5" />
        </button>
      </div>
      <nav class="flex-1 py-4">
        <ul class="space-y-1">
          <li v-for="link in navLinks" :key="link.name">
            <a href="#" @click.prevent="selectTab(link.name)"
              :class="[
                'flex items-center py-3 rounded transition',
                sidebarExpanded ? 'px-6' : 'px-0 justify-center',
                activeTab === link.name ? 'bg-white/10 font-semibold' : 'hover:bg-white/10'
              ]"
            >
              <font-awesome-icon :icon="link.icon" class="w-5 h-5" :class="sidebarExpanded ? 'mr-3' : ''" />
              <span v-if="sidebarExpanded" class="font-medium">{{ link.name }}</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="mt-auto border-t border-white/10 p-3">
        <button 
          class="flex items-center w-full hover:bg-white/10 rounded py-2 transition"
          :class="sidebarExpanded ? 'px-3 text-left' : 'px-0 justify-center'"
          @click="handleLogout"
        >
          <font-awesome-icon icon="sign-out-alt" class="w-5 h-5" :class="sidebarExpanded ? 'mr-3' : ''" />
          <span v-if="sidebarExpanded">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen" :class="{ 'ml-16': !sidebarExpanded, 'ml-56': sidebarExpanded }">
      <!-- Header -->
      <header class="flex items-center justify-between h-16 px-4 border-b border-black/10 bg-white sticky top-0 z-20">
        <div class="flex items-center">
          <span class="font-bold text-lg tracking-wide text-black">Management</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-black font-medium">User</span>
          <button class="p-2 rounded-full hover:bg-black/5">
            <font-awesome-icon icon="user" class="w-5 h-5 text-black" />
          </button>
        </div>
      </header>
      <main class="flex-1 p-6 bg-white">
        <h2 class="text-2xl font-semibold text-black mb-6">{{ activeTab }}</h2>
        <component :is="activeTabComponent" />
      </main>
    </div>
  </div>
</template>

<style scoped>
</style>
