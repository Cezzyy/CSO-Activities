<script setup lang="ts">
import { computed } from 'vue';
import { Customer } from '../types/customer';

const props = defineProps<{
  show: boolean;
  customer: Customer | null;
}>();

const emit = defineEmits(['close']);

// Format date
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get status class
const getStatusClass = computed(() => {
  if (!props.customer) return '';
  
  switch(props.customer.status) {
    case 'Active': return 'bg-black text-white';
    case 'Inactive': return 'bg-gray-300 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
});

// Close modal
const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div v-if="show && customer" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Customer Details</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      
      <!-- Customer header -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center mb-4">
          <div class="bg-gray-100 rounded-full p-3 mr-4">
            <font-awesome-icon icon="user" class="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h4 class="text-xl font-medium text-gray-900">{{ customer.name }}</h4>
            <p class="text-gray-600">{{ customer.email }}</p>
          </div>
        </div>
        <div class="flex items-center">
          <span 
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusClass"
          >
            {{ customer.status }}
          </span>
          <span class="text-gray-500 text-sm ml-4">
            ID: {{ customer.id }}
          </span>
        </div>
      </div>
      
      <!-- Customer details -->
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h5 class="text-sm font-medium text-gray-500 mb-1">Company</h5>
            <p class="text-gray-900">{{ customer.company || 'N/A' }}</p>
          </div>
          
          <div>
            <h5 class="text-sm font-medium text-gray-500 mb-1">Contact Number</h5>
            <p class="text-gray-900">{{ customer.contactNumber || 'N/A' }}</p>
          </div>
        </div>
        
        <div>
          <h5 class="text-sm font-medium text-gray-500 mb-1">Notes</h5>
          <p class="text-gray-900 whitespace-pre-line">{{ customer.notes || 'No notes available' }}</p>
        </div>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-gray-100 pt-4 mt-4">
          <div>
            <h5 class="text-sm font-medium text-gray-500 mb-1">Created</h5>
            <p class="text-gray-900">{{ formatDate(customer.createdAt) }}</p>
          </div>
          
          <div>
            <h5 class="text-sm font-medium text-gray-500 mb-1">Last Updated</h5>
            <p class="text-gray-900">{{ formatDate(customer.updatedAt) }}</p>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button 
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template> 