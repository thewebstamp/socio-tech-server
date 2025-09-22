import express from 'express';
import { beginSignup, finishSignup, googleAuth, login, logout } from '../controller/auth.js';

const router = express.Router();

//Begin signup route
router.post("/beginSignup", beginSignup);
//Finish signup route
router.post("/finishSignup", finishSignup);
//Login route
router.post("/login", login);
//Logout route
router.post("/logout", logout);
//SIGNUP/LOGIN WITH GOOGLE
router.post("/google", googleAuth);

export default router;