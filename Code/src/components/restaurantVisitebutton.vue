<template>
  <div>
    <button class="review-button" @click="showReviewForm = true">📝 Review a Visit</button>
    <div v-if="showReviewForm" class="review-modal-overlay">
      <div class="review-modal">
        <div class="review-modal-header">
          <h2>📝 Review a Visit</h2>
          <button class="close-button" @click="showReviewForm = false">×</button>
        </div>
        <form @submit.prevent="submitReview" class="review-form">
          <div class="form-group">
            <label for="reviewDate">Date of the visit:</label>
            <input
              type="date"
              id="reviewDate"
              v-model="reviewData.date"
              required
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="reviewRating">Grade:</label>
            <div class="rating-input" id="reviewRating">
              <span
                v-for="star in 5"
                :key="star"
                @click="setRating(star)"
                class="star"
                :class="{ active: star <= reviewData.rating }"
                >★</span
              >
            </div>
          </div>
          <div class="form-group">
            <label for="reviewComment">Comment:</label>
            <textarea
              id="reviewComment"
              v-model="reviewData.comment"
              required
              class="form-textarea"
              placeholder="Share your thought..."
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="showReviewForm = false">
              Cancel
            </button>
            <button type="submit" class="submit-button">Finish</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { submitRestaurantReview } from '@/api/visitApi.js'

const props = defineProps({
  restaurantId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['review-submitted'])

const showReviewForm = ref(false)
const reviewData = ref({
  comment: '',
  rating: 0,
  date: new Date().toISOString().split('T')[0],
})

const submitReview = async () => {
  if (!reviewData.value.rating) {
    alert('Veuillez donner une note.')
    return
  }

  try {
    const formattedDate = new Date(reviewData.value.date).toISOString()
    const visitData = {
      restaurant_id: props.restaurantId,
      comment: reviewData.value.comment,
      rating: reviewData.value.rating,
      date: formattedDate,
    }
    const userId = '639bb14d2b5bb7844f42416c'
    await submitRestaurantReview(userId, visitData)
    showReviewForm.value = false

    emit('review-submitted')

    reviewData.value = {
      comment: '',
      rating: 0,
      date: new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'avis :", error)
    alert(`Erreur: ${error.message || "Une erreur est survenue lors de l'envoi de votre avis."}`)
  }
}

const setRating = (rating) => {
  reviewData.value.rating = rating
}
</script>

<style scoped>
.review-button {
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

.review-button:hover {
  background-color: #21867a;
}

.review-modal-overlay {
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

.review-modal {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.review-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #2a9d8f;
  color: white;
}

.review-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: white;
  border-bottom: none;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.review-form {
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.rating-input {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star.active {
  color: #ffc107;
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
  .review-modal {
    width: 95%;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
  }
}
</style>
