import express from 'express';
import { createComment, fetchComment } from '../controller/comment.js';

const router = express.Router();

// Create Comment Route
router.post("/createComment", createComment);
// Fetch Comment Route
router.get("/fetchComment/:postId", fetchComment);

export default router;