import express from 'express';
import { editCover, editProfilePicture } from '../controller/edit.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

//Edit Cover Photo
router.put("/editCover", upload.array("image", 1), editCover);
//Edit Profile Picture
router.put("/editProfilePicture", upload.array("image", 1), editProfilePicture);

export default router;