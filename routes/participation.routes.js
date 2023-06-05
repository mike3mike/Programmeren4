const express = require('express');
const authController = require('../controllers/auth.controller');
const participationController = require('../controllers/participation.controller');
const router = express.Router();

// UC-401
router.post("/meal/:mealId/participate", authController.validate, participationController.register)

// UC-402
router.delete("/:mealId", participationController.delete)

module.exports = router;