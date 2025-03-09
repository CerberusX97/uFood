<template>
  <div class="container">
    <h1>User Profile</h1>
    <div class="info">Name: {{ userProfile.name }}</div>
    <div class="info">Score: {{ userProfile.score }}</div>
    <!-- Boutons pour basculer entre les états -->
    <div class="button-container">
      <button @click="showRestaurants">Show Restaurants</button>
      <button @click="hideRestaurants">Hide Restaurants</button>
    </div>
    <div class="restaurant-section">
      <h2 v-if="userProfile.restaurants.length">Recently Visited Restaurants</h2>
      <ul>
        <li v-for="restaurant in userProfile.restaurants" :key="restaurant.id">
          {{ restaurant.name }} - Visits: {{ restaurant.visits }}
        </li>
      </ul>
      <div v-if="!userProfile.restaurants.length" class="no-restaurant">
        <p>No restaurants to display. The list is empty.</p>
        <a href="/">Return to Home</a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      userProfile: {
        name: 'Daniel',
        score: 90,
        restaurants: [],
      },
      // Example data to simulate a list of visited restaurants
      exampleRestaurants: [
        { id: 1, name: 'Sushi Sakura', visits: 2 },
        { id: 2, name: 'McDonald', visits: 3 },
        { id: 3, name: 'Subway pyramide', visits: 7 },
        { id: 4, name: 'Pizza Pizza', visits: 5 },
      ],
    }
  },
  methods: {
    showRestaurants() {
      // Fill the array with example restaurants
      this.userProfile.restaurants = this.exampleRestaurants
    },
    hideRestaurants() {
      // Empty the array
      this.userProfile.restaurants = []
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
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
}
h1 {
  color: #0e0500;
  text-align: center;
  font-size: 2.5em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
}
h2 {
  color: #0c0301;
  margin-top: 20px;
  text-decoration: underline;
}
.info {
  font-size: 1.2em;
  margin-bottom: 10px;
  font-weight: bold;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background-color: #2a9d8f; /* Changement en vert */
  margin: 5px 0;
  padding: 10px;
  border-radius: 10px;
  transition: background-color 0.3s ease;
  color: white;
  font-weight: bold;
}
li:hover {
  background-color: #21867a; /* Teinte plus foncée au survol */
}

a,
button {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #2a9d8f, #21867a); /* Dégradé vert */
  color: white;
  border-radius: 50px; /* Boutons arrondis */
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background-color 0.3s ease;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
a:hover,
button:hover {
  background-color: #21867a; /* Vert plus foncé */
  transform: scale(1.05);
}
.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.restaurant-section {
  margin-top: 30px;
  padding: 20px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.6);
}
.no-restaurant {
  font-style: italic;
  color: #444;
}
</style>
