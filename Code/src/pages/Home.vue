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
          <ul v-if="showDropdown && searchQuery" class="dropdown">
            <li
              v-for="suggestion in searchSuggestions"
              :key="suggestion.id"
              @click="selectSearch(suggestion.name)"
            >
              {{ suggestion.name }}
            </li>
          </ul>
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
            <option value="low">$ - Cheap</option>
            <option value="medium">$$ - Moderate</option>
            <option value="high">$$$ - Expensive</option>
          </select>
          <select v-model="selectedGenre">
            <option value="">Genre</option>
            <option value="italian">Italian</option>
            <option value="japanese">Japanese</option>
            <option value="halal">Halal</option>
            <option value="fast-food">Fast Food</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
      </div>
      <div class="all-restaurants" :key="selectedPrice + selectedGenre + searchQuery">
        <div class="restaurant" v-for="restaurant in filteredRestaurants" :key="restaurant.id">
          <div class="box">
            <img :src="restaurant.photos[0]" alt="" class="image-restau" />
            <h4 class="restaurant-title">{{ restaurant.name }}</h4>
            <p class="rating">{{ restaurant.rating }} stars</p>
            <a href="#" class="more"
              ><router-link :to="'/restaurant/' + restaurant.id">Show more</router-link></a
            >
          </div>
        </div>
      </div>
      <div class="geo-section">
        <h2>📍 Votre position</h2>
        <div id="map"></div>
      </div>
    </div>
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="footer-elements">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About us</a></li>
              <li><a href="#">Our services</a></li>
              <li><a href="#">Privacy policy</a></li>
              <li><a href="#">Affiliate program</a></li>
            </ul>
          </div>
          <div class="footer-elements">
            <h4>Get help</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Order status</a></li>
              <li><a href="#">Payment options</a></li>
            </ul>
          </div>
          <div class="footer-elements">
            <h4>Follow us</h4>
            <div class="social-link">
              <ul>
                <li>
                  <a href="#"><i class="fa-brands fa-facebook"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fa-brands fa-instagram"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fa-brands fa-twitter"></i></a>
                </li>
                <li>
                  <a href="#"><i class="fa-brands fa-linkedin"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRestaurantData } from '@/assets/restaurantData.js'

const {
  filteredRestaurants,
  searchQuery,
  selectedPrice,
  selectedGenre,
  showDropdown,
  searchSuggestions,
} = useRestaurantData()

const selectSearch = (name) => {
  searchQuery.value = name
  showDropdown.value = false
}

const handleInput = () => {
  showDropdown.value = searchQuery.value.length > 0
}

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const map = ref(null)
const markers = ref([])
const userMarker = ref(null)
const isInitialLoad = ref(true)
const initMap = () => {
  markers.value.forEach((marker) => marker.removeFrom(map.value))
  markers.value = []

  if (!filteredRestaurants.value || filteredRestaurants.value.length === 0) {
    console.log('No restaurants match the criteria.')
    return
  }

  if (!map.value) {
    map.value = L.map('map').setView(
      [filteredRestaurants.value[0].latitude, filteredRestaurants.value[0].longitude],
      13,
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.value)
  }

  filteredRestaurants.value.forEach((restaurant) => {
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
          .bindPopup('Vous êtes là!')
          .openPopup()
      }

      map.value.setView([latitude, longitude], 14)
    })

    isInitialLoad.value = false
  }
}

watch(filteredRestaurants, () => {
  initMap()
})

onMounted(() => {
  searchQuery.value = ''
  initMap()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#navigation {
  background-color: #ffe8d6;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  height: 90px;
  align-items: center;
  justify-content: space-evenly;
}

.item-navigation {
  padding: 2rem;
  justify-content: space-evenly;
}

#elements {
  color: black;
  justify-content: center;
  font-family: 'Markazi Text', serif;
  font-optical-sizing: auto;
  font-size: 20px;
}

.header {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px 100px;
  background: #2a9d8f;
  display: flex;
}

.menu {
  display: flex;
}

body {
  margin: 0;
  padding: 0;
}

#logo {
  font-size: 22px;
  font-family: 'Audiowide', serif;
  font-style: normal;
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
  text-decoration: none;
}

#icone {
  margin-right: 5px;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 15px;
  position: relative;
}

.search-bar input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 200px;
}

.search-bar button {
  padding: 8px;
  border: none;
  background: #2a9d8f;
  color: white;
  border-radius: 5px;
  margin-left: 5px;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  width: 200px;
  max-height: 150px;
  overflow-y: auto;
  list-style-type: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  bottom: 100%;
  left: 0;
  z-index: 1000;
}

.dropdown li {
  padding: 8px;
  cursor: pointer;
}

.dropdown li:hover {
  background: #2a9d8f;
  color: white;
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-section button:hover {
  background-color: #21867a;
}

.Acceuil {
  background-image: url(/src/Pictures/image3.png);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  width: 100%;
  height: 700px;
  margin: none;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: flex-start;
  margin-left: auto;
  margin-right: auto;
}

@media screen and (max-width: 768px) {
  .Acceuil {
    background-image: url(/src/Pictures/Image1.png);
    background-attachment: scroll;
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
  height: 2000px;
  text-align: center;
  padding-top: 100px;
}

.all-restaurants {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 5rem;
  justify-content: space-around;
  text-align: center;
  text-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
}

.restaurant {
  display: grid;
  overflow: hidden;
  border-radius: 15px;
  background-color: #ce6a85;
  margin: 10px;
  gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
}

.box {
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  height: 380px;
}

.image-restau {
  padding: 15px;
  height: 200px;
}

.restaurant-title {
  position: center;
  margin: none;
  border: none;

  font-size: 22px;
  margin: 0;
}

.rating {
  line-height: 1.8;
  font-size: 20px;
  padding: 10px 0;
  margin: 0;
}

.more {
  font-size: 1rem;
  border: none;
  outline: none;
  border-radius: 10px;
  background-color: white;
  color: black;
  padding: 10px 20px;
}

.footer {
  width: 100%;
  background-color: #ce6a85;
  padding: 70px 0;
}

ul {
  list-style: none;
}

.footer-elements {
  width: 25%;
  padding: 0 15px;
  height: 200px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
}

.footer-elements h4 {
  font-size: 18px;
  color: wheat;
  text-transform: capitalize;
  margin-bottom: 30px;
  font-weight: 500;
  position: relative;
}

.footer-elements h4::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -10px;
  background-color: white;
  height: 2px;
  box-sizing: border-box;
  width: 50px;
}

.footer-elements ul li :not(:last-child) {
  margin-bottom: 10px;
}

.footer-elements ul li a {
  font-size: 16px;
  text-transform: capitalize;
  text-decoration: none;
  font-weight: 300;
  color: antiquewhite;
  display: block;
  margin: 0 10px 10px 0;
}

.social-link ul li a {
  display: inline-block;
  margin-right: 10px;
  font-size: 24px;
  display: flex;
  gap: 10px;
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
  width: 80%;
  height: 500px;

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
  width: 85%;
  height: 500px;
  border-radius: 12px;
  border: 3px solid #2a9d8f;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  margin: 0 auto;
}
</style>
