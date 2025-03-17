<template>
  <div class="favorites-container">
    <h1 class="favorites-title">{{ $route.params.playlistName }}</h1>
    <button @click="supprimeListeClicked()">delete favorite list</button>
    <button @click="modify_name_triggered = true">change name</button>
    <button @click="add_restaurant = true">add restaurant</button>

    <div v-if="modify_name_triggered">
      <div>
        <h2>Enter new name</h2>
        <input v-model="favoriteName" type="text" placeholder="Favorite Name" />
        <div>
          <button @click="modifier_nom_liste()">Save</button>
          <button @click="modify_name_triggered = false">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="add_restaurant" class="add-restaurant-container">
      <h2 class="add-restaurant-title">Add Restaurant</h2>
      <div class="search-wrapper">
        <div class="search-container">
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
              <div v-if="searchResults.length > 0">
                <div
                  v-for="restaurant in searchResults"
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
        <button @click="add_restaurant = false" class="cancel-button">Cancel</button>
      </div>
    </div>

    <hr class="title-underline" />

    <div class="restaurant-list">
      <div class="restaurant-card" v-for="restaurant in restaurants" :key="restaurant.id">
        <div class="restaurant-header">
          <h2 class="restaurant-name">{{ restaurant.name }}</h2>
          <p class="restaurant-tel">📞 {{ restaurant.tel }}</p>
        </div>
        <img :src="restaurant.photos[0]" alt="Restaurant Image" class="restaurant-image" />
        <div class="restaurant-info">
          <p class="restaurant-address">📍 {{ restaurant.address }}</p>
          <p class="restaurant-rating" v-html="getStars(restaurant.rating)"></p>
        </div>
        <router-link :to="'/restaurant/' + restaurant.id" class="details-button"
          >View Details</router-link
        >
        <button @click="removeRestaurantFromList(restaurant)" class="remove-button">
          Remove from List
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getFavoriteListByName,
  supprimeListe,
  change_playlist_name,
  removeRestaurantFromFavoriteList,
  addRestaurantToFavoriteList,
} from '@/api/favoriteListApi'
import { getRestaurantById, searchRestaurants } from '@/api/restaurantApi.js'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const restaurants = ref([])
    const modify_name_triggered = ref(false)
    const favoriteName = ref('')
    const add_restaurant = ref(false)
    const searchQuery = ref('')
    const searchResults = ref([])
    const showSearchDropdown = ref(false)

    const debouncedHandleInput = debounce(async () => {
      if (searchQuery.value.trim() !== '') {
        try {
          const data = await searchRestaurants({ q: searchQuery.value })
          searchResults.value = data.items.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
          }))
        } catch (error) {
          console.error('Error fetching restaurants:', error)
        }
      } else {
        searchResults.value = []
      }
    }, 300)

    const hideSearchDropdown = () => {
      setTimeout(() => {
        showSearchDropdown.value = false
      }, 200)
    }

    const handleSearch = async () => {
      if (searchQuery.value.length > 0 && searchResults.value.length > 0) {
        const firstRestaurant = searchResults.value[0]
        await addRestaurantToList(firstRestaurant.id)
        searchQuery.value = ''
        searchResults.value = []
        showSearchDropdown.value = false
        debouncedHandleInput()
      }
    }

    const selectSuggestion = async (restaurant) => {
      await addRestaurantToList(restaurant.id)
      searchQuery.value = ''
      searchResults.value = []
      showSearchDropdown.value = false
      debouncedHandleInput()
    }

    const addRestaurantToList = async (restaurantId) => {
      try {
        const listId = route.params.playlistId
        await addRestaurantToFavoriteList(listId, restaurantId)

        const userId = '639bb14d2b5bb7844f42416c'
        const favoriteList = await getFavoriteListByName(userId, route.params.playlistName)
        if (favoriteList && favoriteList.restaurants) {
          const restaurantDetails = await Promise.all(
            favoriteList.restaurants.map(async (restaurant) => {
              try {
                const details = await getRestaurantById(restaurant.id)
                return {
                  id: details.id,
                  name: details.name,
                  address: details.address,
                  rating: Math.round(details.rating),
                  photos: details.pictures,
                  tel: details.tel,
                }
              } catch (error) {
                console.error(`Error fetching restaurant ${restaurant.id}:`, error)
                return null
              }
            }),
          )
          restaurants.value = restaurantDetails.filter((restaurant) => restaurant !== null)
          add_restaurant.value = false
        }
      } catch (error) {
        console.error('Error adding restaurant to list:', error)
        alert(`Error: ${error.message || 'Failed to add restaurant to the list.'}`)
      }
    }

    const removeRestaurantFromList = async (restaurant) => {
      try {
        const restaurantId = restaurant.id
        await removeRestaurantFromFavoriteList(route.params.playlistId, restaurantId)
        restaurants.value = restaurants.value.filter((r) => r.id !== restaurantId)
      } catch (error) {
        console.error('Error deleting from playlist:', error)
      }
    }

    const modifier_nom_liste = async () => {
      modify_name_triggered.value = true
      await change_playlist_name(favoriteName.value, route.params.playlistId)
      router.push({
        name: 'PlaylistDescription',
        params: {
          playlistName: favoriteName.value,
          playlistId: route.params.playlistId,
          userId: route.params.userId,
        },
      })
    }

    const supprimeListeClicked = async () => {
      try {
        const userId = '639bb14d2b5bb7844f42416c'
        const playlistName = route.params.playlistName
        const favoriteList = await getFavoriteListByName(userId, playlistName)
        const playlistId = favoriteList.id
        await supprimeListe(playlistId)
        router.push({ name: 'User' })
      } catch (error) {
        console.error('Error deleting playlist:', error)
      }
    }

    onMounted(async () => {
      try {
        const userId = '639bb14d2b5bb7844f42416c'
        const favoriteList = await getFavoriteListByName(userId, route.params.playlistName)

        if (favoriteList && favoriteList.restaurants) {
          const restaurantDetails = await Promise.all(
            favoriteList.restaurants.map(async (restaurant) => {
              try {
                const details = await getRestaurantById(restaurant.id)
                return {
                  id: details.id,
                  name: details.name,
                  address: details.address,
                  rating: Math.round(details.rating),
                  photos: details.pictures,
                  tel: details.tel,
                }
              } catch (error) {
                console.error(`Error fetching restaurant ${restaurant.id}:`, error)
                return null
              }
            }),
          )
          restaurants.value = restaurantDetails.filter((restaurant) => restaurant !== null)
        }
      } catch (error) {
        console.error('Error fetching favorite restaurants:', error)
      }
    })

    const getStars = (rating) => {
      const fullStars = '★'.repeat(rating)
      const emptyStars = '☆'.repeat(5 - rating)
      return `<span class="star-rating">${fullStars}${emptyStars}</span>`
    }

    return {
      restaurants,
      getStars,
      supprimeListeClicked,
      removeRestaurantFromList,
      modifier_nom_liste,
      modify_name_triggered,
      favoriteName,
      add_restaurant,
      searchQuery,
      searchResults,
      showSearchDropdown,
      debouncedHandleInput,
      hideSearchDropdown,
      handleSearch,
      selectSuggestion,
    }
  },
}
</script>

