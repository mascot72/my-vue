<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header>
      <div class="header-content">
        <div class="logo-section">
          <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="32" height="32" />
          <span class="app-title">Vue Timeline App</span>
        </div>

        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/timeline">Timeline</RouterLink>
          <RouterLink to="/timeline-examples">Examples</RouterLink>
          <RouterLink to="/timeline-enhanced">Enhanced</RouterLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  min-width: 0;
}

header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  flex-shrink: 0;
  color: var(--color-text);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  padding: 0.75rem 1.5rem;
  height: 60px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo {
  display: block;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
}

nav {
  display: flex;
  gap: 0.5rem;
}

nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.2s;
}

nav a:hover {
  background-color: #f3f4f6;
}

nav a.router-link-exact-active {
  color: #3b82f6;
  background-color: #eff6ff;
}

.main-content {
  flex: 1;
  overflow: auto;
  width: 100%;
  min-width: 0;
}
</style>
