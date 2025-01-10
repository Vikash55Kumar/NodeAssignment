import { Router } from "express";
import { forgotPassword, getUser, login, logout, register } from "../controller/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(register);
router.route("/login").post(login)
router.route("/forgotPassword").post(verifyJWT, forgotPassword)
router.route("/getUserDetails").get(verifyJWT, getUser)
router.route("/logout").post(verifyJWT, logout)

export default router