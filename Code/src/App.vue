<template>
  <div id="app">
    <Navigation></Navigation>
    <router-view :key="$route.fullPath"></router-view>
  </div>
</template>

<script setup>
import Navigation from './components/Navigation.vue'
</script>

<style></style>
