const express = require("express");
const userRouter = express.Router();
const { userController } = require("../controllers/users");

userRouter.post("/addUser", userController.addUser);

module.exports = userRouter;
