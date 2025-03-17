<template>
  <div v-if="restaurant && !restaurant.error" class="restaurant-page">
    <header class="restaurant-header">
      <h1 class="restaurant-name">🍽️ {{ restaurant.name }}</h1>
      <p class="restaurant-address">📍 {{ restaurant.address }}</p>
      <p class="restaurant-phone">📞 {{ restaurant.tel }}</p>
    </header>

    <div class="main-content">
      <div class="info-container">
        <div class="hours-section">
          <h2>🕒 Opening Hours</h2>
          <ul class="hours-list">
            <li><span>Monday :</span> {{ restaurant.opening_hours.monday }}</li>
            <li><span>Tuesday :</span> {{ restaurant.opening_hours.tuesday }}</li>
            <li><span>Wednesday :</span> {{ restaurant.opening_hours.wednesday }}</li>
            <li><span>Thursday :</span> {{ restaurant.opening_hours.thursday }}</li>
            <li><span>Friday :</span> {{ restaurant.opening_hours.friday }}</li>
            <li><span>Saturday :</span> {{ restaurant.opening_hours.saturday }}</li>
            <li><span>Sunday :</span> {{ restaurant.opening_hours.sunday }}</li>
          </ul>
        </div>
        <div class="details-section">
          <h2>ℹ️ Additional information</h2>
          <p><strong>🍴 Cuisine Type :</strong> {{ restaurant.genres.join(', ') }}</p>
          <p><strong>💰 Price Range :</strong> {{ restaurant.price_range }}/5</p>
          <p><strong>⭐ Grade :</strong> {{ restaurant.rating.toFixed(1) }}/5</p>
        </div>
      </div>
      <div class="button-container">
        <FavoriteAddButton
          :restaurant-id="restaurant.id"
          :restaurant-name="restaurant.name"
          :user-id="USER_ID"
        />
        <ReviewButton :restaurant-id="restaurant.id" class="review-button-card" />
      </div>
      <div class="photos-section">
        <h2>📸 Pictures</h2>
        <div class="carousel">
          <button
            v-if="restaurant.pictures && restaurant.pictures.length > 1"
            class="arrow left-arrow"
            @click="prevImage"
          >
            &larr;
          </button>
          <div class="image-container">
            <img
              v-if="restaurant.pictures && restaurant.pictures.length > 0"
              :src="restaurant.pictures[currentImageIndex]"
              alt="Restaurant Image"
              class="image-restau"
            />
            <div v-else class="no-image">Aucune image disponible</div>
          </div>
          <button
            v-if="restaurant.pictures && restaurant.pictures.length > 1"
            class="arrow right-arrow"
            @click="nextImage"
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
    <div class="geo-section">
      <h2>📍 Geographic Location</h2>
      <div id="map" class="map-container"></div>
      <button class="direction-button" @click="openGoogleMaps">🚗 Get Directions</button>
    </div>
  </div>
  <div v-else-if="restaurant && restaurant.error" class="error-container">
    <p>Une erreur est survenue lors du chargement des données du restaurant.</p>
    <p>Veuillez réessayer plus tard ou contacter le support.</p>
  </div>
  <div v-else-if="loading" class="loading-container">
    <p>Chargement en cours...</p>
  </div>
  <div v-else class="error-container">
    <p>Restaurant non trouvé!</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getRestaurantById } from '@/api/restaurantApi.js'
import ReviewButton from '@/components/restaurantVisitebutton.vue'
import FavoriteAddButton from '@/components/favoritesAddbutton.vue'
import { USER_ID } from '@/api/api'

const route = useRoute()
const loading = ref(true)
const restaurantId = route.params.id
const restaurant = ref(null)
const map = ref(null)
const currentImageIndex = ref(0)

onMounted(async () => {
  try {
    restaurant.value = await getRestaurantById(restaurantId)

    if (restaurant.value && restaurant.value.location) {
      initMap()
    } else {
      console.error('No location data found for the restaurant.')
    }
  } catch (error) {
    console.error('Error fetching restaurant:', error)
  } finally {
    loading.value = false
  }
})

