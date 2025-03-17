<template>
  <div class="container">
    <h1>User Profile</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="info"><strong>Name:</strong> {{ userProfile.name.replace(/"/g, '') }}</div>
      <div class="info"><strong>Score:</strong> {{ userProfile.score }}</div>
      <div class="button-container">
        <button @click="showRestaurants">Show visits</button>
        <button @click="hideRestaurants">Hide visits</button>
        <button @click="toggleFavoritesList">Show List of Favorites</button>
      </div>
      <div v-if="showRestaurantsList" class="restaurant-section">
        <h2 v-if="userProfile.RestaurantVisits.length">Recently Visited Restaurants</h2>
        <ul>
          <li
            v-for="restaurant in userProfile.RestaurantVisits"
            :key="restaurant.visit.restaurant_id"
          >
            {{ restaurant.name }} - {{ formatDate(restaurant.visit.date) }}
            <button @click="showMyVisit(restaurant.visit.id)">Details of my visit</button>
          </li>
          <div v-if="visitPopup" class="popup-overlay">
            <div class="popup-content">
              <button class="close-btn" @click="visitPopup = false">✖</button>
              <h2>Visit Details</h2>
              <p><strong>Comment:</strong> {{ currentVisit.visit.comment }}</p>
              <p><strong>Rating:</strong> {{ currentVisit.visit.rating }}</p>
              <p><strong>Date:</strong> {{ formatDate(currentVisit.visit.date) }}</p>
            </div>
          </div>
        </ul>
        <div v-if="!userProfile.RestaurantVisits.length" class="no-restaurant">
          <p>No restaurants to display. The list is empty.</p>
          <a href="/">Return to Home</a>
        </div>
      </div>
      <div v-if="showFavoriteList" class="favorites-section">
        <h2 v-if="userProfile.favoriteRestaurants.length">Favorite Restaurants</h2>
        <ul>
          <button @click="newFavoriteAddSection = true">Add new list</button>
          <li
            v-for="favorite in userProfile.ListOfFavorites"
            :key="favorite.id"
            @click="openPlaylist(favorite.name, favorite.id)"
          >
            {{ favorite.name }}
          </li>
        </ul>
        <div v-if="!userProfile.ListOfFavorites.length" class="no-favorite">
          <p>No favorite restaurants to display.</p>
        </div>
        <div v-if="newFavoriteAddSection">
          <div>
            <h2>Enter a Name</h2>
            <input v-model="favoriteName" type="text" placeholder="Favorite Name" />
            <div>
              <button @click="openNewFavorite">Save</button>
              <button @click="newFavoriteAddSection = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserById } from '@/api/userApi.js'
import { getFavoriteListsNames, createNewFavoriteList } from '@/api/favoriteListApi.js'
import { getRestaurantVisits, getVisitByRestaurantId } from '@/api/visitApi.js'
import { getRestaurantById } from '@/api/restaurantApi.js'
import { ref } from 'vue'
import { USER_ID } from '@/api/api'

export default {
  data() {
    return {
      userProfile: {
        name: 'Robert',
        email: '123@gmail.com',
        userId: USER_ID,
        score: 0,
        restaurants: [],
        favoriteRestaurants: [],
        ListOfFavorites: [],
        visits: [],
        RestaurantVisits: [],
      },
      favoriteName: '',
      currentVisit: ref({ visit: { comment: '', date: '', rating: '' }, name: '' }),
      loading: true,
      error: null,
      showRestaurantsList: false,
      showFavoriteList: false,
      newFavoriteAddSection: false,
      visitPopup: false,
    }
  },
  async created() {
    try {
      const user = await getUserById(USER_ID)
      if (user) {
        this.userProfile.name = user.name
        this.userProfile.score = user.rating
      } else {
        this.error = 'User not found.'
      }
    } catch {
      this.error = 'Error loading user.'
    } finally {
      this.loading = false
    }
  },
  methods: {
    async showRestaurants() {
      this.showRestaurantsList = true
      try {
        this.loading = true
        this.userProfile.visits = await getRestaurantVisits(USER_ID)
        this.userProfile.RestaurantVisits = await Promise.all(
          this.userProfile.visits.items.map(async (visit) => {
            const restaurantName = await this.getNameOfTheVisitedRestaurant(visit)
            return { visit, name: restaurantName }
          }),
        )
      } catch {
        this.error = 'Error loading restaurants.'
      } finally {
        this.loading = false
      }
    },
    async getNameOfTheVisitedRestaurant(visit) {
      const restaurant = await getRestaurantById(visit.restaurant_id)
      return restaurant.name
    },
    hideRestaurants() {
      this.showRestaurantsList = false
      this.userProfile.restaurants = []
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    async toggleFavoritesList() {
      if (!this.showFavoriteList) {
        try {
          this.loading = true

          this.userProfile.ListOfFavorites = await getFavoriteListsNames(USER_ID)
        } catch {
          this.error = 'Error loading favorite restaurants.'
        } finally {
          this.loading = false
        }
      }
      this.showFavoriteList = !this.showFavoriteList
    },
    openPlaylist(name, id) {
      this.$router.push({
        name: 'PlaylistDescription',
        params: { playlistName: name, playlistId: id },
      })
    },
    async openNewFavorite() {
      if (!this.favoriteName) return
      try {
        await createNewFavoriteList(this.favoriteName)
        this.userProfile.ListOfFavorites = await getFavoriteListsNames(USER_ID)
        this.favoriteName = ''
        this.newFavoriteAddSection = false
      } catch {
        this.error = 'Error creating favorite.'
      }
    },
    async showMyVisit(visit_id) {
      this.visitPopup = true
      this.currentVisit = await getVisitByRestaurantId(this.userProfile.RestaurantVisits, visit_id)
    },
  },
}
</script>

<style scoped>
.container {
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f3e7e9, #e3eeff);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.button-container button,
.restaurant-section ul li button,
.favorites-section button {
  padding: 8px 15px;
  border-radius: 20px;
  border: none;
  background-color: hsl(173, 58%, 39%);
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.button-container button:hover,
.restaurant-section ul li button:hover,
.favorites-section button:hover {
  background-color: hsl(173, 58%, 39%);
}

.restaurant-section ul,
.favorites-section ul {
  list-style: none;
  padding: 0;
}

.restaurant-section li,
.favorites-section li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.error {
  color: red;
}
</style>
