<script setup lang="ts">
import { useCustomerStore } from '../stores/customerStore';

const props = defineProps<{
  show: boolean;
  customerId: string | null;
}>();

const emit = defineEmits(['close']);

// Get store
const customerStore = useCustomerStore();

// Close modal
const closeModal = () => {
  emit('close');
};

// Delete customer
const handleDeleteCustomer = async () => {
  if (!props.customerId) return;
  
  try {
    await customerStore.deleteCustomer(props.customerId);
    closeModal();
  } catch (err) {
    console.error('Failed to delete customer:', err);
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Confirm Deletion</h3>
      </div>
      
      <div class="p-6">
        <p class="text-gray-700">Are you sure you want to delete this customer? This action cannot be undone.</p>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button 
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium mr-2 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="handleDeleteCustomer"
          :disabled="customerStore.isLoading"
          class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          :class="{ 'opacity-70 cursor-not-allowed': customerStore.isLoading }"
        >
          <font-awesome-icon v-if="customerStore.isLoading" icon="circle-notch" class="animate-spin mr-1" />
          Delete
        </button>
      </div>
    </div>
  </div>
</template> 