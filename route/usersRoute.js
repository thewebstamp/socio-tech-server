import express from 'express';
import { Users } from '../controller/users.js';

const router = express.Router();

// Fetch All Users I am not Connected to
router.get("/users", Users);

export default router;