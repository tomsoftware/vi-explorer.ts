<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div>
    <h1>vi-explorer.ts</h1>
    <nav class="navigation">

      <RouterLink to="/browser" class="nav-link">
        <span class="icon">📁</span>
        <span>Browser</span>
      </RouterLink>

    </nav>
  </div>
</template>

<style scoped>

h1 {
  font-size: 3rem;
  margin: 0;
  color: #333;
}

.navigation {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  border: 2px solid #ddd;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 150px;
}

.nav-link:hover {
  background: #e8e8e8;
  border-color: #999;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 3rem;
}
</style>
