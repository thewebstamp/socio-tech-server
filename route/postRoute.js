import express from 'express';
import { fetchUserPost, getPosts, userProfile } from '../controller/post.js';

const router = express.Router()

//Route to Fetch Posts in Home Page
router.get("/post", getPosts);
//Route to Fetch User Post in Profile Page
router.get("/fetchUserPost/:id", fetchUserPost);
// FETCH USER DETAILS FOR PROFILE
router.get("/userProfile/:id", userProfile)

export default router;