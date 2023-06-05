const express = require('express');
const authController = require('../controllers/auth.controller');
const mealController = require('../controllers/meal.controller');
const router = express.Router();

// UC-301
router.post('', authController.validate, mealController.addMeal)
// UC-302
router.put('/:mealId', mealController.changeMeal)

// UC-303
router.get("/profile", mealController.getMeals)

// UC-304
router.get("/:mealId", mealController.getMealById)

// UC-305
router.delete("/:mealId", mealController.deleteMeal)


module.exports = router;