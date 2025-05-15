<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { Customer } from '../types/customer';

// Lazy-load modal components for better performance
const AddCustomerModal = defineAsyncComponent(() => import('./AddCustomerModal.vue'));
const EditCustomerModal = defineAsyncComponent(() => import('./EditCustomerModal.vue'));
const DeleteCustomerModal = defineAsyncComponent(() => import('./DeleteCustomerModal.vue'));
const ViewCustomerModal = defineAsyncComponent(() => import('./ViewCustomerModal.vue'));

const customerStore = useCustomerStore();

// Modal state
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showViewModal = ref(false);
const selectedCustomer = ref<Customer | null>(null);
const selectedCustomerId = ref<string | null>(null);

// Search functionality
const searchQuery = ref('');
const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customerStore.customers;
  
  const query = searchQuery.value.toLowerCase();
  return customerStore.customers.filter(customer => 
    customer.name.toLowerCase().includes(query) || 
    customer.email.toLowerCase().includes(query) ||
    customer.status.toLowerCase().includes(query)
  );
});

// Get status icon based on customer status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active': return 'check';
    case 'Inactive': return 'times';
    default: return 'circle';
  }
};

// Load customers on component mount
onMounted(async () => {
  // Ensure we load data from localStorage first
  customerStore.initializeCustomers();
  await customerStore.getCustomers();
  console.log('Customer list mounted, customers loaded:', customerStore.customers.length);
});

// Modal handlers
const openAddModal = () => {
  showAddModal.value = true;
};

const openEditModal = (customer: Customer) => {
  selectedCustomer.value = customer;
  showEditModal.value = true;
};

const openDeleteModal = (id: string) => {
  selectedCustomerId.value = id;
  showDeleteModal.value = true;
};

const openViewModal = (customer: Customer) => {
  selectedCustomer.value = customer;
  showViewModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedCustomer.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedCustomerId.value = null;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedCustomer.value = null;
};
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-4">
      <h2 class="text-lg font-medium text-gray-900 flex items-center">
        <font-awesome-icon icon="user" class="mr-2" />
        Customers
      </h2>
      
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search customers..."
            class="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
          />
          <font-awesome-icon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <button 
          @click="openAddModal"
          class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium inline-flex items-center"
        >
          <font-awesome-icon icon="plus" class="mr-2" />
          Add Customer
        </button>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="customerStore.isLoading" class="animate-pulse">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">
              <font-awesome-icon icon="circle-notch" class="animate-spin mr-2" />
              Loading customers...
            </td>
          </tr>
          <tr v-else-if="customerStore.customers.length === 0">
            <td colspan="4" class="px-6 py-16 text-center">
              <div class="max-w-sm mx-auto">
                <div class="flex justify-center">
                  <div class="p-3 rounded-full bg-gray-100 mb-4">
                    <font-awesome-icon icon="user" class="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">No customers yet</h3>
                <p class="text-gray-500 mb-6">Get started by adding your first customer to your database.</p>
                <button 
                  @click="openAddModal"
                  class="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                >
                  <font-awesome-icon icon="plus" class="mr-2" />
                  Add First Customer
                </button>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredCustomers.length === 0">
            <td colspan="4" class="px-6 py-16 text-center">
              <div class="max-w-sm mx-auto">
                <div class="flex justify-center">
                  <div class="p-3 rounded-full bg-gray-100 mb-4">
                    <font-awesome-icon icon="search" class="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                <p class="text-gray-500 mb-4">We couldn't find any customers matching "{{ searchQuery }}"</p>
                <button 
                  @click="searchQuery = ''"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  Clear Search
                </button>
              </div>
            </td>
          </tr>
          <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-label="Name">
              {{ customer.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Email">
              {{ customer.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" data-label="Status">
              <div class="flex items-center">
                <span 
                  class="w-2 h-2 rounded-full mr-2"
                  :class="{
                    'bg-black': customer.status === 'Active',
                    'bg-gray-300': customer.status === 'Inactive'
                  }"
                ></span>
                <span class="text-gray-700">
                  <font-awesome-icon :icon="getStatusIcon(customer.status)" class="mr-1" />
                  {{ customer.status }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" data-label="Actions">
              <div class="flex space-x-3">
                <button 
                  @click="openViewModal(customer)"
                  class="text-gray-600 hover:text-black transition-colors"
                  title="View customer"
                >
                  <font-awesome-icon icon="eye" />
                </button>
                <button 
                  @click="openEditModal(customer)"
                  class="text-gray-600 hover:text-black transition-colors"
                  title="Edit customer"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button 
                  @click="openDeleteModal(customer.id)"
                  class="text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete customer"
                >
                  <font-awesome-icon icon="trash-alt" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
      <p class="text-sm text-gray-500">
        Showing {{ filteredCustomers.length }} out of {{ customerStore.totalCustomers }} customers
      </p>
      <button 
        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm transition-colors duration-150 opacity-50 cursor-not-allowed"
        title="Export functionality not implemented"
        disabled
      >
        <font-awesome-icon icon="file-export" class="mr-1" />
        Export
      </button>
    </div>
  </div>
  
  <!-- Modals -->
  <AddCustomerModal :show="showAddModal" @close="closeAddModal" />
  <EditCustomerModal :show="showEditModal" :customer="selectedCustomer" @close="closeEditModal" />
  <DeleteCustomerModal :show="showDeleteModal" :customerId="selectedCustomerId" @close="closeDeleteModal" />
  <ViewCustomerModal :show="showViewModal" :customer="selectedCustomer" @close="closeViewModal" />
</template>

<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  table {
    display: block;
  }
  
  thead {
    display: none;
  }
  
  tbody {
    display: block;
  }
  
  tr {
    display: block;
    margin-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  td {
    display: flex;
    padding: 0.5rem 1rem;
    text-align: right;
    justify-content: space-between;
    border: none;
  }
  
  td::before {
    content: attr(data-label);
    font-weight: 600;
    text-align: left;
  }
  
  td[colspan] {
    justify-content: center;
  }
}
</style>