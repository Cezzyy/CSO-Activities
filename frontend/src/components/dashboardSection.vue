<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

// Get customer store
const customerStore = useCustomerStore();

// Function to get days in current month
const getDaysInCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Get the number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate array of day labels (1-31)
  return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
};

// Chart data - use current month days as labels
const chartData = ref({
  labels: getDaysInCurrentMonth(),
  datasets: [
    {
      label: 'Customer Growth',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: '#000',
      borderWidth: 2,
      data: Array(getDaysInCurrentMonth().length).fill(0) // Initialize with zeros
    }
  ]
});

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    title: {
      display: true,
      text: `Customer Growth - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      font: {
        size: 16
      }
    }
  }
};

// Check if data is empty
const hasCustomerData = computed(() => {
  return customerStore.customers.length > 0;
});

// Update chart data when component is mounted
onMounted(async () => {
  try {
    customerStore.initializeCustomers();
    await customerStore.getCustomers();
    updateChartData();
    console.log('Dashboard mounted, customers loaded:', customerStore.customers.length);
  } catch (error) {
    console.error('Failed to fetch customer data:', error);
  }
});

// Watch for changes in the customers array and update chart
watch(() => customerStore.customers, () => {
  updateChartData();
  console.log('Customers changed, updating chart with', customerStore.customers.length, 'customers');
}, { deep: true });

const updateChartData = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  

  const daysInMonth = getDaysInCurrentMonth().length;
  const dailyCounts = Array(daysInMonth).fill(0);
  
  customerStore.customers.forEach(customer => {
    const createdAt = new Date(customer.createdAt);
    if (createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth) {
      const dayOfMonth = createdAt.getDate();
      dailyCounts[dayOfMonth - 1]++;
    }
  });
  
  // Update chart data
  chartData.value.datasets[0].data = dailyCounts;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Overview - Only Total Customers -->
    <div class="grid grid-cols-1">
      <div class="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div class="flex items-center space-x-4">
          <div class="p-3 rounded-full bg-black bg-opacity-10">
            <font-awesome-icon icon="user" class="w-5 h-5 text-black" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Total Customers</p>
            <p class="text-xl font-semibold">{{ customerStore.totalCustomers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Growth Chart -->
    <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 class="font-medium text-gray-900 flex items-center">
          <font-awesome-icon icon="chart-line" class="mr-2" />
          Customer Growth (Current Month)
        </h3>
      </div>
      <div class="p-6" style="height: 300px;">
        <!-- Loading state -->
        <div v-if="customerStore.isLoading" class="h-full flex items-center justify-center">
          <div class="text-center">
            <font-awesome-icon icon="circle-notch" class="animate-spin text-3xl text-gray-400 mb-3" />
            <p class="text-gray-500">Loading customer data...</p>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="!hasCustomerData" class="h-full flex items-center justify-center">
          <div class="text-center max-w-md">
            <font-awesome-icon icon="chart-line" class="text-4xl text-gray-300 mb-3" />
            <h4 class="text-lg font-medium text-gray-700 mb-1">No customer growth data</h4>
            <p class="text-gray-500 text-sm">Add more customers to see growth trends for the current month. Customer data will be displayed in this chart as your customer base grows.</p>
          </div>
        </div>
        
        <!-- Chart -->
        <Line 
          v-else
          :data="chartData" 
          :options="chartOptions" 
        />
      </div>
    </div>
  </div>
</template>