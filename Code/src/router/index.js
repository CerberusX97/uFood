import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Restaurant from '../pages/Restaurant.vue'
import User from '../pages/User.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/restaurant/:id', name: 'Restaurant', component: Restaurant, props: true },
  { path: '/user', name: 'User', component: User },
  {
    path: '/FavoriteList/:playlistName?id=:playlistId',
    name: 'PlaylistDescription',
    component: () => import('@/components/FavoriteList.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
