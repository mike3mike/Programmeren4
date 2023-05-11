const express = require('express');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.post('/login', authController.login, userController.login)

const userRouter = express.Router();
router.use('/user', userRouter);

// UC-201
userRouter.post('', userController.registerUser)
// UC-202
userRouter.get('', userController.getUserList)

// UC-203
userRouter.get("/profile", authController.login, userController.getProfile)

// UC-204
// userRouter.get("/:userId", authController.validate, userController.getProfileById)
userRouter.get("/:userId", authController.login, userController.getProfileById)
// UC-205
userRouter.put("/:userId", authController.login, userController.updateUser)
// UC-206
userRouter.delete("/:userId", authController.login, userController.deleteUser)


module.exports = userRouter;
module.exports = router;