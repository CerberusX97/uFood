import { UNSECURE_URL } from '@/api/api.js'
import axios from 'axios'

export async function addRestaurantToFavoriteList(listId, restaurantId) {
  try {
    const response = await axios.post(
      `${UNSECURE_URL}/favorites/${listId}/restaurants`,
      { id: restaurantId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error adding restaurant to favorite list:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export async function removeRestaurantFromFavoriteList(listId, restaurantId) {
  try {
    const response = await axios.delete(
      `${UNSECURE_URL}/favorites/${listId}/restaurants/${restaurantId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error adding restaurant to favorite list:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export async function getFavoriteListByName(userId, name) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/users/${userId}/favorites`)

    if (!response.data.items || !Array.isArray(response.data.items)) {
      throw new Error('Unexpected API response format')
    }

    const favoriteList = response.data.items.find((item) => item.name === name)
    if (!favoriteList) {
      throw new Error(`No favorite list found with the name: ${name}`)
    }

    return favoriteList
  } catch (error) {
    console.error('Error while fetching the favorite list:', error)
    throw error
  }
}

export async function supprimeListe(favoriteId) {
  try {
    const response = await axios.delete(`${UNSECURE_URL}/favorites/${favoriteId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('API error:', error.response?.data || error.message)
    throw error
  }
}

export async function createNewFavoriteList(favoriteName) {
  try {
    const payload = {
      name: favoriteName,
      owner: ' "123@gmail.com"',
    }

    const response = await axios.post(`${UNSECURE_URL}/favorites`, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}

export async function getFavoriteListsNames(userId) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/users/${userId}/favorites`, {
      limit: 10,
    })

    if (!response.data.items || !Array.isArray(response.data.items)) {
      throw new Error('Unexpected API response format')
    }

    const favoriteLists = response.data.items.map((item) => ({
      name: item.name,
      id: item.id,
    }))

    return favoriteLists
  } catch (error) {
    console.error('Error while fetching favorites:', error)
    throw error
  }
}

export async function change_playlist_name(favoriteName, favoriteId) {
  try {
    const payload = {
      name: favoriteName,
      owner: ' "123@gmail.com"',
    }

    const response = await axios.put(
      `${UNSECURE_URL}/favorites/${favoriteId}`,
      JSON.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}
