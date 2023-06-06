const express = require('express');
const authController = require('../controllers/auth.controller');
const mealController = require('../controllers/meal.controller').mealController;
const participationController = require('../controllers/meal.controller').participationController;
const router = express.Router();

// UC-301
router.post('', authController.validate, mealController.addMeal)
// UC-302
router.put('/:mealId', authController.validate, mealController.changeMeal)

// UC-303
router.get("", mealController.getMeals)

// UC-304
router.get("/:mealId", mealController.getMealById)

// UC-305
router.delete("/:mealId", authController.validate, mealController.deleteMeal)

// UC-401
router.post("/:mealId/participate", authController.validate, participationController.register)

// UC-402
router.delete("/:mealId/participate", authController.validate, participationController.delete)


module.exports = router;