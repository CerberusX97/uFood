<template>
  <nav>
    <router-link to="/" class="logo">Ufood</router-link>
    <div class="hamburger" @click="toggleMobileMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="search-container" :class="{ 'mobile-search': isMobileMenuOpen }">
      <div class="search-dropdown">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          @input="debouncedHandleInput"
          @focus="showSearchDropdown = true"
          @blur="hideSearchDropdown"
          @keyup.enter="handleSearch"
        />
        <div v-if="showSearchDropdown && searchQuery" class="search-suggestions">
          <div v-if="restaurants.length > 0">
            <div
              v-for="restaurant in restaurants"
              :key="restaurant.id"
              class="suggestion-item"
              @click="selectSuggestion(restaurant)"
            >
              {{ restaurant.name }}
            </div>
          </div>
          <div v-else class="suggestion-item">No results found.</div>
        </div>
      </div>
    </div>
    <ul :class="{ 'mobile-menu': true, active: isMobileMenuOpen }">
      <li v-if="!isSignedIn">
        <a href="#" id="sign-link" @click="signIn">Sign in</a>
      </li>
      <li v-else id="profile-container">
        <div class="profile-link" @click="toggleProfileDropdown">
          <span class="username-text-style">{{ userName.replace(/"/g, '') }}</span>
          <img src="/src/Pictures/image2.png" alt="Profile" class="profile-icon-img" />
        </div>
        <div v-if="showProfileDropdown" class="profile-dropdown">
          <router-link to="/user" class="dropdown-item">Profile</router-link>
          <a href="#" class="dropdown-item" @click="signOut">Log out</a>
        </div>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserById } from '@/api/userApi.js'
import { searchRestaurants } from '@/api/restaurantApi.js'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'

const userName = ref('')
const isSignedIn = ref(false)
const showProfileDropdown = ref(false)
const showSearchDropdown = ref(false)
const searchQuery = ref('')
const restaurants = ref([])
const router = useRouter()
const isMobileMenuOpen = ref(false)

async function fetchUser() {
  try {
    const userId = '639bb14d2b5bb7844f42416c'
    const user = await getUserById(userId)
    if (user) {
      userName.value = user.name
    }
  } catch (error) {
    console.error("Erreur lors du chargement de l'utilisateur", error)
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

async function fetchRestaurants() {
  try {
    if (searchQuery.value.trim() !== '') {
      const data = await searchRestaurants({ q: searchQuery.value })
      restaurants.value = data.items.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
      }))
    } else {
      restaurants.value = []
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error)
  }
}

const debouncedHandleInput = debounce(() => {
  if (searchQuery.value.trim() !== '') {
    fetchRestaurants()
    showSearchDropdown.value = true
  } else {
    restaurants.value = []
    showSearchDropdown.value = false
  }
}, 300)

function signIn() {
  isSignedIn.value = true
  fetchUser()
}

function signOut() {
  isSignedIn.value = false
  userName.value = ''
  showProfileDropdown.value = false
  router.push('/')
}

function toggleProfileDropdown() {
  showProfileDropdown.value = !showProfileDropdown.value
}

function selectSuggestion(restaurant) {
  searchQuery.value = ''
  showSearchDropdown.value = false
  isMobileMenuOpen.value = false
  navigateToRestaurant(restaurant.id)
}

function handleSearch() {
  if (searchQuery.value.length > 0 && restaurants.value.length > 0) {
    const firstRestaurant = restaurants.value[0]
    searchQuery.value = ''
    showSearchDropdown.value = false
    isMobileMenuOpen.value = false
    navigateToRestaurant(firstRestaurant.id)
  }
}

function navigateToRestaurant(restaurantId) {
  router.push(`/restaurant/${restaurantId}`)
}

function hideSearchDropdown() {
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

function closeDropdownsOnClickOutside(event) {
  const profileContainer = document.getElementById('profile-container')
  const searchContainer = document.querySelector('.search-dropdown')
  const hamburger = document.querySelector('.hamburger')

  if (profileContainer && !profileContainer.contains(event.target)) {
    showProfileDropdown.value = false
  }

  if (searchContainer && !searchContainer.contains(event.target)) {
    showSearchDropdown.value = false
  }

  if (
    isMobileMenuOpen.value &&
    !hamburger.contains(event.target) &&
    !document.querySelector('.mobile-menu').contains(event.target)
  ) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdownsOnClickOutside)

  const mobileMenuLinks = document.querySelectorAll('.mobile-menu a')
  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      isMobileMenuOpen.value = false
      document.body.style.overflow = ''
    })
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      isMobileMenuOpen.value = false
      document.body.style.overflow = ''
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownsOnClickOutside)
})
</script>

