import mongoose from "mongoose";
import Post from "../models/Post.js";

// POST /api/posts - CREATE
export async function createPost(req, res) {
  const { title, content } = req.body;
  if (typeof title !== "string" || !title.trim() ||
      typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const post = await Post.create({
    title: title.trim(),
    content: content.trim(),
    author: req.session.userId,
  });
  res.status(201).json({ message: "Post created", post });
}

// GET /api/posts - READ ALL
export async function getPosts(req, res) {
  const posts = await Post.find().sort({ createdAt: -1 }).populate("author", "name email");
  res.json({ count: posts.length, posts });
}

// GET /api/posts/:id - READ ONE
export async function getPost(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  const post = await Post.findById(req.params.id).populate("author", "name email");
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json({ post });
}

// PUT /api/posts/:id - UPDATE
export async function updatePost(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== req.session.userId) {
    return res.status(403).json({ message: "You can only edit your own posts" });
  }

  const { title, content } = req.body;
  if (title === undefined && content === undefined) {
    return res.status(400).json({ message: "Provide title or content to update" });
  }
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    post.title = title.trim();
  }
  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }
    post.content = content.trim();
  }

  await post.save();
  res.json({ message: "Post updated", post });
}

// DELETE /api/posts/:id - DELETE
export async function deletePost(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.author.toString() !== req.session.userId) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }

  await post.deleteOne();
  res.json({ message: "Post deleted" });
}
