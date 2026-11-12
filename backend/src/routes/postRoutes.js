import { Router } from "express";
import { requireLogin } from "../middleware/requireLogin.js";
import { createPost, getPosts, getPost, updatePost, deletePost } from "../controllers/postController.js";

const router = Router();
router.post("/", requireLogin, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.put("/:id", requireLogin, updatePost);
router.delete("/:id", requireLogin, deletePost);
export default router;
