<template>
  <div>
    <div class="Acceuil">
      <div class="text">
        <h3 class="color">Delicious Dishes</h3>
        <h3>for Food Lovers</h3>
        <p>The guide to the best local foodie spots</p>
      </div>
    </div>
    <div class="restaurants">
      <div class="search-container">
        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search..."
            @input="handleInput"
            @blur="hideDropdown"
          />
        </div>
        <div class="filter-bar">
          <select v-model="selectedPrice">
            <option value="">Price</option>
            <option value="1">$ - Cheap</option>
            <option value="2">$$ - Moderate</option>
            <option value="3">$$$ - Expensive</option>
            <option value="4">$$$ - High End</option>
            <option value="5">$$$ - Exclusive</option>
          </select>
          <select v-model="selectedGenre">
            <option value="">Cuisine Type</option>
            <option v-for="genre in genreOptions" :key="genre" :value="genre">
              {{ genre.charAt(0).toUpperCase() + genre.slice(1) }}
            </option>
          </select>
        </div>
      </div>
      <div class="restaurant-list">
        <div
          class="restaurant-card"
          v-for="restaurant in paginatedRestaurants"
          :key="restaurant.id"
        >
          <div class="restaurant-header">
            <h2 class="restaurant-name">{{ restaurant.name }}</h2>
            <p class="restaurant-tel">📞 {{ restaurant.tel }}</p>
          </div>
          <img :src="restaurant.photos[0]" alt="Restaurant Image" class="restaurant-image" />
          <div class="restaurant-info">
            <p class="restaurant-address">📍 {{ restaurant.address }}</p>
            <p class="restaurant-rating">{{ getStars(restaurant.rating) }}</p>
          </div>
          <router-link :to="'/restaurant/' + restaurant.id" class="details-button"
            >View Details</router-link
          >
          <ReviewButton :restaurant-id="restaurant.id" class="review-button-card" />
        </div>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 0">Previous</button>
        <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages - 1">Next</button>
      </div>
      <div class="geo-section">
        <h2>📍 Your Location</h2>
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAllRestaurants } from '@/api/restaurantApi.js'
import ReviewButton from '@/components/restaurantVisitebutton.vue'

const allRestaurants = ref([])
const paginatedRestaurants = ref([])
const searchQuery = ref('')
const selectedPrice = ref('')
const selectedGenre = ref('')
const showDropdown = ref(false)
const map = ref(null)
const markers = ref([])
const userMarker = ref(null)
const isInitialLoad = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const elementParPages = 10
const genreOptions = ref([])
const searchSuggestions = ref([])

const fetchRestaurants = async () => {
  try {
    const data = await getAllRestaurants({
      limit: elementParPages,
      page: currentPage.value,
      q: searchQuery.value,
      price_range: selectedPrice.value,
      genres: selectedGenre.value,
    })

    allRestaurants.value = data.items.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      rating: Math.round(restaurant.rating),
      price: restaurant.price_range,
      genres: restaurant.genres,
      latitude: restaurant.location.coordinates[1],
      longitude: restaurant.location.coordinates[0],
      photos: restaurant.pictures,
      tel: restaurant.tel,
    }))

    const allGenres = new Set()
    allRestaurants.value.forEach((restaurant) => {
      restaurant.genres.forEach((genre) => allGenres.add(genre))
    })
    genreOptions.value = Array.from(allGenres).sort((a, b) => a.localeCompare(b))

    paginatedRestaurants.value = allRestaurants.value
    totalPages.value = Math.ceil(data.total / elementParPages)

    initMap()
  } catch (error) {
    console.error('Error fetching restaurants:', error)
  }
}

const handleInput = () => {
  showDropdown.value = searchQuery.value.length > 0
  if (searchQuery.value) {
    searchSuggestions.value = allRestaurants.value.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  } else {
    searchSuggestions.value = []
  }
  fetchRestaurants()
}

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const getStars = (rating) => {
  const fullStars = '★'.repeat(rating)
  const emptyStars = '☆'.repeat(5 - rating)
  return `${fullStars}${emptyStars}`
}

const initMap = () => {
  if (!map.value) {
    map.value = L.map('map').setView([46.8139, -71.2082], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value)
  }

  markers.value.forEach((marker) => marker.remove())
  markers.value = []

  paginatedRestaurants.value.forEach((restaurant) => {
    if (restaurant.latitude && restaurant.longitude) {
      const marker = L.marker([restaurant.latitude, restaurant.longitude])
        .addTo(map.value)
        .bindPopup(`<b>${restaurant.name}</b><br>${restaurant.address}`)
      markers.value.push(marker)
    }
  })

  if (navigator.geolocation && isInitialLoad.value) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords

      const redIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      if (userMarker.value) {
        userMarker.value.setLatLng([latitude, longitude])
      } else {
        userMarker.value = L.marker([latitude, longitude], { icon: redIcon })
          .addTo(map.value)
          .bindPopup('You are here!')
          .openPopup()
      }

      map.value.setView([latitude, longitude], 14)
    })

    isInitialLoad.value = false
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    fetchRestaurants()
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    fetchRestaurants()
  }
}

