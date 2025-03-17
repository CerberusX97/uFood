import { UNSECURE_URL } from '@/api/api.js'
import axios from 'axios'

export async function getRestaurantById(id) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/restaurants/${id}`)
    return response.data
  } catch (error) {
    console.error('API fetch error:', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export async function getAllRestaurants({
  limit = 10,
  page = 0,
  q = '',
  genres = '',
  price_range = '',
}) {
  try {
    const params = {
      limit,
      page,
    }

    if (q) params.q = q
    if (genres) params.genres = genres
    if (price_range) params.price_range = price_range

    const response = await axios.get(`${UNSECURE_URL}/restaurants`, {
      params,
    })
    return response.data
  } catch (error) {
    console.error('API fetch error: ', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}

export async function searchRestaurants({ q = '' }) {
  try {
    const response = await axios.get(`${UNSECURE_URL}/restaurants`, {
      params: {
        q,
      },
    })
    return response.data
  } catch (error) {
    console.error('API fetch error: ', error)
    throw new Error(error.response?.data?.message || error.message)
  }
}