const initMap = () => {
  if (!restaurant.value || !restaurant.value.location.coordinates) {
    console.error('Latitude and longitude are missing.')
    return
  }

  setTimeout(() => {
    map.value = L.map('map').setView(
      [restaurant.value.location.coordinates[1], restaurant.value.location.coordinates[0]],
      16,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value)

    L.marker([restaurant.value.location.coordinates[1], restaurant.value.location.coordinates[0]])
      .addTo(map.value)
      .bindPopup(`<b>${restaurant.value.name}</b><br>${restaurant.value.address}`)
      .openPopup()
  }, 500)
}

const openGoogleMaps = () => {
  if (restaurant.value && restaurant.value.location) {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${restaurant.value.location.coordinates[1]},${restaurant.value.location.coordinates[0]}`,
      '_blank',
    )
  }
}

const nextImage = () => {
  if (restaurant.value && restaurant.value.pictures) {
    currentImageIndex.value = (currentImageIndex.value + 1) % restaurant.value.pictures.length
  }
}

const prevImage = () => {
  if (restaurant.value && restaurant.value.pictures) {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + restaurant.value.pictures.length) %
      restaurant.value.pictures.length
  }
}
</script>

<style scoped>
.restaurant-page {
  font-family: 'Arial', sans-serif;
  margin: 20px auto;
  padding: 20px;
  max-width: 1000px;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ffe8d6, #ffe8d6);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #ddd;
}

.restaurant-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  background-color: #ffe8d6;
}

.restaurant-name {
  font-size: 36px;
  color: #2a9d8f;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
}

.restaurant-address,
.restaurant-phone {
  font-size: 18px;
  color: #616161;
  margin: 5px 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.info-container {
  display: flex;
  gap: 20px;
}

.hours-section,
.details-section {
  flex: 1;
}

.hours-section h2,
.details-section h2 {
  font-size: 24px;
  color: #2a9d8f;
  border-bottom: 3px solid #2a9d8f;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hours-list li {
  font-size: 18px;
  padding: 5px 0;
  color: #333;
  border-bottom: 1px dotted #ddd;
}

.hours-list li span {
  color: #2a9d8f;
  font-weight: bold;
}

.details-section p {
  font-size: 18px;
  margin: 10px 0;
  color: #333;
  background: #e3f2fd;
  border-left: 5px solid #2a9d8f;
  padding: 10px;
  border-radius: 5px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.photos-section {
  width: 100%;
}

.photos-section h2 {
  font-size: 24px;
  color: #2a9d8f;
  border-bottom: 3px solid #2a9d8f;
  padding-bottom: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  max-width: 90%;
}

.image-container {
  max-width: 100%;
  overflow: hidden;
}

.image-restau {
  max-width: 100%;
  height: auto;
  max-height: 600px;
  border-radius: 8px;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 30px;
  color: black;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.arrow:hover {
  opacity: 1;
}

.left-arrow {
  left: -40px;
}

.right-arrow {
  right: -40px;
}

.geo-section {
  text-align: center;
}

.geo-section h2 {
  font-size: 24px;
  color: #2a9d8f;
  border-bottom: 3px solid #2a9d8f;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

#map {
  height: 350px;
  border-radius: 8px;
  border: 2px solid #2a9d8f;
  margin-bottom: 15px;
}

.direction-button {
  padding: 12px 20px;
  font-size: 16px;
  background: #2a9d8f;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
}

.direction-button:hover {
  background: #21867a;
}

@media (max-width: 768px) {
  .info-container {
    flex-direction: column;
  }

  .hours-section,
  .details-section {
    width: 100%;
  }
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
}

.favorite-button:hover :hover {
  background-color: #21867a;
}

.review-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: white;
  border-bottom: none;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

@media (max-width: 600px) {
  .review-modal {
    width: 95%;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
