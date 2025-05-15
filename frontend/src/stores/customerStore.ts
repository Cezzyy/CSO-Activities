import { defineStore } from 'pinia';
import { Customer, CustomerCreate, CustomerUpdate } from '../types/customer';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [] as Customer[],
    isLoading: false,
    error: null as string | null
  }),
  
  getters: {
    totalCustomers: (state) => state.customers.length,
    activeCustomers: (state) => state.customers.filter(c => c.status === 'Active').length,
    inactiveCustomers: (state) => state.customers.filter(c => c.status === 'Inactive').length,
    pendingCustomers: (state) => state.customers.filter(c => c.status === 'Pending').length,
    
    // Get customer data grouped by month for charts
    customersByMonth: (state) => {
      const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear(),
          timestamp: date.getTime()
        };
      }).reverse();
      
      // Count customers created in each month
      return lastSixMonths.map(monthData => {
        const nextMonth = new Date(monthData.timestamp);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const count = state.customers.filter(customer => {
          const created = customer.createdAt.getTime();
          return created >= monthData.timestamp && created < nextMonth.getTime();
        }).length;
        
        return {
          month: `${monthData.month} ${monthData.year}`,
          count
        };
      });
    }
  },
  
  actions: {
    // Helper to save customers to localStorage
    saveToLocalStorage() {
      localStorage.setItem('customers', JSON.stringify(this.customers));
    },
    
    // Initialize customers from localStorage if available
    initializeCustomers() {
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) {
        try {
          // Parse stored data and convert string dates back to Date objects
          const parsed = JSON.parse(storedCustomers);
          this.customers = parsed.map((customer: any) => ({
            ...customer,
            createdAt: new Date(customer.createdAt),
            updatedAt: new Date(customer.updatedAt)
          }));
        } catch (err) {
          console.error('Failed to parse stored customers:', err);
          this.customers = [];
        }
      } else {
        // Initialize with an empty array instead of sample data
        this.customers = [];
        this.saveToLocalStorage();
      }
    },
    
    async getCustomers() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // In a real app, you would fetch from an API
        return this.customers;
      } catch (err) {
        this.error = 'Failed to fetch customers';
        console.error(this.error, err);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    
    getCustomerById(id: string): Customer | undefined {
      return this.customers.find(customer => customer.id === id);
    },
    
    async createCustomer(customerData: CustomerCreate) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Validate email uniqueness
        if (this.customers.some(c => c.email === customerData.email)) {
          throw new Error('A customer with this email already exists');
        }
        
        // Create new customer
        const newCustomer: Customer = {
          id: (Math.max(0, ...this.customers.map(c => parseInt(c.id))) + 1).toString(),
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add to customers array
        this.customers.push(newCustomer);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        return newCustomer;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create customer';
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateCustomer(customerData: CustomerUpdate) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const index = this.customers.findIndex(c => c.id === customerData.id);
        if (index === -1) {
          throw new Error('Customer not found');
        }
        
        // Check email uniqueness if updating email
        if (customerData.email && 
            customerData.email !== this.customers[index].email && 
            this.customers.some(c => c.email === customerData.email)) {
          throw new Error('A customer with this email already exists');
        }
        
        // Update customer
        const updatedCustomer = {
          ...this.customers[index],
          ...customerData,
          updatedAt: new Date()
        };
        
        this.customers[index] = updatedCustomer;
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        return updatedCustomer;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update customer';
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteCustomer(id: string) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const index = this.customers.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Customer not found');
        }
        
        // Remove customer
        this.customers.splice(index, 1);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        return true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete customer';
        console.error(this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
