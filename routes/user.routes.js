const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// UC-201
router.post('', userController.registerUser)
// UC-202
router.get('', userController.getUserList)

// UC-203
router.get("/profile", userController.getProfile)

// UC-204
router.get("/:userId", userController.getProfileById)
// UC-205
router.put("/:userId", userController.updateUser)
// UC-206
router.delete("/:userId", userController.deleteUser)

module.exports = router;