import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/userController.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireLogin, getMe);
router.post("/logout", requireLogin, logout);
export default router;
