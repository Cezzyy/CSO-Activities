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
const errors = reactive({
  name: '',
  email: '',
  company: '',
  contactNumber: '',
  notes: ''
});

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

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateName = (name: string): boolean => {
  const regex = /^[A-Za-z\s\-]+$/;
  return regex.test(name);
};

const validatePhilippinePhone = (phone: string): boolean => {
  const regex = /^(\+63[0-9]{10}|09[0-9]{9})$/;
  return regex.test(phone);
};

const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset all errors
  errors.name = '';
  errors.email = '';
  errors.company = '';
  errors.contactNumber = '';
  errors.notes = '';
  formError.value = '';
  
  // Validate name
  if (!editCustomer.name?.trim()) {
    errors.name = 'Name is required';
    isValid = false;
  } else if (editCustomer.name && !validateName(editCustomer.name.trim())) {
    errors.name = 'Name should contain only letters, spaces, and hyphens';
    isValid = false;
  }
  
  // Validate email
  if (!editCustomer.email?.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (editCustomer.email && !validateEmail(editCustomer.email.trim())) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  // Validate company
  if (!editCustomer.company?.trim()) {
    errors.company = 'Company is required';
    isValid = false;
  }
  
  // Validate contact number - must be Philippine format
  if (!editCustomer.contactNumber?.trim()) {
    errors.contactNumber = 'Contact number is required';
    isValid = false;
  } else if (editCustomer.contactNumber && !validatePhilippinePhone(editCustomer.contactNumber.trim())) {
    errors.contactNumber = 'Please enter a valid Philippine phone number (+63XXXXXXXXXX or 09XXXXXXXXX)';
    isValid = false;
  }
  
  // Validate notes
  if (!editCustomer.notes?.trim()) {
    errors.notes = 'Notes are required';
    isValid = false;
  }
  
  return isValid;
};

// Close modal
const closeModal = () => {
  formError.value = '';
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  emit('close');
};

// Update customer
const handleUpdateCustomer = async () => {
  // Trim all inputs
  editCustomer.name = editCustomer.name?.trim() || '';
  editCustomer.email = editCustomer.email?.trim() || '';
  editCustomer.company = editCustomer.company?.trim() || '';
  editCustomer.contactNumber = editCustomer.contactNumber?.trim() || '';
  editCustomer.notes = editCustomer.notes?.trim() || '';
  
  if (!validateForm()) {
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
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              :class="errors.name ? 'border-red-500' : 'border-gray-300'"
              placeholder="Customer name"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input 
              type="email" 
              v-model="editCustomer.email" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              :class="errors.email ? 'border-red-500' : 'border-gray-300'"
              placeholder="customer@example.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <input 
              type="text" 
              v-model="editCustomer.company" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              :class="errors.company ? 'border-red-500' : 'border-gray-300'"
              placeholder="Company name"
            />
            <p v-if="errors.company" class="mt-1 text-sm text-red-600">{{ errors.company }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
            <input 
              type="text" 
              v-model="editCustomer.contactNumber" 
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              :class="errors.contactNumber ? 'border-red-500' : 'border-gray-300'"
              placeholder="Phone number"
            />
            <p v-if="errors.contactNumber" class="mt-1 text-sm text-red-600">{{ errors.contactNumber }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select 
              v-model="editCustomer.status" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes *</label>
            <textarea 
              v-model="editCustomer.notes" 
              rows="3"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              :class="errors.notes ? 'border-red-500' : 'border-gray-300'"
              placeholder="Additional notes"
            ></textarea>
            <p v-if="errors.notes" class="mt-1 text-sm text-red-600">{{ errors.notes }}</p>
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