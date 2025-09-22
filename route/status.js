import express from 'express';
import { Status, fetchStatus } from '../controller/status.js';
import { upload } from '../lib/upload.js';

const router = express.Router();

//Fetch Status Router
router.get("/fetchStatus", fetchStatus);
// Upload Status Router
router.post("/status", upload.array("image", 1), Status);

export default router;