<template>
  <div v-if="restaurant" class="restaurant-page">
    <header class="restaurant-header">
      <h1 class="restaurant-name">🍽️ {{ restaurant.name }}</h1>
      <p class="restaurant-address">📍 {{ restaurant.address }}</p>
      <p class="restaurant-phone">📞 {{ restaurant.phone }}</p>
    </header>
    <div class="main-content">
      <div class="info-container">
        <div class="hours-section">
          <h2>🕒 Heures d'ouverture</h2>
          <ul class="hours-list">
            <li><span>Lundi :</span> {{ restaurant.hours.lundi }}</li>
            <li><span>Mardi :</span> {{ restaurant.hours.mardi }}</li>
            <li><span>Mercredi :</span> {{ restaurant.hours.mercredi }}</li>
            <li><span>Jeudi :</span> {{ restaurant.hours.jeudi }}</li>
            <li><span>Vendredi :</span> {{ restaurant.hours.vendredi }}</li>
            <li><span>Samedi :</span> {{ restaurant.hours.samedi }}</li>
            <li><span>Dimanche :</span> {{ restaurant.hours.dimanche }}</li>
          </ul>
        </div>
        <div class="details-section">
          <h2>ℹ️ Informations supplémentaires</h2>
          <p><strong>🍴 Genre :</strong> {{ restaurant.genre }}</p>
          <p><strong>💰 Fourchette de prix :</strong> {{ restaurant.price }}</p>
          <p><strong>⭐ Note :</strong> {{ restaurant.rating }}/5</p>
        </div>
      </div>
      <div class="photos-section">
        <h2>📸 Photo</h2>
        <div class="carousel">
          <button v-if="restaurant.photos.length > 1" class="arrow left-arrow" @click="prevImage">
            &larr;
          </button>
          <div class="image-container">
            <img
              :src="restaurant.photos[currentImageIndex]"
              alt="Restaurant Image"
              class="image-restau"
            />
          </div>
          <button v-if="restaurant.photos.length > 1" class="arrow right-arrow" @click="nextImage">
            &rarr;
          </button>
        </div>
      </div>
    </div>
    <div class="geo-section">
      <h2>📍 Position Géographique</h2>
      <div id="map"></div>
      <button class="direction-button" @click="openGoogleMaps">🚗 Obtenir les directions</button>
    </div>
  </div>
  <div v-else>
    <p>Restaurant not found!</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRestaurantData } from '@/assets/restaurantData.js'

const { restaurant, currentImageIndex, nextImage, prevImage } = useRestaurantData()
const map = ref(null)

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  initMap()
})

const initMap = () => {
  if (!restaurant.value || !restaurant.value.latitude || !restaurant.value.longitude) {
    console.error('Latitude and longitude are missing.')
    return
  }

  setTimeout(() => {
    map.value = L.map('map').setView([restaurant.value.latitude, restaurant.value.longitude], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value)

    L.marker([restaurant.value.latitude, restaurant.value.longitude])
      .addTo(map.value)
      .bindPopup(`<b>${restaurant.value.name}</b><br>${restaurant.value.address}`)
      .openPopup()
  }, 500)
}

const openGoogleMaps = () => {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${restaurant.value.latitude},${restaurant.value.longitude}`,
    '_blank',
  )
}

onMounted(() => {
  initMap()
})
</script>

<style scoped>
.restaurant-page {
  font-family: 'Arial', sans-serif;
  margin: 30px auto;
  padding: 30px;
  max-width: 1350px;
  border-radius: 18px;
  background: linear-gradient(to bottom, #ffe8d6, #ffe8d6);
  box-shadow: 0px 6px 30px rgba(0, 0, 0, 0.1);
  border: 3px solid #ddd;
}

.restaurant-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  background-color: #ffe8d6;
}

.restaurant-name {
  font-size: 54px;
  color: #2a9d8f;
  text-shadow: 1.5px 1.5px 4.5px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
}

.restaurant-address,
.restaurant-phone {
  font-size: 24px;
  color: #616161;
  margin: 7.5px 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 45px;
}

.info-container {
  display: flex;
  gap: 30px;
}

.hours-section,
.details-section {
  flex: 1;
}

.hours-section h2,
.details-section h2 {
  font-size: 30px;
  color: #2a9d8f;
  border-bottom: 4.5px solid #2a9d8f;
  padding-bottom: 7.5px;
  margin-bottom: 15px;
}

.hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hours-list li {
  font-size: 24px;
  padding: 7.5px 0;
  color: #333;
  border-bottom: 1.5px dotted #ddd;
}

.hours-list li span {
  color: #2a9d8f;
  font-weight: bold;
}

.details-section p {
  font-size: 24px;
  margin: 15px 0;
  color: #333;
  background: #e3f2fd;
  border-left: 7.5px solid #2a9d8f;
  padding: 15px;
  border-radius: 7.5px;
  box-shadow: inset 0 3px 7.5px rgba(0, 0, 0, 0.05);
}

.photos-section {
  width: 100%;
}

.photos-section h2 {
  font-size: 30px;
  color: #2a9d8f;
  border-bottom: 4.5px solid #2a9d8f;
  padding-bottom: 7.5px;
  margin-bottom: 22.5px;
}

.carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  max-width: 100%;
  overflow: hidden;
}

.image-restau {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  color: #2a9d8f;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.arrow:hover {
  opacity: 1;
}

.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
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

.map-placeholder {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #ffebee, #ffcdd2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c62828;
  font-size: 24px;
  border: 3px dashed #2a9d8f;
  border-radius: 12px;
  margin-bottom: 22.5px;
}

#map {
  width: 350;
  height: 350px;
  border-radius: 12px;
  border: 3px solid #2a9d8f;
  margin-bottom: 20px;
}

.direction-button {
  padding: 18px 30px;
  font-size: 24px;
  background: #2a9d8f;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 22.5px rgba(0, 0, 0, 0.2);
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
</style>
