import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Restaurant from '../pages/Restaurant.vue'
import User from '../pages/User.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/restaurant/:id',
    name: 'Restaurant',
    component: Restaurant,
    props: true,
  },
  {
    path: '/user',
    name: 'User',
    component: User,
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
