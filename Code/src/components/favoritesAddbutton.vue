<template>
  <div>
    <button class="favorite-button" @click="openFavoriteModal">
      ⭐ {{ isFavorite ? 'Restaurant favoris' : 'Add to Favorites' }}
    </button>
    <div v-if="showFavoriteForm" class="favorite-modal-overlay">
      <div class="favorite-modal">
        <div class="favorite-modal-header">
          <h2>⭐ Add to Favorites</h2>
        </div>
        <form @submit.prevent="addToSelectedFavoriteList" class="favorite-form">
          <div v-if="favoriteListsLoading">
            <p>Chargement des listes de favoris...</p>
          </div>
          <div v-else>
            <div v-if="favoriteLists.length > 0" class="form-group">
              <label for="favoriteList">Chose a favorite list:</label>
              <select
                id="favoriteList"
                v-model="selectedFavoriteListId"
                required
                class="form-input"
              >
                <option value="" disabled selected>Select a List</option>
                <option v-for="list in favoriteLists" :key="list.id" :value="list.id">
                  {{ list.name }}
                </option>
              </select>
            </div>
            <div v-else class="form-group no-lists">
              <p>You don't have any lists.</p>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showFavoriteForm = false">
              Cancel
            </button>
            <button type="submit" class="submit-button" :disabled="!selectedFavoriteListId">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getFavoriteListsNames, addRestaurantToFavoriteList } from '@/api/favoriteListApi.js'

const props = defineProps({
  restaurantId: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    default: '639bb14d2b5bb7844f42416c',
  },
})

const emit = defineEmits(['favorite-added'])

const favoriteListsLoading = ref(true)
const selectedFavoriteListId = ref('')
const favoriteLists = ref([])
const isFavorite = ref(false)
const showFavoriteForm = ref(false)

const openFavoriteModal = async () => {
  showFavoriteForm.value = true

  try {
    favoriteListsLoading.value = true
    favoriteLists.value = await getFavoriteListsNames(props.userId)
  } catch (error) {
    console.error('Error fetching favorite lists:', error)
  } finally {
    favoriteListsLoading.value = false
  }
}

const addToSelectedFavoriteList = async () => {
  if (!selectedFavoriteListId.value) {
    alert('Veuillez sélectionner une liste de favoris.')
    return
  }

  try {
    const selectedList = favoriteLists.value.find(
      (list) => list.id === selectedFavoriteListId.value,
    )

    if (!selectedList) {
      throw new Error(`Liste de favoris non trouvée: ${selectedFavoriteListId.value}`)
    }

    await addRestaurantToFavoriteList(selectedList.id, props.restaurantId)

    showFavoriteForm.value = false
    isFavorite.value = true

    emit('favorite-added', {
      listName: selectedList.name,
      listId: selectedList.id,
    })
  } catch (error) {
    console.error('Error adding restaurant to favorite list:', error)
    alert(
      `Erreur: ${error.message || "Une erreur est survenue lors de l'ajout du restaurant aux favoris."}`,
    )
  }
}
</script>

<style scoped>
.favorite-button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 150px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2a9d8f;
  color: white;
}

.favorite-button:hover {
  background-color: #21867a;
}

.favorite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.favorite-modal {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.favorite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #2a9d8f;
  color: white;
}

.favorite-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: white;
  border-bottom: none;
}

.favorite-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
}

.submit-button {
  background-color: #2a9d8f;
  color: white;
}

.cancel-button:hover {
  background-color: #d0d0d0;
}

.submit-button:hover {
  background-color: #21867a;
}

@media (max-width: 600px) {
  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
