import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
const restaurants = ref([
  {
    id: 1,
    name: 'Sushi Sakura',
    address: '3400 Chem. des Quatre-Bourgeois, Québec, QC G1W 2L3',
    latitude: 46.76371448995358,
    longitude: -71.31709720361108,
    phone: '(581) 981-8008',
    genre: 'Japanese',
    price: '$$',
    rating: 4.1,
    photos: ['/src/Pictures/sushi_sakura_1.jpg', '/src/Pictures/sushi_sakura_2.jpg'],
    hours: {
      lundi: '8h - 22h',
      mardi: 'fermé',
      mercredi: '8h - 22h',
      jeudi: '8h - 22h',
      vendredi: '17h - 22h',
      samedi: '9h - 23h',
      dimanche: '9h - 21h',
    },
  },
  {
    id: 2,
    name: "McDonald's",
    address: '5678 Rue Exemple, Ville',
    phone: '(418) 659-4484',
    latitude: 46.76628074217515,
    longitude: -71.29180018461419,
    genre: 'Fast Food',
    price: '$',
    rating: 5,
    photos: ['/src/Pictures/mcdo_1.jpg', '/src/Pictures/mcdo_2.jpg'],
    hours: {
      lundi: '8h - 22h',
      mardi: '8h - 22h',
      mercredi: '8h - 22h',
      jeudi: '8h - 22h',
      vendredi: '8h - 23h',
      samedi: '9h - 23h',
      dimanche: '9h - 21h',
    },
  },
  {
    id: 3,
    name: 'Subway pyramide',
    address: '2377 Ch Ste-Foy, Sainte-Foy–Sillery–Cap-Rouge, QC G1V 1T1',
    latitude: 46.785681576054365,
    longitude: -71.2818793454285,
    phone: '(123) 456-7892',
    genre: 'Japanese',
    price: '$$',
    rating: 5,
    photos: ['/src/Pictures/subway_1.jpg', '/src/Pictures/subway_2.jpg'],
    hours: {
      lundi: '8h - 22h',
      mardi: '8h - 22h',
      mercredi: '8h - 22h',
      jeudi: '8h - 22h',
      vendredi: '8h - 23h',
      samedi: '9h - 23h',
      dimanche: '9h - 21h',
    },
  },
  {
    id: 4,
    name: 'Pizza Pizza',
    address: '2360 Ch Ste-Foy, Québec, QC G1V 1T1',
    latitude: 46.786808752423354,
    longitude: -71.28183488960667,
    phone: '(123) 456-7893',
    genre: 'Pizza',
    price: '$$',
    rating: 5,
    photos: ['/src/Pictures/pizza_pizza_2.jpg', '/src/Pictures/pizza_pizza_1.jpg'],
    hours: {
      lundi: '8h - 22h',
      mardi: '8h - 22h',
      mercredi: '8h - 22h',
      jeudi: '8h - 22h',
      vendredi: '8h - 23h',
      samedi: '9h - 23h',
      dimanche: '9h - 21h',
    },
  },
  {
    id: 5,
    name: 'Amir',
    address: '2377 Ch Ste-Foy, Québec, QC G1V 1T1',
    latitude: 46.78572628299577,
    longitude: -71.28197362883563,
    phone: '(123) 456-7894',
    genre: 'Halal',
    price: '$$',
    rating: 5,
    photos: ['/src/Pictures/amir_1.jpg', '/src/Pictures/amir_2.jpg'],
    hours: {
      lundi: '8h - 22h',
      mardi: '8h - 22h',
      mercredi: '8h - 22h',
      jeudi: '8h - 22h',
      vendredi: '8h - 23h',
      samedi: '9h - 23h',
      dimanche: '9h - 21h',
    },
  },
])

const searchQuery = ref('')
const selectedPrice = ref('')
const selectedGenre = ref('')
const showDropdown = ref(false)

const filteredRestaurants = computed(() => {
  return restaurants.value.filter((restaurant) => {
    const query = searchQuery.value.toLowerCase().trim()
    const genreFilter = selectedGenre.value.toLowerCase().trim()
    const priceFilter = selectedPrice.value.trim()

    return (
      (!query || restaurant.name.toLowerCase().includes(query)) &&
      (!priceFilter ||
        (priceFilter === 'low' && restaurant.price === '$') ||
        (priceFilter === 'medium' && restaurant.price === '$$') ||
        (priceFilter === 'high' && restaurant.price === '$$$')) &&
      (!genreFilter || restaurant.genre.toLowerCase() === genreFilter)
    )
  })
})

const searchSuggestions = computed(() => {
  return filteredRestaurants.value.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

export function useRestaurantData() {
  const route = useRoute()
  const restaurantId = route.params.id
  const restaurant = computed(() => restaurants.value.find((r) => r.id == restaurantId))
  const currentImageIndex = ref(0)

  const nextImage = () => {
    currentImageIndex.value = (currentImageIndex.value + 1) % restaurant.value.photos.length
  }

  const prevImage = () => {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + restaurant.value.photos.length) %
      restaurant.value.photos.length
  }

  return {
    restaurants,
    restaurant,
    filteredRestaurants,
    searchQuery,
    selectedPrice,
    selectedGenre,
    showDropdown,
    searchSuggestions,
    currentImageIndex,
    nextImage,
    prevImage,
  }
}
