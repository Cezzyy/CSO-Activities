<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const customerList = defineAsyncComponent(() => import('../components/customerList.vue'));
</script>

<template>
    <h1>Home</h1>
    <customerList />
</template>

<style scoped>

</style> 