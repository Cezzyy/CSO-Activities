<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCustomerStore } from '../stores/customerStore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement);

// Get customer store
const customerStore = useCustomerStore();

// Chart data
const chartData = ref({
  labels: ['Dec 2023', 'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024'] as string[],
  datasets: [
    {
      label: 'Customer Growth',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderColor: '#000',
      borderWidth: 2,
      data: [0, 0, 0, 0, 0, 0] as number[]
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
    }
  }
};

// Check if data is empty
const hasCustomerData = computed(() => {
  return customerStore.customersByMonth && 
         customerStore.customersByMonth.length > 0 && 
         customerStore.customersByMonth.some(item => item.count > 0);
});

// Update chart data when component is mounted
onMounted(async () => {
  try {
    await customerStore.getCustomers();
    updateChartData();
  } catch (error) {
    console.error('Failed to fetch customer data:', error);
  }
});

// Update chart data from store
const updateChartData = () => {
  if (customerStore.customersByMonth && customerStore.customersByMonth.length > 0) {
    chartData.value.labels = customerStore.customersByMonth.map(item => item.month);
    chartData.value.datasets[0].data = customerStore.customersByMonth.map(item => item.count);
  }
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
          Customer Growth
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
            <p class="text-gray-500 text-sm">Add more customers to see growth trends over time. Customer data will be displayed in this chart as your customer base grows.</p>
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