<style>
* {
  padding: 0;
  margin: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}

nav {
  background: #ffe8d6;
  height: 80px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  position: relative;
  z-index: 1000;
}

.logo {
  color: #2a9d8f;
  font-size: 35px;
  font-weight: bold;
  cursor: pointer;
  transition:
    color 0.3s,
    transform 0.3s;
}

.logo:hover {
  color: #21867a;
  transform: scale(1.05);
}

.search-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.search-dropdown {
  display: flex;
  align-items: center;
  position: relative;
}

.search-dropdown input {
  width: 200px;
  padding: 10px;
  border: 2px solid #2a9d8f;
  border-radius: 25px;
  outline: none;
  transition:
    width 0.3s ease,
    border-color 0.3s;
  font-size: 16px;
}

.search-dropdown input:focus {
  width: 300px;
  border-color: #21867a;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 5px;
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.suggestion-item:hover {
  background-color: #f0f0f0;
}

nav ul {
  display: flex;
  align-items: center;
  margin: 0;
}

nav ul li {
  margin: 0 10px;
  position: relative;
}

nav ul li a {
  color: black;
  font-size: 17px;
  padding: 10px 15px;
  border-radius: 5px;
  text-transform: uppercase;
  transition:
    background 0.3s,
    color 0.3s;
}

#sign-link {
  background-color: #2a9d8f;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

#sign-link:hover {
  background-color: #21867a;
}

#profile-container {
  display: flex;
  align-items: center;
  background-color: #2a9d8f;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

#profile-container:hover {
  background-color: #21867a;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #2a9d8f;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.3s;
  height: 40px;
}

.profile-link:hover {
  background-color: #21867a;
}

.username-text-style {
  color: white;
  font-size: 17px;
  font-weight: bold;
  text-transform: uppercase;
  line-height: 1;
}

.profile-icon-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  transition:
    transform 0.3s,
    border-color 0.3s;
}

.profile-icon-img:hover {
  transform: scale(1.1);
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  margin-top: 5px;
}

.profile-dropdown .dropdown-item {
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  display: block;
  transition: background 0.3s;
}

.profile-dropdown .dropdown-item:hover {
  background-color: #f0f0f0;
}

.hamburger {
  display: none;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 22px;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background-color: #2a9d8f;
  border-radius: 3px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
    z-index: 1002;
  }

  .hamburger.active span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }

  .mobile-menu {
    position: fixed;
    top: 80px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 80px);
    background-color: rgba(255, 232, 214, 0.97);
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 20px;
    transition: left 0.3s ease;
    overflow-y: auto;
  }

  .mobile-menu.active {
    left: 0;
  }

  .mobile-menu li {
    margin: 15px 0;
    width: 80%;
    text-align: center;
  }

  .mobile-menu li a {
    display: block;
    font-size: 20px;
    padding: 15px;
  }

  .mobile-search {
    position: static;
    transform: none;
    width: 100%;
    padding: 10px 20px;
    margin-top: 20px;
  }

  .mobile-search .search-dropdown {
    width: 100%;
  }

  .mobile-search input {
    width: 100% !important;
  }

  .mobile-menu.active + .search-container {
    position: static;
    transform: none;
    width: 100%;
    padding: 10px 20px;
  }

  .search-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 40%;
  }

  .search-dropdown {
    width: 100%;
  }

  .search-dropdown input {
    width: 100%;
  }

  .profile-dropdown {
    width: 100%;
    right: auto;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .search-dropdown input {
    width: 150px;
  }

  .search-dropdown input:focus {
    width: 200px;
  }

  nav {
    padding: 0 15px;
  }

  .logo {
    font-size: 28px;
  }
}

@media (max-height: 500px) and (orientation: landscape) and (max-width: 768px) {
  .mobile-menu {
    height: auto;
    max-height: calc(100vh - 80px);
    overflow-y: scroll;
    padding-bottom: 20px;
  }
}
</style>
