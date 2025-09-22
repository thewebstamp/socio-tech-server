import express from 'express';
import { createPost } from '../controller/post.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

router.post("/posts", upload.array("images", 4), createPost);

export default router;