const express = require('express')
const router = express.Router()
const predictionController = require('../controllers/predictionController')
const { auth } = require('../middleware/authMiddleware')

// All prediction routes require authentication
router.use(auth)

// Train ML models with historical data
router.post('/train', predictionController.trainModels)

// Get predictions
router.post('/predict', predictionController.getPredictions)

// Check ML service health
router.get('/health', predictionController.checkHealth)

module.exports = router