watch([searchQuery, selectedPrice, selectedGenre], () => {
  currentPage.value = 0
  fetchRestaurants()
})

onMounted(async () => {
  await fetchRestaurants()
  initMap()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
}

button {
  font-size: 1rem;
  border: none;
  outline: none;
  border-radius: 15px;
  background-color: white;
  color: black;
  padding: 10px 20px;
  transition:
    background-color 0.3s,
    color 0.3s,
    text-decoration 0.3s;
}

button:hover {
  background-color: #2a9d8f;
  color: white;
  text-decoration: underline;
  cursor: pointer;
}

.search-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin: 0 auto 40px;
}

.search-bar {
  position: relative;
  width: 60%;
}

.search-bar input {
  padding: 12px 15px;
  border: 2px solid #2a9d8f;
  border-radius: 25px;
  width: 100%;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.search-bar input:focus {
  outline: none;
  box-shadow: 0 2px 8px rgba(42, 157, 143, 0.4);
  border-color: #2a9d8f;
}

.dropdown li {
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown li:hover {
  background: #e6f5f3;
  color: #2a9d8f;
}

.filter-bar {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  width: 35%;
}

.filter-bar select {
  padding: 10px 15px;
  border: 2px solid #2a9d8f;
  border-radius: 20px;
  background-color: white;
  color: #444;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232a9d8f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 35px;
  min-width: 120px;
}

.filter-bar select:focus {
  outline: none;
  box-shadow: 0 2px 8px rgba(42, 157, 143, 0.4);
}

.filter-bar select:hover {
  background-color: #f0f8f7;
}

.Acceuil {
  background-image: url(/src/Pictures/image3.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  width: 100%;
  height: 700px;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: flex-start;
}

@media screen and (max-width: 768px) {
  .Acceuil {
    background-image: url(/src/Pictures/Image1.png);
    background-attachment: scroll;
  }

  .search-container {
    flex-direction: column;
    width: 90%;
  }

  .search-bar {
    width: 100%;
    margin-bottom: 15px;
  }

  .filter-bar {
    width: 100%;
    justify-content: center;
  }
}

.text {
  position: absolute;
  padding: 10px;
  font-size: 50px;
  left: 5%;
  top: 25%;
  justify-content: center;
  font-family: 'Sour Gummy', serif;
  font-optical-sizing: auto;
  width: 50%;
}

@media screen and (max-width: 768px) {
  .text {
    top: 10%;
    width: 80%;
    left: 10%;
  }
}

.color {
  color: #2a9d8f;
}

.text p {
  font-size: 22px;
}

.restaurants {
  background-color: #ffe8d6;
  text-align: center;
  padding-top: 100px;
}

.restaurant-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  padding-top: 30px;
  text-align: center;
  margin-top: 4rem;
}

.restaurant-card {
  background-color: #fff;
  border-radius: 15px;
  padding: 15px;
  width: 300px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  border: 2px solid #2a9d8f;
}

.restaurant-header {
  margin-bottom: 10px;
}

.restaurant-name {
  font-size: 18px;
  font-weight: bold;
  color: #2a9d8f;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 90%;
  margin: 0 auto;
}

.restaurant-tel {
  font-size: 14px;
  color: #555;
}

.restaurant-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.restaurant-info {
  margin-top: 10px;
}

.restaurant-address {
  font-size: 12px;
  color: #444;
  margin-bottom: 5px;
}

.restaurant-rating {
  font-size: 16px;
  font-weight: bold;
  color: #d2691e;
}

.details-button {
  display: block;
  text-decoration: none;
  background-color: #2a9d8f;
  color: white;
  padding: 8px;
  border-radius: 6px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.details-button:hover {
  background-color: #1d6f63;
}

.review-button-card {
  margin-top: 10px;
}

.geo-section {
  text-align: center;
}

.geo-section h2 {
  font-size: 30px;
  color: #2a9d8f;
  border-bottom: 4.5px solid #2a9d8f;
  padding-bottom: 7.5px;
  margin-bottom: 22.5px;
}

#map {
  width: 85%;
  height: 500px;
  border-radius: 12px;
  border: 3px solid #2a9d8f;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.review-button-card {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  background-color: #2a9d8f;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