<style scoped>
.favorites-container {
  font-family: 'Arial', sans-serif;
  margin: 20px auto;
  padding: 20px;
  max-width: 1000px;
  border-radius: 12px;
  background: linear-gradient(to bottom, #ffe8d6, #ffe8d6);
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #ddd;
  text-align: center;
}

.favorites-title {
  font-size: 42px;
  color: #2a9d8f;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 10px;
}

.title-underline {
  width: 75%;
  margin: 0 auto 20px;
  border: 2px solid #2a9d8f;
}

.restaurant-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
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

.star-rating {
  font-size: 16px;
  color: #ffc107;
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

.remove-button {
  display: block;
  background-color: #ff4d4d;
  color: white;
  padding: 8px;
  border-radius: 6px;
  margin-top: 10px;
  transition: background-color 0.3s;
  border: none;
  cursor: pointer;
  width: 100%;
}

.remove-button:hover {
  background-color: #cc0000;
}

.add-restaurant-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.add-restaurant-title {
  margin-bottom: 20px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 500px;
}

.search-container {
  flex: 1;
}

.search-dropdown {
  display: flex;
  align-items: center;
  position: relative;
}

.search-dropdown input {
  width: 100%;
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

.cancel-button {
  padding: 8px 16px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.cancel-button:hover {
  background-color: #cc0000;
}
</style>
