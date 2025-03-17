import axios from 'axios'
import { UNSECURE_URL } from '@/api/api.js'

export async function getUserById(userId) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/users`)

    if (response.data.items) {
      const user = response.data.items.find((u) => u.id === userId)
      return user || null
    }
    return null
  } catch (error) {
    console.error(`Erreur API - getUserById (${userId}):`, error)
    throw new Error(error.response?.data?.message || error.message)
  }
}
