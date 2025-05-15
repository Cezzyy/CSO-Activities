<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { Customer, CustomerUpdate } from '../types/customer';

const props = defineProps<{
  show: boolean;
  customer: Customer | null;
}>();

const emit = defineEmits(['close']);

// Get store
const customerStore = useCustomerStore();

// Form data
const editCustomer = reactive<CustomerUpdate>({
  id: '',
  name: '',
  email: '',
  status: 'Active',
  notes: '',
  contactNumber: '',
  company: ''
});

// Form validation
const formError = ref('');

// Update form when customer changes
watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    editCustomer.id = newCustomer.id;
    editCustomer.name = newCustomer.name;
    editCustomer.email = newCustomer.email;
    editCustomer.status = newCustomer.status;
    editCustomer.notes = newCustomer.notes || '';
    editCustomer.contactNumber = newCustomer.contactNumber || '';
    editCustomer.company = newCustomer.company || '';
  }
}, { immediate: true });

// Close modal
const closeModal = () => {
  formError.value = '';
  emit('close');
};

// Update customer
const handleUpdateCustomer = async () => {
  if (!editCustomer.name || !editCustomer.email) {
    formError.value = 'Name and email are required';
    return;
  }
  
  try {
    await customerStore.updateCustomer(editCustomer);
    closeModal();
  } catch (err) {
    formError.value = customerStore.error || 'Failed to update customer';
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Edit Customer</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <font-awesome-icon icon="times" />
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="formError" class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {{ formError }}
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input 
              type="text" 
              v-model="editCustomer.name" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              placeholder="Customer name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" 
              v-model="editCustomer.email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              placeholder="customer@example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input 
              type="text" 
              v-model="editCustomer.company" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              placeholder="Company name"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input 
              type="text" 
              v-model="editCustomer.contactNumber" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              placeholder="Phone number"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              v-model="editCustomer.status" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              v-model="editCustomer.notes" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              placeholder="Additional notes"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button 
          @click="closeModal"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium mr-2 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          @click="handleUpdateCustomer"
          :disabled="customerStore.isLoading"
          class="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          :class="{ 'opacity-70 cursor-not-allowed': customerStore.isLoading }"
        >
          <font-awesome-icon v-if="customerStore.isLoading" icon="circle-notch" class="animate-spin mr-1" />
          Update
        </button>
      </div>
    </div>
  </div>
</template> 