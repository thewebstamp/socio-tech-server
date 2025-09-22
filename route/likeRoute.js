import express from 'express';
import { checkLiked, Like, unLike } from '../controller/like.js';

const router = express.Router();

//Like a Post
router.post("/like", Like);
//Unlike a Post
router.delete("/unLike/:postId", unLike);
//Check if a Post is Liked
router.get("/Liked/:postId", checkLiked);

export default router;