import { UNSECURE_URL } from '@/api/api.js'
import axios from 'axios'

export async function submitRestaurantReview(userId, visitData) {
  try {
    const response = await axios.post(
      `${UNSECURE_URL}/users/${userId}/restaurants/visits`,
      visitData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Erreur API :', error)
    throw error
  }
}

export async function getRestaurantVisits(userId) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/users/${userId}/restaurants/visits?limit=max`)

    if (!response.data.items || !Array.isArray(response.data.items)) {
      throw new Error('Unexpected API response format')
    }

    const sortedItems = response.data.items.sort((a, b) => {
      return new Date(b.date) - new Date(a.date)
    })

    return {
      items: sortedItems.slice(0, 10),
      total: response.data.total,
    }
  } catch (error) {
    console.error('Error fetching restaurant visits:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export async function getVisitByRestaurantId(restaurantVisits, visit_id) {
  const currentVisit = restaurantVisits.find((item) => item.visit.id === visit_id)

  return currentVisit
}
